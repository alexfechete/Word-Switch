import { ref, set, push, onValue, update, getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Use the initialized database from HTML
const database = window.firebaseDatabase;

// Elements
const roomsList = document.getElementById('rooms-list');
const createRoomBtn = document.getElementById('create-room-btn');
const roomNameInput = document.getElementById('room-name-input');

// Ask player for a name (can replace with proper login later)
let playerName = prompt("Enter your name");

// Reference to rooms in Firebase
const roomsRef = ref(database, 'rooms');

// Create a room
function createRoom() {
    const roomName = roomNameInput.value.trim();
    if (!roomName) return alert("Enter a room name");

    const newRoomRef = push(roomsRef);
    set(newRoomRef, {
        host: playerName,
        players: { [playerName]: true },
        started: false,
        roomName: roomName
    });

    roomNameInput.value = '';
}

// Join a room
function joinRoom(roomId) {
    const playerRef = ref(database, `rooms/${roomId}/players/${playerName}`);
    set(playerRef, true);
}

// Listen for live room updates
onValue(roomsRef, (snapshot) => {
    const rooms = snapshot.val();
    roomsList.innerHTML = '';

    if (!rooms) return;

    for (let roomId in rooms) {
        const room = rooms[roomId];

        const li = document.createElement('li');
        li.textContent = `${room.roomName} — Players: ${Object.keys(room.players).length}`;

        const joinBtn = document.createElement('button');
        joinBtn.textContent = 'Join';
        joinBtn.onclick = () => joinRoom(roomId);
        li.appendChild(joinBtn);

        // Show "Start Game" button for host
        if (room.host === playerName && !room.started) {
            const startBtn = document.createElement('button');
            startBtn.textContent = 'Start Game';
            startBtn.onclick = () => {
                const roomRef = ref(database, `rooms/${roomId}`);
                update(roomRef, { started: true });
            };
            li.appendChild(startBtn);
        }

        roomsList.appendChild(li);
    }
});

// Attach event
createRoomBtn.addEventListener('click', createRoom);
