# Setup

Everything runs locally in your browser. No API keys, accounts, databases,
Docker, or paid services are required.

## Required tools

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 20 or newer (built on 22) | `node --version` |
| npm | 9 or newer | `npm --version` |
| Git | any recent | `git --version` |

### Install Node.js

- **Windows**: download the LTS installer from <https://nodejs.org/> or run
  `winget install OpenJS.NodeJS.LTS`.
- **macOS**: `brew install node` or the installer from nodejs.org.
- **Linux**: use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`.

## Commands

```bash
npm install          # install dependencies

npm run dev          # start the dev server (http://localhost:3000)
npm run build        # build the static production site into out/
npm run start        # serve the production build

npm run lint         # ESLint
npm run format       # Prettier (write)
npm run typecheck    # TypeScript, no emit

npm test             # unit, edge, property, and component tests
npm run test:watch   # tests in watch mode
npm run test:coverage# tests with coverage (thresholds enforced)
npm run test:perf    # 50k x 30 performance smoke test

npm run test:e2e:install   # one-time: download the Playwright browser
npm run test:e2e           # Playwright end-to-end + accessibility
```

## Default dev URL

<http://localhost:3000>

## Troubleshooting

**Port 3000 already in use.** Next.js will offer the next free port, or set one
explicitly:

```bash
# PowerShell
$env:PORT=3001; npm run dev
# bash
PORT=3001 npm run dev
```

**Wrong Node version.** If `node --version` is below 20, install Node 20+ (see
above). With nvm: `nvm install 20 && nvm use 20`, then delete `node_modules` and
reinstall.

**Install failures.** Clear and reinstall:

```bash
# PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json; npm install
# bash
rm -rf node_modules package-lock.json && npm install
```

If a corporate proxy blocks the npm registry, configure `npm config set proxy ...`
or use a mirror.

**Playwright browser download is slow or blocked.** The first
`npm run test:e2e:install` downloads ~200 MB of Chromium. On a slow or restricted
network this can take a while or fail. The unit/edge/property/component suite
(`npm test`) needs no browser and is the fastest feedback loop; the E2E tests run
in CI where the download is reliable.

**`next build` warns about `metadataBase`.** This is cosmetic. The URL is set in
`src/app/layout.tsx`; change it to your deployed domain.
