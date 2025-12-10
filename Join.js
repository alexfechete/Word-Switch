/** Join section **/
document.addEventListener('DOMContentLoaded', () => {

            // Mock rooms
            const rooms = [
                { name: "FunRoom1", players: 3 },
                { name: "CoolRoom42", players: 2 },
                { name: "EpicBattle", players: 5 }
            ];

            const roomsList = document.getElementById('rooms-list');

            // Display available rooms
            function displayRooms() {
                roomsList.innerHTML = '';
                rooms.forEach(room => {
                    const li = document.createElement('li');
                    li.textContent = `${room.name} — Players: ${room.players}`;

                    const joinBtn = document.createElement('button');
                    joinBtn.type = 'button';
                    joinBtn.textContent = 'Join';
                    joinBtn.onclick = () => {
                        alert(`Joining ${room.name}`);
                        // Later: window.location.href = `game.html?room=${room.name}`;
                    };

                    li.appendChild(joinBtn);
                    roomsList.appendChild(li);
                });
            }

            displayRooms();

            // Handle manual join form
            const joinForm = document.getElementById('join-form');
            joinForm.addEventListener('submit', (e) => {
                e.preventDefault(); // prevent page reload
                const roomName = document.getElementById('room-name').value;
                const roomPassword = document.getElementById('room-password').value;

                alert(`Trying to join room: ${roomName} with password: ${roomPassword}`);
                // Later: window.location.href = `game.html?room=${roomName}`;
            });

        });