export default function getCurrentBrowser(): string {
  // If navigator is undefined (server-side), return a fallback
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  const userAgent = navigator.userAgent;

  if (userAgent.includes("Edg")) return "Microsoft Edge";
  if (userAgent.includes("Firefox")) return "Mozilla Firefox";
  if (userAgent.includes("Chrome")) return "Google Chrome";
  if (userAgent.includes("Safari")) return "Apple Safari";
  if (userAgent.includes("Opera")) return "Opera";

  return "Unknown"; // fallback if no match
}
