// TODO: Implement Worldcoin Mini-App specific utilities
// - Check if running in mini-app context
// - Handle mini-app specific navigation
// - Integrate with Worldcoin APIs

export function isMiniApp(): boolean {
  // Check if running in Worldcoin Mini-App
  if (typeof window === "undefined") return false;

  // For development/testing - check URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const isTestMode =
    urlParams.get("miniapp") === "true" ||
    localStorage.getItem("miniapp-mode") === "true";

  if (isTestMode) return true;

  // Check for World ID mini-app specific indicators
  return (
    window.location.hostname.includes("worldcoin") ||
    window.location.hostname.includes("minikit") ||
    // Check for MiniKit presence
    "MiniKit" in window ||
    // Check for World ID specific user agent or referrer
    navigator.userAgent.includes("WorldApp") ||
    document.referrer.includes("worldcoin")
  );
}

// Removed unused getMiniAppContext function
