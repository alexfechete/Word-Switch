import { ref, onValue, set, update, push, get, child } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const database = window.firebaseDatabase;

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");
if (!roomId) alert("No room specified!");

// DOM Elements
const roundNumber = document.getElementById('round-number');
const currentPlayerSpan = document.getElementById('current-player');
const writerSection = document.getElementById('writer-section');
const sentenceInput = document.getElementById('sentence-input');
const submitSentenceBtn = document.getElementById('submit-sentence');
const selectionSection = document.getElementById('selection-section');
const wordsContainer = document.getElementById('words-container');
const finishSelectionBtn = document.getElementById('finish-selection');
const fakeSection = document.getElementById('fake-word-section');
const fakeInputsDiv = document.getElementById('fake-word-inputs');
const submitFakesBtn = document.getElementById('submit-fakes');
const dragSection = document.getElementById('drag-section');
const blanksContainer = document.getElementById('blanks-container');
const draggablesContainer = document.getElementById('draggables-container');
const submitDragBtn = document.getElementById('submit-drag');
const resultsSection = document.getElementById('results-section');
const revealedSentenceP = document.getElementById('revealed-sentence');
const playerResultsDiv = document.getElementById('player-results');
const scoresList = document.getElementById('scores-list');
const nextRoundBtn = document.getElementById('next-round');

// Game State
let roomData = {};
let players = [];
let currentPlayerIndex = 0;
let round = 1;
let sentence = "";
let words = [];
let blanks = [];
let correctWords = [];
let fakeWords = {};
let draggableWords = [];
let answers = {};

// Firebase room reference
const roomRef = ref(database, `rooms/${roomId}`);

// Listen for room updates
onValue(roomRef, snapshot => {
    const data = snapshot.val();
    if (!data) return;
    roomData = data;
    players = Object.keys(roomData.players || {});
    updateScores();
});

// Utility functions
function updateScores() {
    scoresList.innerHTML = "";
    players.forEach(p => {
        const score = roomData.players[p]?.score || 0;
        const li = document.createElement('li');
        li.textContent = `${p}: ${score} pts`;
        scoresList.appendChild(li);
    });
}

function updateRoundInfo() {
    roundNumber.textContent = round;
    currentPlayerSpan.textContent = players[currentPlayerIndex];
}

// -------------------------
// Writer Section
// -------------------------
submitSentenceBtn.addEventListener('click', async () => {
    sentence = sentenceInput.value.trim();
    if (!sentence) return alert("Write a sentence!");
    words = sentence.split(" ");

    // Save sentence to Firebase
    await update(roomRef, { currentSentence: sentence, blanks: null, fakeWords: null, answers: null });

    // Show selection if current player
    if (players[currentPlayerIndex] === window.playerName) {
        writerSection.style.display = "none";
        selectionSection.style.display = "block";

        wordsContainer.innerHTML = "";
        words.forEach((w, i) => {
            const span = document.createElement('span');
            span.textContent = w;
            span.classList.add('word');
            span.addEventListener('click', () => span.classList.toggle('selected'));
            wordsContainer.appendChild(span);
        });
    } else {
        writerSection.style.display = "none";
        selectionSection.style.display = "none";
    }
});

// -------------------------
// Word Selection
// -------------------------
finishSelectionBtn.addEventListener('click', async () => {
    blanks = [];
    correctWords = [];
    const spans = wordsContainer.querySelectorAll('.word');
    spans.forEach((span, i) => {
        if (span.classList.contains('selected')) {
            blanks.push(i);
            correctWords.push(span.textContent);
        }
    });
    if (blanks.length === 0) return alert("Select at least one word!");

    // Save blanks & correctWords to Firebase
    await update(roomRef, { blanks, correctWords });

    selectionSection.style.display = "none";
    fakeSection.style.display = "block";

    // Prepare fake word inputs for other players
    fakeInputsDiv.innerHTML = "";
    fakeWords = {};
    players.forEach((p, idx) => {
        if (p !== window.playerName) {
            const div = document.createElement('div');
            div.innerHTML = `<h4>${p}'s fake words:</h4>`;
            fakeWords[p] = [];
            blanks.forEach((b,i)=>{
                const input = document.createElement('input');
                input.placeholder = `Word for blank ${i+1}`;
                input.dataset.player = p;
                input.dataset.index = i;
                div.appendChild(input);
            });
            fakeInputsDiv.appendChild(div);
        }
    });
});

