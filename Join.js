import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const database = window.firebaseDatabase;
const roomsList = document.getElementById("rooms-list");
const joinForm = document.getElementById("join-form");

// Show live rooms
const roomsRef = ref(database, "rooms");
onValue(roomsRef, snapshot => {
    const rooms = snapshot.val() || {};
    roomsList.innerHTML = "";
    for (let roomId in rooms) {
        const room = rooms[roomId];
        const li = document.createElement("li");
        li.textContent = `${room.settings.roomName} — Players: ${Object.keys(room.players).length}`;
        const joinBtn = document.createElement("button");
        joinBtn.textContent = "Join";
        joinBtn.onclick = () => joinRoom(roomId, room);
        li.appendChild(joinBtn);
        roomsList.appendChild(li);
    }
});

function joinRoom(roomId, room) {
    if(room.settings.privacy === "private") {
        const password = prompt("Enter room password");
        if(password !== room.settings.password) return alert("Wrong password!");
    }
    set(ref(database, `rooms/${roomId}/players/${window.playerName}`), { ready:false, score:0 });
    window.location.href = `game.html?room=${roomId}`;
}

// Manual join form
joinForm.addEventListener("submit", e => {
    e.preventDefault();
    const roomNameInput = document.getElementById("room-name").value;
    const roomPasswordInput = document.getElementById("room-password").value;
    const roomsSnapshot = Object.entries(roomsList.children);
    // Optional: Match manual input with existing room
});
