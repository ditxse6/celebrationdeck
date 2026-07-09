# Prerequisites & Development Setup

This is a **living document**. Whenever a new tool, runtime, or account/config dependency is introduced, add it here so the project can be picked up on a new or different PC with minimal friction.

Commands below are for **Windows (PowerShell)** using `winget`. Equivalents exist for macOS/Linux (Homebrew, apt, official installers) if needed.

## Required tools

| Tool | Purpose | Verify | Install (winget) |
|---|---|---|---|
| Git | Version control | `git --version` | `winget install --id Git.Git -e` |
| Node.js (LTS) | Frontend + Functions runtime, npm | `node --version` / `npm --version` | `winget install --id OpenJS.NodeJS.LTS -e` |
| GitHub CLI | Repo/auth operations | `gh --version` | `winget install --id GitHub.cli -e` |
| Azure CLI | Provision/manage Azure (Bicep) | `az version` | `winget install --id Microsoft.AzureCLI -e` |

The Bicep tooling ships with the Azure CLI; `az bicep build` will fetch it automatically on first use (or run `az bicep install`).

### Known-good versions (last verified 2026-07-09)

- Git 2.55.x
- Node.js v24.18.0 (LTS), npm 11.16.0
- GitHub CLI 2.96.0
- Azure CLI 2.88.0

> After installing via winget, open a **new** terminal so the tools are on your PATH.

## Tools to be added later (as the project grows)

These will be installed when the relevant workstream begins; entries will be filled in with exact commands at that time.

- **Azure Functions Core Tools** — run the Functions API locally.
- **Azure Static Web Apps CLI (`swa`)** — run the full app (frontend + API + emulated auth) locally.

## Accounts & one-time configuration

- **GitHub**: authenticate the CLI with `gh auth login` (GitHub.com, HTTPS, browser login). Repo: `ditxse6/celebrationdeck`.
- **Git identity**: this repo sets a local `user.name` / `user.email`; set your own with:
  ```powershell
  git config user.name "Your Name"
  git config user.email "you@example.com"
  ```
- **Azure**: (later) an Azure subscription is required to provision the Static Web App + Storage. Environment-specific values (subscription ID, resource names, connection strings, admin identity) are kept out of this repo.

## Project structure

```
frontend/   React + Vite + TS app
api/         Azure Functions (TypeScript)
infra/       Bicep IaC
docs/        This document and other project docs
```

## Common commands

Install dependencies (run once per folder, or after pulling dependency changes):

```powershell
cd frontend; npm install
cd ..\api; npm install
```

Frontend (React + Vite + TS):

```powershell
cd frontend
npm run dev      # local dev server (Vite) — auth is simulated; use the "dev role" selector in the header
npm run build    # type-check (tsc -b) + production build to frontend/dist
npm run preview  # preview the production build
npm run lint     # oxlint
```

> Running `npm run dev` alone does not provide real Static Web Apps auth. The header shows a **"dev role"** selector (dev builds only) so you can click through anonymous / unregistered / pending / denied / approved / admin states without signing in. For real emulated auth, use the SWA CLI (below) once installed.

API (Azure Functions, TypeScript):

```powershell
cd api
npm run build    # compile TypeScript to api/dist
npm start        # requires Azure Functions Core Tools (see below)
```

### Known-good versions (frontend, last verified 2026-07-09)

- Vite 8, React 19, TypeScript ~6.0 (frontend); `@azure/functions` v4, TypeScript 5.9 (api)
- Key libraries: react-router-dom 7, i18next 26 / react-i18next 17

## Notes for this environment

- **Windows sandbox:** on this machine the Cursor agent's shell sandbox (`workspace_readwrite`) is not supported, so shell commands must run with the sandbox disabled. This is an agent/runtime detail, not a project requirement.
