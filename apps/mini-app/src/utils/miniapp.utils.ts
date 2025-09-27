// TODO: Implement Worldcoin Mini-App specific utilities
// - Check if running in mini-app context
// - Handle mini-app specific navigation
// - Integrate with Worldcoin APIs

export function isMiniApp(): boolean {
  // Check if running in Worldcoin Mini-App
  return (
    typeof window !== "undefined" &&
    window.location.hostname.includes("worldcoin")
  );
}

export function getMiniAppContext() {
  // Get mini-app specific context/data
  return {
    isMiniApp: isMiniApp(),
    version: "1.0.0",
  };
}
