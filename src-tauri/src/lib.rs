use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command;
use std::sync::Mutex;
use sysinfo::System;
use tauri::State;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PortInfo {
    pub protocol: String,
    pub local_address: String,
    pub local_port: u16,
    pub remote_address: String,
    pub remote_port: u16,
    pub state: String,
    pub pid: u32,
    pub process_name: String,
}

struct AppState {
    system: Mutex<System>,
}

#[cfg(windows)]
fn parse_address(addr: &str) -> (String, u16) {
    if let Some(last_colon) = addr.rfind(':') {
        let ip = &addr[..last_colon];
        let port = addr[last_colon + 1..].parse().unwrap_or(0);
        (ip.to_string(), port)
    } else {
        (addr.to_string(), 0)
    }
}

// Parse address for Unix systems (format: ip:port or ip.port)
#[cfg(unix)]
fn parse_unix_address(addr: &str) -> (String, u16) {
    // Handle formats like "127.0.0.1:8080" or "127.0.0.1.8080" or "*:80"
    if addr == "*:*" || addr == "0.0.0.0:*" {
        return ("0.0.0.0".to_string(), 0);
    }

    if let Some(last_colon) = addr.rfind(':') {
        let ip = &addr[..last_colon];
        let port_str = &addr[last_colon + 1..];
        let port = if port_str == "*" { 0 } else { port_str.parse().unwrap_or(0) };
        (ip.replace("*", "0.0.0.0").to_string(), port)
    } else if let Some(last_dot) = addr.rfind('.') {
        // macOS format: 127.0.0.1.8080
        let ip = &addr[..last_dot];
        let port = addr[last_dot + 1..].parse().unwrap_or(0);
        (ip.to_string(), port)
    } else {
        (addr.to_string(), 0)
    }
}

