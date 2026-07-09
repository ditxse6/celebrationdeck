# Infrastructure (Bicep)

Phase 1 infrastructure for CelebrationDeck. Cost-optimized: **Static Web Apps Free tier + one Storage account (Standard LRS, Cool)** — no always-on / hourly-billed resources, ~$0 at idle.

## What gets created

- **Azure Static Web App** (`celebrationdeck-swa-cus-prod`, Free tier) — hosts the frontend and the managed Functions API. Not linked to a repo here; CI/CD is wired separately (GitHub Actions) using the deployment token.
- **Storage account** (`celebrationdeckstcusprod`, StorageV2, **Standard ZRS**, default access tier **Hot**):
  - Zone-redundant (3 replicas across 3 availability zones) so data survives a single-AZ failure.
  - Blob container `assets` (private), with type-leading prefixes so lifecycle can target each (SAS-scoped by prefix at runtime).
  - Tables `users`, `seasons`, `tournaments`.
  - Lifecycle (never Archive; all tiers stay online/instant):
    - `assets/seasons/*` (global): Hot, then **Cold at ~13 months**.
    - `assets/users/*` (tournament uploads): Hot **30 days** → **Cool** (90 days) → **Cold** at day 120.
    - `assets/outputs/*` (generated decks): Hot **7 days** → **Cold** (short Hot window covers the fee-free immediate download; skips Cool to avoid its 30-day minimum).
- **SWA app settings** for the API: storage account name + connection string (key read at deploy time, never committed), container/table names, and `ADMIN_USER_IDS` (admin bootstrap).

## Files

- `main.bicep` — subscription-scoped entry point; creates the resource group and deploys `resources.bicep`.
- `resources.bicep` — the actual resources (resource-group scoped).
- `main.parameters.example.json` — committed example. Copy to `main.parameters.json` (gitignored) and fill in real values.

## Prerequisites

- Azure CLI (`az`) with the Bicep tooling. See `../docs/PREREQUISITES.md`.
- An Azure subscription and `az login`.

## Validate (no login required)

```powershell
az bicep build --file infra/main.bicep     # compile/lint to ARM JSON
```

## Deploy

```powershell
# 1) Copy and fill in real parameters (main.parameters.json is gitignored)
Copy-Item infra/main.parameters.example.json infra/main.parameters.json

# 2) Log in and select the subscription
az login
az account set --subscription "<your-subscription-id>"

# 3) Preview changes (what-if), then deploy at subscription scope
az deployment sub create --location centralus --template-file infra/main.bicep --parameters infra/main.parameters.json --what-if
az deployment sub create --location centralus --template-file infra/main.bicep --parameters infra/main.parameters.json
```

The deployment outputs `swaDefaultHostname` — point the Cloudflare CNAME (`celebrationdeck`, DNS-only / grey cloud) at it so SWA can issue its free managed TLS certificate.

## Notes

- `adminUserIds` is a comma-separated list of Entra (AAD) object IDs; find yours after first sign-in via `/.auth/me`. Keep real values only in the gitignored `main.parameters.json`.
- The storage account name is exactly 24 characters at the defaults (`celebrationdeckstcusprod`) — the Azure maximum — so changing `baseName`/`environmentName` may require shortening it.
- Static Web Apps is only available in select regions; `centralus` is supported.
