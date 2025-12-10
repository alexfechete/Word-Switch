<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDh8YHXxt7XcXcgnhpMDohysv6w9vMUjHI",
    authDomain: "word-switch-806bd.firebaseapp.com",
    projectId: "word-switch-806bd",
    storageBucket: "word-switch-806bd.firebasestorage.app",
    messagingSenderId: "675507969336",
    appId: "1:675507969336:web:b1e5e49c7c0f6fe87675cd",
    measurementId: "G-6T9HQT5H18"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  // Rooms reference
  const roomsRef = ref(database, 'rooms');

  // Create room
  function createRoom(roomName, playerName) {
      const newRoomRef = push(roomsRef);
      set(newRoomRef, {
          host: playerName,
          players: { [playerName]: true },
          started: false,
          roomName: roomName
      });
  }

  // Listen for room changes
  onValue(roomsRef, (snapshot) => {
      const rooms = snapshot.val();
      console.log(rooms); // Here you update the HTML list of rooms
  });

</script>