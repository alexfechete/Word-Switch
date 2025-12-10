import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const database = window.firebaseDatabase;

const createRoomBtn = document.getElementById("create-game-btn");

createRoomBtn.addEventListener("click", () => {
    const roomName = document.getElementById("room-name-input").value;
    const maxPlayers = document.getElementById("max-players-select").value;
    const rounds = document.getElementById("max-rounds-select").value;
    const time = document.getElementById("max-time-select").value;
    const privacy = document.getElementById("privacy").value;
    const password = document.getElementById("password").value;

    const newRoomRef = push(ref(database, "rooms"));
    set(newRoomRef, {
        host: window.playerName,
        settings: { roomName, maxPlayers, rounds, time, privacy, password },
        players: { [window.playerName]: { ready: false, score: 0 } },
        started: false
    });

    window.location.href = `game.html?room=${newRoomRef.key}`;
});
