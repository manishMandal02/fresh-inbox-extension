# Fresh Inbox (v2) - Minimal Extension Structure

This project has been refactored to a minimal Vanilla TypeScript + CSS architecture, removing React and other dependencies.

## Project Structure

```
/
├── dist/               # Built extension (load this in Chrome)
├── public/             # Static assets (manifest.json, icons)
├── src/
│   ├── background/     # Background service worker
│   │   └── index.ts
│   ├── content/        # Content scripts
│   │   └── index.ts
│   ├── popup/          # Extension popup
│   │   ├── index.html
│   │   └── index.ts
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

-   `npm install`: Install dependencies.
-   `npm run build`: Build the extension to `dist/`.
-   `npm run dev`: Build in watch mode.

## Loading in Chrome

1.  Run `npm run build`.
2.  Open `chrome://extensions`.
3.  Enable **Developer mode**.
4.  Click **Load unpacked**.
5.  Select the `dist` folder.