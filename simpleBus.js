// ======================
// Firebase Configuration
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyBEQ69bVllyrtF-9KqIF8-Abqb5USLSc2M",

  authDomain: "finals-web-scrapping.firebaseapp.com",

  projectId: "finals-web-scrapping",

  storageBucket: "finals-web-scrapping.firebasestorage.app",

  messagingSenderId: "244706953536",

  appId: "1:244706953536:web:0f60eeea1744c9808a52a5",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let tripId = "trip_" + Date.now();
let tripData = {
  start_time: null,
  end_time: null,
  duration_seconds: 0,
  stops: [],
};
let startTime = null;

const status = document.getElementById("status");

// Start Trip
document.getElementById("startBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        startTime = new Date();
        tripData.start_time = startTime.toISOString();
        // Store start location
        tripData.start_location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: startTime.toISOString(),
        };
        status.innerText = `✅ Trip Started! Location: (${position.coords.latitude.toFixed(
          5
        )}, ${position.coords.longitude.toFixed(5)})`;
      },
      (err) => {
        console.error(err);
        alert("❌ Error getting start location");
      }
    );
  } else {
    alert("❌ Geolocation not supported!");
  }
});

// Record Stop
document.getElementById("stopBusBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString();
        tripData.stops.push({ lat: latitude, lng: longitude, timestamp });
        status.innerText = `🚌 Bus stop recorded at (${latitude.toFixed(
          5
        )}, ${longitude.toFixed(5)})`;
      },
      (err) => {
        console.error(err);
        alert("❌ Error getting location");
      }
    );
  } else {
    alert("❌ Geolocation not supported!");
  }
});

// Stop Trip
document.getElementById("stopBtn").addEventListener("click", async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const endTime = new Date();
        tripData.end_time = endTime.toISOString();
        // Store stop location
        tripData.stop_location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: endTime.toISOString(),
        };
        if (startTime) {
          tripData.duration_seconds = Math.round((endTime - startTime) / 1000);
        }
        try {
          await db.collection("trips").doc(tripId).set(tripData);
          const duration = formatDuration(tripData.duration_seconds);
          status.innerText = `✅ Trip Saved! Total Duration: ${duration}\nRoute: Start (${tripData.start_location.lat.toFixed(
            5
          )}, ${tripData.start_location.lng.toFixed(
            5
          )}) → Stop (${tripData.stop_location.lat.toFixed(
            5
          )}, ${tripData.stop_location.lng.toFixed(5)})`;
          alert(`Trip Saved! Total Duration: ${duration}`);
        } catch (err) {
          console.error("Error writing trip:", err);
        }
      },
      (err) => {
        console.error(err);
        alert("❌ Error getting stop location");
      }
    );
  } else {
    alert("❌ Geolocation not supported!");
  }
});

// Format duration nicely
function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}
