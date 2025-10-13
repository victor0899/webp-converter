# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri desktop application that converts images (PNG, JPEG, GIF, TIFF) to WebP format. The application uses a React frontend with TypeScript and a Rust backend via Tauri v2.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: Tauri 2.8 + Rust
- **Image Conversion**: cwebp binary (via Tauri sidecar)
- **Package Manager**: pnpm

## Development Commands

### Start Development Server
```bash
pnpm tauri dev
```
This runs both the Vite dev server (port 1420) and the Tauri application.

### Build for Production
```bash
pnpm tauri build
```
Creates a distributable application bundle in `src-tauri/target/release/bundle/`.

### Frontend Only (without Tauri)
```bash
pnpm dev        # Start Vite dev server on port 1420
pnpm build      # Build frontend to dist/
pnpm preview    # Preview production build
```

### Rust Backend
```bash
cd src-tauri
cargo build     # Build Rust backend
cargo check     # Check for compilation errors
cargo test      # Run Rust tests
```

## Architecture

### Frontend Architecture (src/)
- **App.tsx**: Main application component containing all conversion logic
  - Uses `react-dropzone` for drag-and-drop file handling
  - Manages conversion state and results display
  - Handles file I/O via Tauri plugin APIs
  - Executes cwebp binary via Tauri Command sidecar API

### Backend Architecture (src-tauri/)
- **lib.rs**: Main Tauri application setup
  - Initializes Tauri plugins: opener, shell, fs, dialog
  - Contains a sample `greet` command (currently unused)
- **main.rs**: Entry point that calls `run()` from lib.rs

### Key Integration Points

**External Binary Execution**: The app uses `Command.sidecar("binaries/cwebp", ...)` to run the WebP conversion binary. The binary is configured in `tauri.conf.json` under `bundle.externalBin` and must be platform-specific (e.g., `cwebp-aarch64-apple-darwin`).

**File System Flow**:
1. User drops/selects images via react-dropzone
2. Files are read as ArrayBuffer and written to temporary cache directory
3. User selects output location via Tauri dialog
4. cwebp sidecar command converts temp file to output location
5. Temporary files are cleaned up

**Tauri Plugins Used**:
- `@tauri-apps/plugin-shell`: Execute cwebp sidecar command
- `@tauri-apps/plugin-fs`: Read/write files, create directories
- `@tauri-apps/plugin-dialog`: Save file dialog
- `@tauri-apps/api/path`: Get app cache directory

### Important Configuration

**tauri.conf.json**:
- Dev server runs on port 1420 (fixed port required by Tauri)
- `externalBin` specifies the cwebp binary to bundle with the app
- Application window is 800x600 by default

**vite.config.ts**:
- Configured for Tauri development
- Ignores watching `src-tauri` directory to prevent rebuild loops
- Uses strict port 1420 for consistency with Tauri expectations

## Common Development Patterns

### Adding a New Tauri Command
1. Define command in `src-tauri/src/lib.rs` with `#[tauri::command]` attribute
2. Add to `invoke_handler` in the Tauri Builder
3. Call from frontend using `invoke()` from `@tauri-apps/api/core`

### Adding a New Tauri Plugin
1. Add to `Cargo.toml` dependencies
2. Add to `package.json` dependencies (if it has a JS component)
3. Initialize in `lib.rs` with `.plugin(plugin_name::init())`

### Working with External Binaries
- Binaries must be placed in `src-tauri/binaries/`
- Name format: `binary-name-{target-triple}` (e.g., `cwebp-aarch64-apple-darwin`)
- Register in `tauri.conf.json` under `bundle.externalBin`
- Execute via `Command.sidecar()` API

## Notes

- The quality slider UI is commented out (lines 183-200 in App.tsx) but the quality state is still tracked
- The cwebp command currently doesn't use the quality parameter - add `-q ${quality}` to the args array to enable it
- All file operations use Tauri's secure API instead of web APIs for cross-platform compatibility
