# CelebrationDeck

A web app for building the **Closing Celebration** slideshow for Destination Imagination® (DI) tournaments. A user uploads the results export (CSV) from the DI Scoring Program, optionally uploads related asset files and a special-awards export, configures a few options, and the app generates a slideshow that reveals the results.

> Status: **early development (Phase 1)** — standing up the framework, Azure infrastructure, authentication/access control, and the overall user experience. The actual CSV processing and slideshow generation are intentionally stubbed for now.

CelebrationDeck is an independent tool and is **not affiliated with, endorsed by, or sponsored by Destination Imagination, Inc.** It uses no DI logos or marks; "Destination Imagination" is referenced only to describe what the tool is for.

## About this repository

This project is published publicly **primarily for collaboration and visibility** — pull requests and issues are welcome. It is **not** intended as a turnkey product for you to copy and run yourself.

If you *do* want to run your own instance:

- Remember it is licensed under **AGPL-3.0** (see [License](#license)) — among other things, if you host a modified version, you must make your source available. See also the additional terms in [NOTICE](NOTICE).
- **No support is provided.** Environment-specific setup is on you, and help getting it working in your own environment won't be provided.
- The author would genuinely appreciate an **email letting him know you're using it and how** — see contact below.

## Tech stack

- Frontend: React + Vite + TypeScript (internationalized; English first)
- API: Azure Functions (TypeScript)
- Hosting: Azure Static Web Apps (Free tier)
- Storage: Azure Blob + Table Storage
- Auth: Microsoft Entra ID via Static Web Apps built-in authentication

## Repository layout

```
frontend/   React + Vite + TS app (user + admin UI)
api/         Azure Functions (TypeScript) backend
infra/       Bicep infrastructure-as-code
docs/        Project docs, including PREREQUISITES.md (dev setup)
```

## Getting started (development)

See **[docs/PREREQUISITES.md](docs/PREREQUISITES.md)** for the full list of tools and setup steps needed to work on this project (including on a fresh machine).

## License

Licensed under the **GNU Affero General Public License v3.0** — see [LICENSE](LICENSE). Additional terms under AGPL-3.0 section 7 (attribution preservation and change-marking) are in [NOTICE](NOTICE).

Copyright (C) 2026 Dustin Loftis.

## Contact / attribution

Created and maintained by [Dustin Loftis](mailto:dustin.loftis@ditxse6.org) — [TXCPSO, Southeast 6 Region](https://ditxse6.org/).

If you deploy, adapt, or are considering adopting this project, please reach out.