#[cfg(windows)]
async fn get_ports_platform(process_names: &HashMap<u32, String>) -> Result<Vec<PortInfo>, String> {
    let output = tokio::task::spawn_blocking(|| {
        Command::new("netstat")
            .args(["-ano"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?
    .map_err(|e| format!("Failed to execute netstat: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Windows netstat format: Proto  Local Address  Foreign Address  State  PID
    let line_regex = Regex::new(r"^\s*(TCP|UDP)\s+(\S+)\s+(\S+)\s+(\S+)?\s*(\d+)\s*$")
        .map_err(|e| format!("Regex error: {}", e))?;

    let mut ports: Vec<PortInfo> = Vec::new();

    for line in stdout.lines() {
        if let Some(caps) = line_regex.captures(line) {
            let protocol = caps.get(1).map_or("", |m| m.as_str()).to_string();
            let local_addr = caps.get(2).map_or("", |m| m.as_str());
            let remote_addr = caps.get(3).map_or("", |m| m.as_str());
            let state = caps.get(4).map_or("", |m| m.as_str()).to_string();
            let pid: u32 = caps.get(5).map_or("0", |m| m.as_str()).parse().unwrap_or(0);

            let (local_address, local_port) = parse_address(local_addr);
            let (remote_address, remote_port) = parse_address(remote_addr);

            let process_name = process_names
                .get(&pid)
                .cloned()
                .unwrap_or_else(|| "Unknown".to_string());

            ports.push(PortInfo {
                protocol,
                local_address,
                local_port,
                remote_address,
                remote_port,
                state,
                pid,
                process_name,
            });
        }
    }

    Ok(ports)
}

#[cfg(target_os = "linux")]
async fn get_ports_platform(process_names: &HashMap<u32, String>) -> Result<Vec<PortInfo>, String> {
    // Use ss command on Linux (faster than netstat)
    let output = tokio::task::spawn_blocking(|| {
        Command::new("ss")
            .args(["-tulnp"])
            .output()
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?
    .map_err(|e| format!("Failed to execute ss: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    // ss format: Netid State Recv-Q Send-Q Local Address:Port Peer Address:Port Process
    // Example: tcp LISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=1234,fd=3))
    let line_regex = Regex::new(r"^(tcp|udp)\s+(\S+)\s+\d+\s+\d+\s+(\S+)\s+(\S+)\s*(.*)$")
        .map_err(|e| format!("Regex error: {}", e))?;

    let pid_regex = Regex::new(r"pid=(\d+)")
        .map_err(|e| format!("Regex error: {}", e))?;

    let mut ports: Vec<PortInfo> = Vec::new();

    for line in stdout.lines().skip(1) { // Skip header
        if let Some(caps) = line_regex.captures(line) {
            let protocol = caps.get(1).map_or("", |m| m.as_str()).to_uppercase();
            let state = caps.get(2).map_or("", |m| m.as_str()).to_string();
            let local_addr = caps.get(3).map_or("", |m| m.as_str());
            let remote_addr = caps.get(4).map_or("", |m| m.as_str());
            let process_info = caps.get(5).map_or("", |m| m.as_str());

            let (local_address, local_port) = parse_unix_address(local_addr);
            let (remote_address, remote_port) = parse_unix_address(remote_addr);

            let pid: u32 = pid_regex
                .captures(process_info)
                .and_then(|c| c.get(1))
                .map_or(0, |m| m.as_str().parse().unwrap_or(0));

            let process_name = process_names
                .get(&pid)
                .cloned()
                .unwrap_or_else(|| "Unknown".to_string());

            ports.push(PortInfo {
                protocol,
                local_address,
                local_port,
                remote_address,
                remote_port,
                state,
                pid,
                process_name,
            });
        }
    }

    Ok(ports)
}

#[cfg(target_os = "macos")]
async fn get_ports_platform(process_names: &HashMap<u32, String>) -> Result<Vec<PortInfo>, String> {
    // Use lsof on macOS
    let output = tokio::task::spawn_blocking(|| {
        Command::new("lsof")
            .args(["-iTCP", "-iUDP", "-nP"])
            .output()
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?
    .map_err(|e| format!("Failed to execute lsof: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    // lsof format: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
    // Example: node 1234 user 22u IPv4 0x1234 0t0 TCP 127.0.0.1:3000 (LISTEN)
    let line_regex = Regex::new(r"^(\S+)\s+(\d+)\s+\S+\s+\S+\s+(IPv[46])\s+\S+\s+\S+\s+(TCP|UDP)\s+(\S+?)(?:->(\S+))?\s*\((\w+)\)?")
        .map_err(|e| format!("Regex error: {}", e))?;

    let mut ports: Vec<PortInfo> = Vec::new();

    for line in stdout.lines().skip(1) { // Skip header
        if let Some(caps) = line_regex.captures(line) {
            let process_name_raw = caps.get(1).map_or("", |m| m.as_str()).to_string();
            let pid: u32 = caps.get(2).map_or("0", |m| m.as_str()).parse().unwrap_or(0);
            let protocol = caps.get(4).map_or("", |m| m.as_str()).to_string();
            let local_addr = caps.get(5).map_or("", |m| m.as_str());
            let remote_addr = caps.get(6).map_or("*:*", |m| m.as_str());
            let state = caps.get(7).map_or("", |m| m.as_str()).to_string();

            let (local_address, local_port) = parse_unix_address(local_addr);
            let (remote_address, remote_port) = parse_unix_address(remote_addr);

            let process_name = process_names
                .get(&pid)
                .cloned()
                .unwrap_or(process_name_raw);

            ports.push(PortInfo {
                protocol,
                local_address,
                local_port,
                remote_address,
                remote_port,
                state,
                pid,
                process_name,
            });
        }
    }

    Ok(ports)
}

#[tauri::command]
async fn get_ports(state: State<'_, AppState>) -> Result<Vec<PortInfo>, String> {
    // Get process names
    let process_names: HashMap<u32, String> = {
        let mut sys = state.system.lock().map_err(|e| format!("Lock error: {}", e))?;
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
        sys.processes()
            .iter()
            .map(|(pid, process)| (pid.as_u32(), process.name().to_string_lossy().to_string()))
            .collect()
    };

    let mut ports = get_ports_platform(&process_names).await?;

    // Sort by local port
    ports.sort_by(|a, b| a.local_port.cmp(&b.local_port));

    Ok(ports)
}

#[cfg(windows)]
#[tauri::command]
async fn kill_process(pid: u32) -> Result<(), String> {
    if pid == 0 {
        return Err("Cannot kill system process (PID 0)".to_string());
    }

    let output = tokio::task::spawn_blocking(move || {
        Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?
    .map_err(|e| format!("Failed to execute taskkill: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to kill process: {}", stderr))
    }
}

#[cfg(unix)]
#[tauri::command]
async fn kill_process(pid: u32) -> Result<(), String> {
    if pid == 0 || pid == 1 {
        return Err("Cannot kill system process".to_string());
    }

    let output = tokio::task::spawn_blocking(move || {
        Command::new("kill")
            .args(["-9", &pid.to_string()])
            .output()
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?
    .map_err(|e| format!("Failed to execute kill: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to kill process: {}", stderr))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            system: Mutex::new(System::new()),
        })
        .invoke_handler(tauri::generate_handler![get_ports, kill_process])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
