document.addEventListener('DOMContentLoaded', () => {

    // Players
    const players = ["Player 1", "Player 2", "Player 3"];
    let scores = { "Player 1": 0, "Player 2": 0, "Player 3": 0 };

    // Game State
    let round = 1;
    let currentPlayerIndex = 0;
    let sentence = "";
    let words = [];
    let blanks = [];
    let correctWords = [];
    let fakeWords = {}; 
    let draggableWords = [];
    let answers = {}; // blank index -> word placed

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
    const scoresList = document.getElementById('scores-list');
    const nextRoundBtn = document.getElementById('next-round');

    // --- Utility Functions ---
    function updateRoundInfo() {
        roundNumber.textContent = round;
        currentPlayerSpan.textContent = players[currentPlayerIndex];
    }

    function updateScores() {
        scoresList.innerHTML = "";
        players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p}: ${scores[p]} pts`;
            scoresList.appendChild(li);
        });
    }

    updateRoundInfo();
    updateScores();

    // --- Submit Sentence ---
    submitSentenceBtn.addEventListener('click', () => {
        sentence = sentenceInput.value.trim();
        if (!sentence) return alert("Write a sentence!");
        words = sentence.split(" ");
        writerSection.style.display = "none";
        selectionSection.style.display = "block";

        wordsContainer.innerHTML = "";
        words.forEach((w) => {
            const span = document.createElement('span');
            span.textContent = w;
            span.classList.add('word');
            span.addEventListener('click', () => span.classList.toggle('selected'));
            wordsContainer.appendChild(span);
        });
    });

    // --- Finish Selection ---
    finishSelectionBtn.addEventListener('click', () => {
        blanks = [];
        correctWords = [];
        const spans = wordsContainer.querySelectorAll('.word');
        spans.forEach((span, i) => {
            if (span.classList.contains('selected')) {
                blanks.push(i);
                correctWords.push(span.textContent);
                span.textContent = "_____";
            }
        });
        if (blanks.length === 0) return alert("Select at least one word!");
        selectionSection.style.display = "none";

        // --- Prepare Fake Word Inputs ---
        fakeSection.style.display = "block";
        fakeInputsDiv.innerHTML = "";
        fakeWords = {};

        players.forEach((p, idx) => {
            if (idx !== currentPlayerIndex) {
                const div = document.createElement('div');
                div.innerHTML = `<h4>${p}'s fake words:</h4>`;
                fakeWords[p] = [];
                blanks.forEach((b, i) => {
                    const input = document.createElement('input');
                    input.placeholder = `Word for blank ${i + 1}`;
                    input.dataset.player = p;
                    input.dataset.index = i;
                    div.appendChild(input);
                });
                fakeInputsDiv.appendChild(div);
            }
        });
    });

    // --- Submit Fake Words ---
    submitFakesBtn.addEventListener('click', () => {
        const inputs = fakeInputsDiv.querySelectorAll('input');
        inputs.forEach(input => {
            const p = input.dataset.player;
            fakeWords[p][input.dataset.index] = input.value.trim();
        });

        fakeSection.style.display = "none";
        dragSection.style.display = "block";

        blanksContainer.innerHTML = "";
        draggablesContainer.innerHTML = "";
        answers = {};

        // --- Create blanks with full sentence ---
        words.forEach((w, i) => {
            const span = document.createElement('span');
            span.classList.add('word-span');
            if (blanks.includes(i)) {
                span.textContent = "_____";
                span.dataset.index = i;
                span.addEventListener('dragover', e => e.preventDefault());
                span.addEventListener('drop', e => {
                    e.preventDefault();
                    const word = e.dataTransfer.getData("text");
                    span.textContent = word;
                    answers[i] = word;
                });
            } else {
                span.textContent = w;
            }
            blanksContainer.appendChild(span);
        });

        // --- Prepare draggable words ---
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
    });

    // --- Submit Drag Answers & Enhanced Results ---
    submitDragBtn.addEventListener('click', () => {
        dragSection.style.display = "none";
        resultsSection.style.display = "block";

        // --- Clear previous results ---
        revealedSentenceP.innerHTML = "";
        const oldDetails = document.querySelector('#results-section div');
        if(oldDetails) oldDetails.remove();

        // --- Reveal original sentence ---
        const revealed = [...words];
        blanks.forEach(b => {
            const span = blanksContainer.querySelector(`span[data-index='${b}']`);
            if(span) revealed[b] = span.textContent;
        });
        revealedSentenceP.innerHTML = `<strong>Original sentence:</strong> ${revealed.join(" ")}`;

        // --- Show each other player's full sentence ---
        const detailsDiv = document.createElement('div');
        detailsDiv.innerHTML = `<h3>Player Attempts:</h3>`;

        players.forEach((p, idx) => {
            if(idx !== currentPlayerIndex){
                const playerLine = document.createElement('p');
                playerLine.innerHTML = `<strong>${p}:</strong> `;

                // Construct full sentence for this player
                const playerSentence = [...words];

                blanks.forEach((b, i) => {
                    const playerWord = fakeWords[p][i] || "[not filled]";
                    playerSentence[b] = playerWord;
                });

                // Display sentence word by word with color
                playerSentence.forEach((w, i) => {
                    let color = 'black';
                    if(blanks.includes(i)){
                        const blankIndex = blanks.indexOf(i);
                        const playerWord = fakeWords[p][blankIndex] || "[not filled]";
                        color = (playerWord === correctWords[blankIndex]) ? 'green' : 'red';
                    }
                    playerLine.innerHTML += `<span style="color:${color}">${w}</span> `;
                });

                detailsDiv.appendChild(playerLine);
            }
        });

        revealedSentenceP.parentNode.appendChild(detailsDiv);

        // --- Scoring ---
        blanks.forEach((b, i) => {
            const placedWord = blanksContainer.querySelector(`span[data-index='${b}']`).textContent;
            // Correct word → writer gets point
            if (placedWord === correctWords[i]) {
                scores[players[currentPlayerIndex]] += 1;
            }
            // Fake words → creator gets point
            for (let p in fakeWords) {
                if (fakeWords[p][i] === placedWord) scores[p] += 1;
            }
        });

        updateScores();
    });

    // --- Next Round ---
    nextRoundBtn.addEventListener('click', () => {
        round++;
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        sentenceInput.value = "";
        writerSection.style.display = "block";
        selectionSection.style.display = "none";
        fakeSection.style.display = "none";
        dragSection.style.display = "none";
        resultsSection.style.display = "none";
        revealedSentenceP.innerHTML = "";
        const oldDetails = document.querySelector('#results-section div');
        if(oldDetails) oldDetails.remove();
        updateRoundInfo();
    });

});