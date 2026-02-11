# Esal-e-Sawab Collective Tracker

A production-ready, highly stable spiritual platform for tracking collective recitations. Designed for deployment on **Railway** and **GitHub Pages**.

## 🚀 One-Click Deployment to Railway

1. **GitHub Connection**: Push this code to your GitHub.
2. **Railway Service**: Create a new project on Railway and select your repository.
3. **Environment Variables**:
   - Go to **Variables** in Railway.
   - Add `API_KEY` (Get yours from [Google AI Studio](https://aistudio.google.com/app/apikey)).
4. **Build & Start Settings**:
   - Railway will automatically detect the `package.json`.
   - **Start Command**: `npm start` (uses `serve` to handle routing).

## 🛠 Stability Features

- **HashRouter Implementation**: Prevents the "404 on Refresh" common with static hosting.
- **Global Error Boundary**: Replaces blank screens with a user-friendly recovery UI.
- **Native ESM**: No complex build/compilation steps that often break in CI/CD.
- **Production Logger**: Detailed console logging for debugging production network and state issues.
- **CORS Handling**: Optimized for browser-to-API communication.

## 📦 Deployment File Structure

- `index.html`: Main entry with import maps.
- `App.tsx`: Central logic with production hardening.
- `services/logger.ts`: Production monitoring.
- `services/geminiService.ts`: Secure, error-handled AI integration.

## 🧪 Local Production Test

To test exactly how it will run on Railway:
```bash
npm install
npm run build
npm start
```

## ❓ Troubleshooting Blank Screens

- **ReferenceError: process is not defined**: This app uses a strict check for `process.env`. Ensure your hosting environment doesn't strip `process`.
- **Import Maps**: Some old browsers don't support import maps. This app is optimized for Chrome 89+, Safari 16.4+, and Firefox 108+.
- **Missing API Key**: If the AI insight is missing, check your `API_KEY` variable. The app will NOT crash if the key is missing; it will show a default message.
