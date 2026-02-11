
# Esal-e-Sawab Collective Tracker

A production-ready spiritual platform for tracking collective recitations.

## 🚀 Deployment to Railway

1. **Connect Repository**: Connect your GitHub repository to Railway.
2. **Environment Variables**: 
   - Go to the **Variables** tab in your Railway project.
   - Add `API_KEY` and paste your Google Gemini API key.
3. **Build Command**: 
   - If using Vite: `npm run build`
   - If using a static setup: Ensure `index.html` is in the root.
4. **Start Command**: 
   - Use `serve -s .` or Railway's default static server.

## 🛠 Troubleshooting Blank Screens

If the app shows a blank screen on Railway:

1. **Check Console**: Open Browser DevTools (F12). Look for `ReferenceError: process is not defined`. This app handles this by checking `typeof process`.
2. **Missing API Key**: Ensure the `API_KEY` variable is set in the Railway dashboard.
3. **MIME Types**: Ensure your hosting service serves `.js` files with the correct `application/javascript` header.
4. **Import Maps**: This app uses Browser ESM. Ensure no build step is stripping the `<script type="importmap">` from `index.html`.

## 📦 Features
- Grid/List View Switching
- Compact, high-density UI
- LocalStorage persistence (Private)
- Global Error Boundary for stability
