// TODO: Implement Worldcoin Mini-App specific utilities
// - Check if running in mini-app context
// - Handle mini-app specific navigation
// - Integrate with Worldcoin APIs

export function isMiniApp(): boolean {
  // Check if running in Worldcoin Mini-App
  if (typeof window === "undefined") return false;

  // Check for World ID mini-app specific indicators
  return (
    window.location.hostname.includes("worldcoin") ||
    window.location.hostname.includes("minikit") ||
    // Check for MiniKit presence
    typeof (window as any).MiniKit !== "undefined" ||
    // Check for World ID specific user agent or referrer
    navigator.userAgent.includes("WorldApp") ||
    document.referrer.includes("worldcoin")
  );
}

export function getMiniAppContext() {
  // Get mini-app specific context/data
  return {
    isMiniApp: isMiniApp(),
    version: "1.0.0",
  };
}
