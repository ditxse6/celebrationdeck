# Prerequisites & Development Setup

This is a **living document**. Whenever a new tool, runtime, or account/config dependency is introduced, add it here so the project can be picked up on a new or different PC with minimal friction.

Commands below are for **Windows (PowerShell)** using `winget`. Equivalents exist for macOS/Linux (Homebrew, apt, official installers) if needed.

## Required tools

| Tool | Purpose | Verify | Install (winget) |
|---|---|---|---|
| Git | Version control | `git --version` | `winget install --id Git.Git -e` |
| Node.js (LTS) | Frontend + Functions runtime, npm | `node --version` / `npm --version` | `winget install --id OpenJS.NodeJS.LTS -e` |
| GitHub CLI | Repo/auth operations | `gh --version` | `winget install --id GitHub.cli -e` |

### Known-good versions (last verified 2026-07-09)

- Git 2.55.x
- Node.js v24.18.0 (LTS), npm 11.16.0
- GitHub CLI 2.96.0

> After installing via winget, open a **new** terminal so the tools are on your PATH.

## Tools to be added later (as the project grows)

These will be installed when the relevant workstream begins; entries will be filled in with exact commands at that time.

- **Azure Functions Core Tools** — run the Functions API locally.
- **Azure Static Web Apps CLI (`swa`)** — run the full app (frontend + API + emulated auth) locally.
- **Azure CLI (`az`)** — provision/manage Azure resources (used with Bicep).

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

_To be added as the frontend/api scaffolding lands (install, dev server, build, local SWA, deploy)._
