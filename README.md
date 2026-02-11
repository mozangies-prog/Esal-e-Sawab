
# Esal-e-Sawab Collective Tracker

A production-ready spiritual platform for tracking collective recitations.

## 🚀 Deployment to Railway

1. **Connect Repository**: Connect your GitHub repository to Railway.
2. **Environment Variables**: 
   - Add `API_KEY` in the **Variables** tab for Gemini AI features.
3. **Build Settings**: 
   - Railway will detect `package.json` and use `npm run build` (Vite).
   - The build output will be in the `dist/` folder.
4. **Start Command**: 
   - The app uses `npm start` which runs `serve -s dist`.

## 🛠 Why Vite?

- **Fixes MIME Errors**: Browsers cannot read `.tsx` files. Vite transpiles them to valid `.js` modules with correct MIME types.
- **Production Tailwind**: Generates an optimized, small CSS bundle instead of using the heavy development CDN.
- **Zero-Config Routing**: `HashRouter` combined with `serve -s` ensures the app never 404s on page refresh.

## 📦 Troubleshooting

- **Blank Screen**: Check the browser console. If you see "process is not defined", Vite has already handled this via `define` or `import.meta.env`, but we use `process.env.API_KEY` which Vite handles automatically when configured via environment variables.
- **MIME Type Error**: Resolved. Files are now served as `application/javascript` from the `dist` folder.
