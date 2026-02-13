
import { logger } from "./logger";
import { Contribution, Descent } from "../types";

const API_BASE = (process.env.VITE_API_URL || '').replace(/\/$/, '') || "/api";

export const apiService = {
  async searchDescents(query: string): Promise<Descent[]> {
    try {
      const response = await fetch(`${API_BASE}/descents/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  async createDescent(name: string, location: string): Promise<Descent | null> {
    try {
      const response = await fetch(`${API_BASE}/descents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location })
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async getStats(familyId: string) {
    try {
      const response = await fetch(`${API_BASE}/stats/${familyId}`);
      const data = await response.json();
      if (!response.ok) return { error: data.error };
      return data;
    } catch (error) {
      return null;
    }
  },

  async getContributions(familyId: string) {
    try {
      const response = await fetch(`${API_BASE}/contributions/${familyId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async postContribution(contribution: Contribution) {
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
