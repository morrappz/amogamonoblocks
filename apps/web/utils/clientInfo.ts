import getUserLocation from "./geoLocation";
import getCurrentBrowser from "./getCurrentBrowser";
import getUserOS from "./getCurrentOS";

// client-only
export async function getClientInfo() {
  const browser = getCurrentBrowser();
  const os = getUserOS();
  const location = await getUserLocation();

  return {
    browser,
    os,
    location,
  };
}
