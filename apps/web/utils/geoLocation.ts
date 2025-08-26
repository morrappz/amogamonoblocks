export default function getUserLocation() {
  if ("geolocation" in navigator) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const result = await response.json();
            resolve({
              latitude,
              longitude,
              address: result.address,
            });
          } catch (error) {
            reject("Failed to fetch address");
            throw error;
          }
        },
        (error) => {
          reject("Geolocation error: " + error.message);
        }
      );
    });
  } else {
    return Promise.reject("Geolocation is not supported by this browser.");
  }
}
