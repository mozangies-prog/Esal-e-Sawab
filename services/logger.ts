/**
 * Production-grade logging utility.
 * In a real production environment, 'debug' logs are suppressed,
 * and errors could be sent to an external monitoring service.
 */

const IS_PRODUCTION = true; // Set to true for the final build

export const logger = {
  log: (...args: any[]) => {
    console.log("[ESAL-LOG]", new Date().toISOString(), ...args);
  },
  info: (...args: any[]) => {
    console.info("[ESAL-INFO]", new Date().toISOString(), ...args);
  },
  warn: (...args: any[]) => {
    console.warn("[ESAL-WARN]", new Date().toISOString(), ...args);
  },
  error: (...args: any[]) => {
    console.error("[ESAL-ERROR]", new Date().toISOString(), ...args);
    // You could integrate Sentry or LogRocket here
  },
  debug: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.debug("[ESAL-DEBUG]", ...args);
    }
  },
  // Specific for network request tracking as requested
  network: (method: string, url: string, status?: number) => {
    const message = `[NETWORK] ${method} ${url}${status ? ` - Status: ${status}` : ''}`;
    console.log(message);
  }
};