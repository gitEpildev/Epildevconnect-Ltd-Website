# Epildevconnect Ltd - Business Website

The official website of Epildevconnect Ltd (Company No. 17247566, registered in England and Wales), live at [developer.epildevconnect.uk](https://developer.epildevconnect.uk/).

Custom development, hosting and automation for creators, businesses and gaming communities, plus a live dashboard showing real-time Discord presence, music activity, coding stats and server metrics.

## Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Vite
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Integrations**: Discord (OAuth, bot, presence via Lanyard), Last.fm, WakaTime, GitHub API, OpenAI
- **Infrastructure**: Docker (multi-stage build), Cloudflare Tunnel, Nginx

## Development

```bash
npm install
npm run dev          # frontend on :1500, backend on :1600
```

Copy `.env.example` to `.env` and fill in the values. Run `npm run check-env` to verify.

## Production

Everything builds inside Docker; no local build needed:

```bash
docker compose build myhub
docker compose up -d
```

The compose stack runs three services: the app (frontend + API), PostgreSQL, and a Cloudflare tunnel.

## Useful scripts

| Command | What it does |
|---|---|
| `npm run build` | Type check and build the frontend |
| `npm run build:backend` | Compile the server TypeScript |
| `npm run check-env` | Verify required environment variables |
| `npm run generate-secret` | Generate a session secret |
| `npm run badges:update` | Refresh cached Discord badge images |

## House style

UK English only, no em or en dashes. CI enforces both (see `.github/workflows/language-check.yml`).

## Licence

MIT License with Additional Terms. See [LICENSE](LICENSE).

Attribution to Epildevconnect Ltd is required in any public use or derivative work. The "Epildev" and "Epildevconnect Ltd" names and branding may not be used without written permission.

## Contact

- Website: [developer.epildevconnect.uk/contact](https://developer.epildevconnect.uk/contact)
- Discord: Epildev
- GitHub: [@gitEpildev](https://github.com/gitEpildev)
