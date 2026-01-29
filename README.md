# PortKiller

Aplicativo desktop multiplataforma para monitorar portas abertas e encerrar processos. Interface minimalista e moderna.

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8)
![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-green)

## Funcionalidades

- Listar todas as portas abertas (TCP/UDP)
- Busca em tempo real por porta, processo ou endereço
- Filtros avançados (protocolo, estado, processos do sistema)
- Encerrar processos com confirmação
- Auto-refresh a cada 5 segundos
- Ordenação por qualquer coluna
- Interface dark mode

## Plataformas Suportadas

| Plataforma | Comando de Portas | Comando Kill |
|------------|-------------------|--------------|
| Windows | `netstat -ano` | `taskkill /PID` |
| Linux | `ss -tulnp` | `kill -9` |
| macOS | `lsof -iTCP -iUDP` | `kill -9` |

## Download

Baixe a versão mais recente na [página de Releases](../../releases).

| Plataforma | Arquivo |
|------------|---------|
| Windows | `.msi` ou `.exe` |
| macOS (Apple Silicon) | `-aarch64.dmg` |
| macOS (Intel) | `-x64.dmg` |
| Linux | `.deb` ou `.AppImage` |

## Desenvolvimento

### Pré-requisitos

- **Node.js** 18+ ([nodejs.org](https://nodejs.org/))
- **Rust** ([rustup.rs](https://rustup.rs/))
- **pnpm** (`npm install -g pnpm`)

#### Linux (dependências adicionais)

```bash
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Instalação

```bash
git clone https://github.com/seu-usuario/portKiller.git
cd portKiller
pnpm install
```

### Executar em modo desenvolvimento

```bash
# Windows (se Rust não está no PATH)
.\run-dev.bat

# Ou diretamente
pnpm tauri dev
```

### Build para produção

```bash
# Windows
.\build.bat

# Ou diretamente
pnpm tauri build
```

Os instaladores serão gerados em `src-tauri/target/release/bundle/`.

## Estrutura do Projeto

```
portKiller/
├── src/                      # Frontend React
│   ├── components/
│   │   ├── PortTable.tsx     # Tabela de portas
│   │   ├── SearchBar.tsx     # Campo de busca
│   │   ├── FilterBar.tsx     # Filtros avançados
│   │   ├── KillButton.tsx    # Botão encerrar processo
│   │   └── StatusBar.tsx     # Barra de status
│   ├── hooks/
│   │   └── usePortData.ts    # Hook para dados de portas
│   ├── types/
│   │   └── port.ts           # Tipos TypeScript
│   ├── App.tsx               # Componente principal
│   └── index.css             # Estilos Tailwind
│
├── src-tauri/                # Backend Rust
│   ├── src/
│   │   ├── main.rs           # Entry point
│   │   └── lib.rs            # Comandos Tauri (multiplataforma)
│   ├── Cargo.toml            # Dependências Rust
│   └── tauri.conf.json       # Configuração Tauri
│
├── .github/workflows/        # CI/CD
│   └── release.yml           # Build automático multiplataforma
│
├── build.bat                 # Script de build (Windows)
├── run-dev.bat               # Script de dev (Windows)
└── package.json              # Dependências Node
```

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `F5` | Atualizar lista de portas |
| `Escape` | Limpar campo de busca |

## CI/CD - Build Automático

O projeto usa GitHub Actions para compilar automaticamente para todas as plataformas.

### Criar uma release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Isso dispara o workflow que:
1. Compila para Windows, macOS (Intel + Apple Silicon) e Linux
2. Cria um draft de release com todos os binários

## Tecnologias

- **Tauri 2** - Framework desktop multiplataforma (Rust + WebView)
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 3** - Estilização
- **Lucide React** - Ícones
- **sysinfo** (Rust) - Informações de processos
- **regex** (Rust) - Parsing de saída de comandos
- **tokio** (Rust) - Async runtime

## Licença

MIT
