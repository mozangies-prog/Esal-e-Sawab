
import { logger } from "./logger";

// Base URL for your Railway API. Defaults to relative path for unified deployments.
const API_BASE = "/api";

export const apiService = {
  /**
   * Fetches the global statistics (Grand Total and per-recitation counts)
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) throw new Error("Stats fetch failed");
      return await response.json();
    } catch (error) {
      logger.error("API Error (getStats):", error);
      return null;
    }
  },

  /**
   * Fetches the latest global contributions for the activity log
   */
  async getContributions() {
    try {
      const response = await fetch(`${API_BASE}/contributions`);
      if (!response.ok) throw new Error("Contributions fetch failed");
      return await response.json();
    } catch (error) {
      logger.error("API Error (getContributions):", error);
      return [];
    }
  },

  /**
   * Sends a new contribution to the MySQL database
   */
  async postContribution(contribution: any) {
    try {
      const response = await fetch(`${API_BASE}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribution)
      });
      return response.ok;
    } catch (error) {
      logger.error("API Error (postContribution):", error);
      return false;
    }
  }
};
