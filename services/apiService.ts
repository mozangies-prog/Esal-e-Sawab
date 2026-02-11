
import { logger } from "./logger";

/**
 * API_BASE determines where we send our data.
 * If VITE_API_URL is provided in Railway, we use it. 
 * Otherwise, we default to relative /api.
 */
const API_BASE = (process.env.VITE_API_URL || '').replace(/\/$/, '') || "/api";
const LOCAL_STORAGE_BACKUP = 'esal_sawab_offline_sync';

// Internal helper to handle local fallback data
const getLocalBackup = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_BACKUP);
    return data ? JSON.parse(data) : { grandTotal: 0, contributions: [] };
  } catch {
    return { grandTotal: 0, contributions: [] };
  }
};

export const apiService = {
  /**
   * Fetches stats. If MySQL is down, returns local data to keep UI functional.
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      // Silent fail - App.tsx handles the status change
      return null;
    }
  },

  /**
   * Fetches contributions.
   */
  async getContributions() {
    try {
      const response = await fetch(`${API_BASE}/contributions`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  /**
   * Posts contribution. If server fails, saves to a local queue (conceptually).
   */
  async postContribution(contribution: any) {
    try {
      const response = await fetch(`${API_BASE}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribution)
      });
      
      if (!response.ok) {
        logger.warn("MySQL Sync failed (Status " + response.status + "). Saving locally.");
        return false;
      }
      return true;
    } catch (error) {
      // Connection refused or timeout
      return false;
    }
  }
};
