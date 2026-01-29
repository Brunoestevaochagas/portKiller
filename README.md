# PortKiller

A cross-platform desktop application to monitor open ports and kill processes. Minimal and modern interface.

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8)
![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-green)

## Features

- List all open ports (TCP/UDP)
- Real-time search by port, process, or address
- Advanced filters (protocol, state, system processes)
- Kill processes with confirmation
- Auto-refresh every 5 seconds
- Sortable columns
- Dark mode interface

## Supported Platforms

| Platform | Port Command | Kill Command |
|----------|--------------|--------------|
| Windows | `netstat -ano` | `taskkill /PID` |
| Linux | `ss -tulnp` | `kill -9` |
| macOS | `lsof -iTCP -iUDP` | `kill -9` |

## Download

Download the latest version from the [Releases page](https://github.com/Brunoestevaochagas/portKiller/releases).

| Platform | File |
|----------|------|
| Windows | `PortKiller_x.x.x_x64-setup.exe` or `.msi` |
| macOS (Apple Silicon) | `PortKiller_x.x.x_aarch64.dmg` |
| macOS (Intel) | `PortKiller_x.x.x_x64.dmg` |
| Linux | `portkiller_x.x.x_amd64.deb` or `.AppImage` |

## Development

### Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org/))
- **Rust** ([rustup.rs](https://rustup.rs/))
- **pnpm** (`npm install -g pnpm`)

#### Platform-specific dependencies

<details>
<summary><strong>Windows</strong></summary>

No additional dependencies required. Make sure Rust is in your PATH:

```powershell
# Add Rust to PATH permanently
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.cargo\bin", "User")
# Restart your terminal after running this command
```

</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
xcode-select --install
```

</details>

### Setup

```bash
# Clone the repository
git clone https://github.com/Brunoestevaochagas/portKiller.git
cd portKiller

# Install dependencies
pnpm install
```

### Running in Development

```bash
pnpm tauri dev
```

### Building for Production

```bash
pnpm tauri build
```

Installers will be generated in `src-tauri/target/release/bundle/`.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` | Refresh port list |
| `Escape` | Clear search |

## Project Structure

```
portKiller/
├── src/                          # React frontend
│   ├── components/
│   │   ├── PortTable.tsx         # Port data table
│   │   ├── SearchBar.tsx         # Search input
│   │   ├── FilterBar.tsx         # Advanced filters
│   │   ├── KillButton.tsx        # Kill process button
│   │   └── StatusBar.tsx         # Status bar
│   ├── hooks/
│   │   └── usePortData.ts        # Port data hook
│   ├── types/
│   │   └── port.ts               # TypeScript types
│   ├── App.tsx                   # Main component
│   └── index.css                 # Tailwind styles
│
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   └── lib.rs                # Tauri commands (cross-platform)
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
│
├── .github/workflows/            # CI/CD
│   └── release.yml               # Multi-platform build
│
└── package.json                  # Node dependencies
```

## CI/CD - Automated Builds

The project uses GitHub Actions to automatically build for all platforms.

### Creating a Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers a workflow that:
1. Builds for Windows, macOS (Intel + Apple Silicon), and Linux
2. Creates a draft release with all binaries at [Releases](https://github.com/Brunoestevaochagas/portKiller/releases)

## Tech Stack

- **Tauri 2** - Cross-platform desktop framework (Rust + WebView)
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icons
- **sysinfo** (Rust) - Process information
- **regex** (Rust) - Command output parsing
- **tokio** (Rust) - Async runtime

## License

MIT
