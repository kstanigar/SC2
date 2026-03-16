/**
 * SIMON SAYS GAME LOGIC
 */

const colors = ['green', 'red', 'yellow', 'blue'];
let sequence = [];
let playerSequence = [];
let gameScore = 0;
let bestScore = localStorage.getItem('simonBestScore') || 0;
let isPlaying = false;
let isPlayerTurn = false;

// DOM elements
let scoreDisplay, bestDisplay, messageDisplay, startBtn, colorBtns;

// Initialize game elements when modal opens
function initGameElements() {
    scoreDisplay = document.getElementById('game-score');
    bestDisplay = document.getElementById('game-best');
    messageDisplay = document.getElementById('game-message');
    startBtn = document.getElementById('start-game-btn');
    colorBtns = document.querySelectorAll('.color-btn');

    if (bestDisplay) {
        bestDisplay.textContent = bestScore;
    }

    // Start game button
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }

    // Handle player clicks and touches
    colorBtns.forEach(btn => {
        const handleInteraction = (e) => {
            if (!isPlayerTurn || !isPlaying) return;

            e.preventDefault(); // Prevent double-firing on mobile

            const color = btn.dataset.color;
            playerSequence.push(color);
            flashColor(color);

            checkSequence();
        };

        // Support both click and touch events
        btn.addEventListener('click', handleInteraction);
        btn.addEventListener('touchend', handleInteraction, { passive: false });
    });
}

// Open game modal
window.openGame = function() {
    const modal = document.getElementById('game-modal');
    modal.classList.add('show');
    initGameElements();
}

// Close game modal
window.closeGame = function() {
    const modal = document.getElementById('game-modal');
    modal.classList.remove('show');
    // Reset game if playing
    if (isPlaying) {
        isPlaying = false;
        isPlayerTurn = false;
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Start Game';
        }
    }
}

// Start game
function startGame() {
    sequence = [];
    playerSequence = [];
    gameScore = 0;
    isPlaying = true;
    scoreDisplay.textContent = gameScore;
    messageDisplay.textContent = 'Watch the sequence...';
    startBtn.disabled = true;
    nextRound();
}

function nextRound() {
    playerSequence = [];
    isPlayerTurn = false;

    // Add random color to sequence
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);

    // Play sequence
    playSequence();
}

async function playSequence() {
    for (let i = 0; i < sequence.length; i++) {
        await sleep(600);
        await flashColor(sequence[i]);
    }
    isPlayerTurn = true;
    messageDisplay.textContent = 'Your turn!';
}

function flashColor(color) {
    return new Promise(resolve => {
        const btn = document.getElementById(color);
        if (!btn) {
            resolve();
            return;
        }
        btn.classList.add('active');

        setTimeout(() => {
            btn.classList.remove('active');
            resolve();
        }, 400);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkSequence() {
    const currentIndex = playerSequence.length - 1;

    // Check if player's move matches the sequence
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameOver();
        return;
    }

    // If player completed the sequence
    if (playerSequence.length === sequence.length) {
        gameScore++;
        scoreDisplay.textContent = gameScore;
        isPlayerTurn = false;
        messageDisplay.textContent = 'Correct! Watch next sequence...';

        // Update best score
        if (gameScore > bestScore) {
            bestScore = gameScore;
            bestDisplay.textContent = bestScore;
            localStorage.setItem('simonBestScore', bestScore);
        }

        setTimeout(nextRound, 1500);
    }
}

function gameOver() {
    isPlaying = false;
    isPlayerTurn = false;
    messageDisplay.textContent = `Game Over! Final score: ${gameScore}`;
    startBtn.disabled = false;
    startBtn.textContent = 'Play Again';
}

// Prevent double-tap zoom in game modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('game-modal');
    if (modal) {
        let lastTouchEnd = 0;
        modal.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
});