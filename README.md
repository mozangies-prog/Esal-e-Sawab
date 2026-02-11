
# Esal-e-Sawab Collective Tracker

## 🌐 Solving the "Site Can't Be Reached" (NXDOMAIN) Error

If you see `DNS_PROBE_FINISHED_NXDOMAIN`, it means the link you are sharing is an internal Railway name, not a public website link. Follow these steps to get the correct link:

1.  Open your **Railway Dashboard**.
2.  Click on your **App Service**.
3.  Go to the **Settings** tab.
4.  Scroll down to the **Networking** section.
5.  Look for **Public Domain**. 
    - If there is no domain, click **"Generate Domain"**.
    - If there is a domain (e.g., `esal-sawab.up.railway.app`), **COPY THAT EXACT LINK**.
6.  Share this generated domain with others. The internal links containing `-production-xxxx` will often fail on other devices.

## 🛠 Setup Requirements

1.  **MySQL Database**: Ensure you have a MySQL service added to your Railway project.
2.  **Environment Variables**:
    - `MYSQL_URL`: (Added automatically if using Railway MySQL).
    - `API_KEY`: Your Google Gemini API Key for spiritual insights.
3.  **Port**: The app automatically uses `process.env.PORT` provided by Railway.

## 🚀 How it Works
- **Backend (`server.js`)**: A Node.js Express server that manages the MySQL database and serves the built frontend.
- **Frontend (`App.tsx`)**: A React application that communicates with the backend for real-time collective sync.
