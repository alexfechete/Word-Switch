// Make sure your HTML script has type="module"
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Initialize Firebase in your HTML first
const database = getDatabase();

// Elements
const roomNameInput = document.getElementById('room-name-input');
const maxPlayersSelect = document.getElementById('max-players');
const maxRoundsSelect = document.getElementById('max-rounds');
const maxTimeSelect = document.getElementById('max-time');
const privacySelect = document.getElementById('privacy');
const passwordInput = document.getElementById('password');
const createRoomBtn = document.getElementById('create-room-btn');

// Show password input if private
privacySelect.addEventListener('change', () => {
    if (privacySelect.value === 'private') {
        document.getElementById('passwordWrapper').style.display = 'block';
    } else {
        document.getElementById('passwordWrapper').style.display = 'none';
    }
});

// Create Room
createRoomBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const roomName = roomNameInput.value.trim();
    if (!roomName) return alert("Please enter a room name");

    const newRoomRef = push(ref(database, 'rooms'));
    set(newRoomRef, {
        host: "HOST", // placeholder, will replace with actual player later
        roomName: roomName,
        maxPlayers: parseInt(maxPlayersSelect.value),
        maxRounds: parseInt(maxRoundsSelect.value),
        maxTime: parseInt(maxTimeSelect.value),
        privacy: privacySelect.value,
        password: passwordInput.value || null,
        started: false,
        players: {
            "HOST": true
        }
    }).then(() => {
        // Redirect to game.html with room key
        window.location.href = "Game.html?room=" + newRoomRef.key;
    }).catch(err => {
        console.error("Failed to create room:", err);
        alert("Failed to create room. Check console for details.");
    });
});
