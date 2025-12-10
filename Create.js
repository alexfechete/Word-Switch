import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const database = window.firebaseDatabase;

// Elements
const roomNameInput = document.getElementById('room-name');
const maxPlayersSelect = document.getElementById('max-players');
const maxRoundsSelect = document.getElementById('max-rounds');
const maxTimeSelect = document.getElementById('max-time');
const privacySelect = document.getElementById('privacy');
const passwordWrapper = document.getElementById('passwordWrapper');
const passwordInput = document.getElementById('password');
const createRoomBtn = document.getElementById('create-room-btn');

// Show/hide password input
privacySelect.addEventListener('change', () => {
    passwordWrapper.style.display = privacySelect.value === 'private' ? 'block' : 'none';
});

// Placeholder for playerName (set from index.html later)
let playerName = window.playerName || "HOST"; // default fallback

// Reference to rooms
const roomsRef = ref(database, 'rooms');

// Create Room function
function createRoom() {
    const roomName = roomNameInput.value.trim();
    if (!roomName) return alert("Enter a room name");

    const maxPlayers = parseInt(maxPlayersSelect.value);
    const maxRounds = parseInt(maxRoundsSelect.value);
    const maxTime = parseInt(maxTimeSelect.value);
    const privacy = privacySelect.value;
    const password = privacy === 'private' ? passwordInput.value : '';

    const newRoomRef = push(roomsRef);
    set(newRoomRef, {
        host: playerName,
        roomName,
        maxPlayers,
        maxRounds,
        maxTime,
        privacy,
        password,
        started: false,
        players: { [playerName]: true }
    });

    alert("Room created!");
    // Optional: redirect to game page
    // window.location.href = "game.html?room=" + newRoomRef.key;
}

// Attach event
createRoomBtn.addEventListener('click', createRoom);
