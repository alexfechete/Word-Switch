// Make sure your HTML script has type="module" if using Firebase imports
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Assuming Firebase app is already initialized in your HTML
const database = getDatabase();

// Elements
const createRoomBtn = document.getElementById('create-room-btn');
const roomNameInput = document.getElementById('room-name-input');
const maxPlayersSelect = document.getElementById('max-players');
const maxRoundsSelect = document.getElementById('max-rounds');
const maxTimeSelect = document.getElementById('max-time');
const privacySelect = document.getElementById('privacy');
const passwordInput = document.getElementById('password');

// Reference to rooms in Firebase
const roomsRef = ref(database, 'rooms');

// Example: you can replace this later with proper login
let playerName = "HOST"; // placeholder for host name

// Show/hide password input based on privacy
privacySelect.addEventListener('change', () => {
    if (privacySelect.value === 'private') {
        document.getElementById('passwordWrapper').style.display = 'block';
    } else {
        document.getElementById('passwordWrapper').style.display = 'none';
    }
});

// Create a room
createRoomBtn.addEventListener('click', (e) => {
    e.preventDefault(); // prevent link navigation

    const roomName = roomNameInput.value.trim();
    const maxPlayers = parseInt(maxPlayersSelect.value);
    const maxRounds = parseInt(maxRoundsSelect.value);
    const maxTime = parseInt(maxTimeSelect.value);
    const privacy = privacySelect.value;
    const password = passwordInput.value.trim();

    if (!roomName) return alert("Enter a room name");

    const newRoomRef = push(roomsRef);
    set(newRoomRef, {
        host: playerName,
        roomName: roomName,
        maxPlayers: maxPlayers,
        maxRounds: maxRounds,
        maxTime: maxTime,
        privacy: privacy,
        password: privacy === 'private' ? password : null,
        started: false,
        players: { [playerName]: true }
    }).then(() => {
        alert(`Room "${roomName}" created successfully!`);
        // Optionally redirect to game page here
        window.location.href = "Game.html?room=" + newRoomRef.key;
    }).catch(err => {
        console.error(err);
        alert("Error creating room");
    });
});
