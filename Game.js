import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const database = window.firebaseDatabase; // Assume Firebase already initialized
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room") || "test-room";
const playerName = window.playerName || "Player";

// DOM elements
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
const revealedSentenceDiv = document.getElementById('revealed-sentence');
const playerSubmissionsDiv = document.getElementById('player-submissions');
const scoresList = document.getElementById('scores-list');
const nextRoundBtn = document.getElementById('next-round');

// Game state
let round = 1;
let words = [], blanks = [], correctWords = [], fakeWords = {}, draggableWords = [];
let answers = {}, players = [], scores = {};

// Initialize room in Firebase if not exists
const roomRef = ref(database, `rooms/${roomId}`);
onValue(roomRef, snapshot => {
    const data = snapshot.val() || {};
    players = Object.keys(data.players || {});
    scores = data.scores || {};
    updateScores();
});

// Update scores
function updateScores() {
    scoresList.innerHTML = "";
    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p}: ${scores[p] || 0}`;
        scoresList.appendChild(li);
    });
}

// Round info
function updateRoundInfo() {
    roundNumber.textContent = round;
    currentPlayerSpan.textContent = players[round % players.length];
}
updateRoundInfo();

// Submit sentence (writer)
submitSentenceBtn.addEventListener('click', () => {
    const sentence = sentenceInput.value.trim();
    if (!sentence) return alert("Write a sentence!");
    words = sentence.split(" ");
    writerSection.style.display = "none";
    selectionSection.style.display = "block";

    // Show words to select
    wordsContainer.innerHTML = "";
    words.forEach(w => {
        const span = document.createElement('span');
        span.textContent = w;
        span.classList.add('word');
        span.addEventListener('click', () => span.classList.toggle('selected'));
        wordsContainer.appendChild(span);
    });
});

// Finish selection
finishSelectionBtn.addEventListener('click', () => {
    blanks = [];
    correctWords = [];
    wordsContainer.querySelectorAll('.word').forEach((span,i)=>{
        if(span.classList.contains('selected')){
            blanks.push(i);
            correctWords.push(span.textContent);
            span.textContent = "_____";
        }
    });
    if(blanks.length === 0) return alert("Select at least one word!");
    selectionSection.style.display = "none";
    fakeSection.style.display = "block";

    // Fake word inputs for other players
    fakeInputsDiv.innerHTML = "";
    fakeWords = {};
    players.forEach(p=>{
        if(p !== playerName){
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

// Submit fake words
submitFakesBtn.addEventListener('click', ()=>{
    fakeInputsDiv.querySelectorAll('input').forEach(input=>{
        const p = input.dataset.player;
        fakeWords[p][input.dataset.index] = input.value.trim();
    });
    fakeSection.style.display="none";
    dragSection.style.display="block";
    blanksContainer.innerHTML="";
    draggablesContainer.innerHTML="";
    answers = {};

    blanks.forEach((_,i)=>{
        const span = document.createElement('span');
        span.classList.add('blank');
        span.textContent = "_____";
        span.dataset.index = i;
        span.addEventListener('dragover', e=>e.preventDefault());
        span.addEventListener('drop', e=>{
            e.preventDefault();
            const word = e.dataTransfer.getData("text");
            span.textContent = word;
            answers[i] = word;
        });
        blanksContainer.appendChild(span);
    });

    // Draggable words
    draggableWords = [...correctWords];
    Object.values(fakeWords).forEach(arr=>draggableWords.push(...arr));
    draggableWords.sort(()=>Math.random()-0.5);
    draggableWords.forEach(word=>{
        const div = document.createElement('div');
        div.textContent = word;
        div.classList.add('draggable-word');
        div.draggable=true;
        div.addEventListener('dragstart', e=>e.dataTransfer.setData("text", word));
        draggablesContainer.appendChild(div);
    });
});

// Submit drag answers
submitDragBtn.addEventListener('click', ()=>{
    dragSection.style.display="none";
    resultsSection.style.display="block";

    // Reveal sentence
    const revealed = [...words];
    blanks.forEach((b,i)=>{
        const span = blanksContainer.children[i];
        revealed[b] = span.textContent;
    });
    revealedSentenceDiv.textContent = revealed.join(" ");

    // Player submissions
    playerSubmissionsDiv.innerHTML="";
    for(let p in fakeWords){
        playerSubmissionsDiv.innerHTML += `<p>${p}: ${fakeWords[p].join(", ")}</p>`;
    }

    // Score calculation (example)
    blanks.forEach((b,i)=>{
        const placedWord = blanksContainer.children[i].textContent;
        if(placedWord === correctWords[i]) scores[playerName] = (scores[playerName]||0)+1;
        for(let p in fakeWords){
            if(fakeWords[p][i] === placedWord) scores[p] = (scores[p]||0)+1;
        }
    });
    updateScores();
});

// Next round
nextRoundBtn.addEventListener('click', ()=>{
    round++;
    sentenceInput.value="";
    writerSection.style.display="block";
    selectionSection.style.display="none";
    fakeSection.style.display="none";
    dragSection.style.display="none";
    resultsSection.style.display="none";
    blanksContainer.innerHTML="";
    draggablesContainer.innerHTML="";
    playerSubmissionsDiv.innerHTML="";
    updateRoundInfo();
});
