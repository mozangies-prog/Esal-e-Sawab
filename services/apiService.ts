
import { logger } from "./logger";

const API_BASE = (process.env.VITE_API_URL || '').replace(/\/$/, '') || "/api";

export const apiService = {
  /**
   * Fetches stats. Returns error object if server reports a DB failure.
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error, detail: data.detail };
      }
      return data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Fetches contributions.
   */
  async getContributions() {
    try {
      const response = await fetch(`${API_BASE}/contributions`);
      const data = await response.json();
      if (!response.ok) return null;
      return data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Posts contribution.
   */
  async postContribution(contribution: any) {
    try {
      const response = await fetch(`${API_BASE}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribution)
      });
      
      if (!response.ok) {
        const data = await response.json();
        logger.error("Sync Error:", data.detail || data.error);
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
};