// -------------------------
// Submit Fake Words
// -------------------------
submitFakesBtn.addEventListener('click', async () => {
    const inputs = fakeInputsDiv.querySelectorAll('input');
    inputs.forEach(input => {
        const p = input.dataset.player;
        fakeWords[p][input.dataset.index] = input.value.trim();
    });

    // Save fake words to Firebase
    await update(roomRef, { fakeWords });

    fakeSection.style.display = "none";
    prepareDragAndDrop();
});

// -------------------------
// Drag & Drop Section
// -------------------------
function prepareDragAndDrop() {
    dragSection.style.display = "block";
    blanksContainer.innerHTML = "";
    draggablesContainer.innerHTML = "";
    answers = {};

    blanks.forEach((b,i) => {
        const span = document.createElement('span');
        span.classList.add('blank');
        span.textContent = "_____";
        span.dataset.index = i;
        span.addEventListener('dragover', e => e.preventDefault());
        span.addEventListener('drop', e => {
            e.preventDefault();
            const word = e.dataTransfer.getData("text");
            span.textContent = word;
            answers[i] = word;
        });
        blanksContainer.appendChild(span);
    });

    // Draggable words = correct + all fake
    draggableWords = [...correctWords];
    Object.values(fakeWords).forEach(arr => draggableWords.push(...arr));
    draggableWords.sort(() => Math.random() - 0.5);

    draggableWords.forEach(word => {
        const div = document.createElement('div');
        div.textContent = word;
        div.classList.add('draggable-word');
        div.draggable = true;
        div.addEventListener('dragstart', e => e.dataTransfer.setData("text", word));
        draggablesContainer.appendChild(div);
    });
}

// -------------------------
// Submit Drag Answers
// -------------------------
submitDragBtn.addEventListener('click', async () => {
    dragSection.style.display = "none";
    resultsSection.style.display = "block";

    // Reveal sentence
    const revealed = [...words];
    blanks.forEach((b,i)=>{
        const span = blanksContainer.children[i];
        revealed[b] = span.textContent;
    });
    revealedSentenceP.textContent = revealed.join(" ");

    // Scoring
    const updates = {};
    blanks.forEach((b,i)=>{
        const placedWord = blanksContainer.children[i].textContent;
        // Correct word
        if(placedWord === correctWords[i]) {
            updates[`players/${window.playerName}/score`] = (roomData.players[window.playerName]?.score||0)+1;
        }
        // Fake word
        for(let p in fakeWords){
            if(fakeWords[p][i] === placedWord){
                updates[`players/${p}/score`] = (roomData.players[p]?.score||0)+1;
            }
        }
    });
    await update(roomRef, updates);

    // Show each player submission
    playerResultsDiv.innerHTML = "";
    players.forEach(p=>{
        if(p === window.playerName) return;
        const pDiv = document.createElement('div');
        const fake = fakeWords[p].map((w,i)=>`${w} ${w===correctWords[i] ? '(✔)' : '(✖)'}`).join(', ');
        pDiv.textContent = `${p}: ${fake}`;
        playerResultsDiv.appendChild(pDiv);
    });
    updateScores();
});

// -------------------------
// Next Round
// -------------------------
nextRoundBtn.addEventListener('click', async () => {
    round++;
    currentPlayerIndex = (currentPlayerIndex+1)%players.length;

    sentenceInput.value = "";
    writerSection.style.display = "block";
    selectionSection.style.display = "none";
    fakeSection.style.display = "none";
    dragSection.style.display = "none";
    resultsSection.style.display = "none";

    // Clear previous round Firebase data
    await update(roomRef, { currentSentence:null, blanks:null, correctWords:null, fakeWords:null, answers:null });

    updateRoundInfo();
});
