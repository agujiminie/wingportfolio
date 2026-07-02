# Wing Zeng Portfolio

Single-page portfolio for AI product design, motion-led interaction studies, and experimental digital craft.

## Stack

- React 19
- Vite 7
- Tailwind CSS 4 + custom responsive CSS
- GSAP + canvas-based morph interaction
- Three.js / React Three Fiber for 3D scenes

## Running on a new device

### 1. Install prerequisites

The only required install is **Node.js** (version 20 or newer — this project was last run on Node 25). npm ships with Node.

- **macOS**: `brew install node` — or download the installer from <https://nodejs.org>
- **Windows**: download the installer from <https://nodejs.org>
- **Linux**: use your package manager or <https://nodejs.org>

Verify with:

```bash
node --version   # should print v20.x or higher
npm --version
```

### 2. Install project dependencies

This folder intentionally does **not** include `node_modules/` (third-party packages, ~400 MB). Recreate it from `package.json`:

```bash
cd portfolio-website
npm install
```

This is a one-time step per device (repeat only if `package.json` changes).

### 3. Run the dev server (local preview)

```bash
npm run dev
```

Then open **http://localhost:3000** in a browser. The port is fixed (`strictPort`) in `vite.config.js`; if 3000 is taken, either free it or change `server.port` there.

## Hosting for real (production)

### Build

```bash
npm run build
```

This outputs a fully static site into `dist/` — plain HTML/CSS/JS plus assets. **No server-side runtime is needed to host it**; any static file host works.

To sanity-check the build locally before deploying:

```bash
npm run preview   # serves dist/ at http://localhost:3000
```

### Deploy options (pick one)

- **Vercel / Netlify** (easiest): connect the git repo or drag-and-drop the `dist/` folder in their dashboard. Build command `npm run build`, output directory `dist`. Both have free tiers and give you a URL + HTTPS automatically.
- **GitHub Pages**: push the repo to GitHub, then use a Pages action that runs `npm run build` and publishes `dist/`.
- **Your own server (nginx, etc.)**: copy the contents of `dist/` to the web root. This is a single-page app, so if internal routes ever 404, configure the server to fall back to `index.html`.

### Things to know before deploying

- The site is fully static — there are no environment variables, API keys, databases, or backend services to configure.
- `public/` contains large PNG image sequences (morphing animations), so the deployed site is asset-heavy (~1 GB in the repo; the built `dist/` includes what the site references). Hosts with a CDN (Vercel/Netlify/Pages) handle this fine, but the first deploy upload can take a while.
- Fonts (Geist) are bundled via npm — nothing external to install.

## Notes

- Optimized art assets are used for the primary scene renders to keep the production bundle lighter.
- Root-level export artifacts are ignored so the repo stays focused on the portfolio source.
- The working repo lives at `~/Documents/port-codex-upload`; the folder under `~/Desktop/wingzengying_e/portfolio-website` is a portable snapshot of it (including git history — `git log` works in either).
