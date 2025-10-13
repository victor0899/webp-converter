# Guía de Versionado

Este documento explica cómo gestionar las versiones de la aplicación WebP Converter.

## Versión Actual

La versión actual de la aplicación se muestra en el footer de la interfaz y se toma automáticamente del `package.json`.

## Sistema de Versionado

Utilizamos [Semantic Versioning (SemVer)](https://semver.org/lang/es/):

- **MAJOR** (1.x.x): Cambios incompatibles con versiones anteriores
- **MINOR** (x.1.x): Nueva funcionalidad compatible con versiones anteriores
- **PATCH** (x.x.1): Correcciones de errores compatibles con versiones anteriores

## Cómo Actualizar la Versión

### Opción 1: Usando scripts npm (Recomendado)

```bash
# Para correcciones de errores (1.0.0 → 1.0.1)
pnpm run version:patch

# Para nuevas funcionalidades (1.0.0 → 1.1.0)
pnpm run version:minor

# Para cambios importantes/breaking changes (1.0.0 → 2.0.0)
pnpm run version:major
```

### Opción 2: Manual

Si prefieres actualizar manualmente, debes cambiar la versión en **3 archivos**:

1. `package.json` - línea 4
2. `src-tauri/tauri.conf.json` - línea 4
3. `src-tauri/Cargo.toml` - línea 3

**Importante**: Asegúrate de que la versión sea idéntica en los tres archivos.

## Workflow con Git

### Al hacer un commit con nueva versión:

```bash
# 1. Actualizar la versión
pnpm run version:patch  # o minor/major según corresponda

# 2. Hacer commit de los cambios
git add .
git commit -m "chore: bump version to v1.0.1"

# 3. Crear un tag (opcional pero recomendado)
git tag v1.0.1

# 4. Push con tags
git push origin main --tags
```

### Automatización con GitHub Actions (Futuro)

Para automatizar el versionado en cada merge a main, puedes:

1. Usar [conventional commits](https://www.conventionalcommits.org/) en tus mensajes de commit:
   - `fix:` → incrementa PATCH
   - `feat:` → incrementa MINOR
   - `BREAKING CHANGE:` → incrementa MAJOR

2. Configurar GitHub Actions con herramientas como:
   - [semantic-release](https://github.com/semantic-release/semantic-release)
   - [standard-version](https://github.com/conventional-changelog/standard-version)

## Ejemplo de Workflow de Desarrollo

```bash
# Desarrollo de nueva funcionalidad
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git commit -m "feat: agregar soporte para formato PNG"

# Al hacer merge a main
git checkout main
git merge feature/nueva-funcionalidad

# Actualizar versión antes del merge o después
pnpm run version:minor
git add .
git commit -m "chore: bump version to v1.1.0"
git tag v1.1.0
git push origin main --tags
```

## Verificar la Versión

Para verificar la versión actual:

```bash
# Desde npm
pnpm version

# Ver el tag más reciente en git
git describe --tags --abbrev=0

# O simplemente abrir la aplicación y ver el footer
pnpm tauri dev
```

## Notas

- La versión se muestra automáticamente en el footer de la aplicación
- No es necesario modificar el código frontend para actualizar la versión
- La versión se sincroniza automáticamente desde `tauri.conf.json` al compilar
