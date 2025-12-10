import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const database = window.firebaseDatabase;

// Elements
const roomsList = document.getElementById('rooms-list');
const joinForm = document.getElementById('join-form');
const manualRoomName = document.getElementById('manual-room-name');
const manualRoomPassword = document.getElementById('manual-room-password');

// Player name from index.html
let playerName = window.playerName || "PLAYER";

// Firebase reference
const roomsRef = ref(database, 'rooms');

// Join a room by room ID
function joinRoom(roomId, room) {
    if (room.privacy === "private") {
        const password = prompt("Enter room password:");
        if (password !== room.password) return alert("Wrong password!");
    }

    const playerRef = ref(database, `rooms/${roomId}/players/${playerName}`);
    set(playerRef, true);
    alert(`Joined room "${room.roomName}"`);
    // Optional: redirect to game page
    // window.location.href = "game.html?room=" + roomId;
}

// Display live rooms
onValue(roomsRef, (snapshot) => {
    const rooms = snapshot.val();
    roomsList.innerHTML = '';

    if (!rooms) return;

    for (let roomId in rooms) {
        const room = rooms[roomId];

        if (room.started) continue; // skip started rooms

        const li = document.createElement('li');
        li.textContent = `${room.roomName} — Players: ${Object.keys(room.players).length}`;

        const joinBtn = document.createElement('button');
        joinBtn.textContent = 'Join';
        joinBtn.onclick = () => joinRoom(roomId, room);

        li.appendChild(joinBtn);
        roomsList.appendChild(li);
    }
});

// Manual join form
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const roomName = manualRoomName.value.trim();
    const password = manualRoomPassword.value;

    if (!roomName) return alert("Enter a room name");

    // Find room by name
    onValue(roomsRef, (snapshot) => {
        const rooms = snapshot.val();
        if (!rooms) return alert("No rooms found");

        let roomId = null;
        let roomData = null;

        for (let id in rooms) {
            if (rooms[id].roomName === roomName) {
                roomId = id;
                roomData = rooms[id];
                break;
            }
        }

        if (!roomId) return alert("Room not found");

        // Check password if private
        if (roomData.privacy === "private" && roomData.password !== password) {
            return alert("Incorrect password");
        }

        const playerRef = ref(database, `rooms/${roomId}/players/${playerName}`);
        set(playerRef, true);
        alert(`Joined room "${roomName}"`);
        // window.location.href = "game.html?room=" + roomId;
    }, { onlyOnce: true });
});
