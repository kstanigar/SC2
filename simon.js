/**
 * ============================================================================
 * SIMON SAYS GAME
 * ============================================================================
 *
 * A memory game that tests pattern recognition and recall. The game shows
 * a sequence of colored buttons, and the player must repeat the sequence.
 * Each successful round adds one more step to the sequence.
 *
 * Features:
 * - Genre-based tempo (game speed matches music BPM)
 * - localStorage persistence for best score
 * - Touch-optimized for mobile devices
 * - Integrated music controls (no need to exit game)
 * - Enhanced visual feedback with color-matched glows
 *
 * REUSABLE: This game module can be extracted and used in other projects
 *
 * @module SimonSaysGame
 * @version 2.0
 */

// ============================================================================
// GAME STATE
// ============================================================================

/** Available button colors */
const colors = ['green', 'red', 'yellow', 'blue'];

/** Current game sequence to memorize */
let sequence = [];

/** Player's input sequence */
let playerSequence = [];

/** Current score (successfully completed rounds) */
let gameScore = 0;

/** Best score from localStorage */
let bestScore = localStorage.getItem('simonBestScore') || 0;

/** Game is currently active */
let isPlaying = false;

/** Player can input their sequence */
let isPlayerTurn = false;

/** Flag to prevent duplicate event listener registration */
let isInitialized = false;

// DOM element references
let scoreDisplay, bestDisplay, messageDisplay, startBtn, colorBtns;

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles color button clicks and touches
 *
 * IMPORTANT: This function is only called when it's the player's turn.
 * It prevents double-firing on mobile and validates game state before
 * processing input.
 *
 * @param {Event} e - Click or touch event
 */
function handleButtonInteraction(e) {
    if (!isPlayerTurn || !isPlaying) return;

    e.preventDefault(); // Prevent double-firing on mobile

    const color = e.currentTarget.dataset.color;
    playerSequence.push(color);
    flashColor(color);

    checkSequence();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes game DOM elements and event listeners
 *
 * IMPORTANT: Uses isInitialized flag to prevent duplicate event listeners.
 * This was critical to fix a bug where buttons would trigger multiple times.
 *
 * Called when the game modal opens.
 */
function initGameElements() {
    scoreDisplay = document.getElementById('game-score');
    bestDisplay = document.getElementById('game-best');
    messageDisplay = document.getElementById('game-message');
    startBtn = document.getElementById('start-game-btn');
    colorBtns = document.querySelectorAll('.color-btn');

    if (bestDisplay) {
        bestDisplay.textContent = bestScore;
    }

    // Only add event listeners once
    if (!isInitialized) {
        // Start game button
        if (startBtn) {
            startBtn.addEventListener('click', startGame);
        }

        // Handle player clicks and touches
        colorBtns.forEach(btn => {
            // Support both click and touch events
            btn.addEventListener('click', handleButtonInteraction);
            btn.addEventListener('touchend', handleButtonInteraction, { passive: false });
        });

        isInitialized = true;
    }
}

// ============================================================================
// MODAL CONTROLS
// ============================================================================

/**
 * Opens the game modal and syncs UI with current player state
 *
 * This function:
 * - Shows the modal overlay
 * - Initializes game elements if needed
 * - Syncs volume slider with main player
 * - Syncs genre tabs with main player
 *
 * @global
 */
window.openGame = function() {
    const modal = document.getElementById('game-modal');
    modal.classList.add('show');
    initGameElements();

    // Sync game volume slider with current volume
    const gameVolumeControl = document.getElementById('game-volume-control');
    if (gameVolumeControl && window.currentVolume !== undefined) {
        gameVolumeControl.value = window.currentVolume;
    }

    // Sync game genre tabs with current genre
    const currentGenre = window.currentGenre || 'lightJazz';
    document.querySelectorAll('.game-genre-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.genre === currentGenre);
    });
}

/**
 * Closes the game modal and resets game state if needed
 *
 * If a game is in progress, it will be reset so the player
 * can start fresh when reopening the modal.
 *
 * @global
 */
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

// ============================================================================
// GAME TIMING & TEMPO
// ============================================================================

/**
 * Returns timing configuration based on current music genre
 *
 * REUSABLE: Pattern for dynamic game difficulty/pacing
 *
 * This creates a musical connection between the game and the playing music
 * by adjusting game speed to match the genre's typical BPM.
 *
 * @returns {Object} Timing configuration
 * @returns {number} return.delay - Milliseconds between button flashes
 * @returns {number} return.flash - Milliseconds each button stays lit
 *
 * @example
 * const timing = getGenreTiming();
 * // Jazz: { delay: 800, flash: 500 } - slow and relaxed
 * // Electronic: { delay: 500, flash: 300 } - fast and energetic
 */
function getGenreTiming() {
    const genre = window.currentGenre || 'lightJazz';

    // Return [delay between notes, flash duration] in ms
    if (genre === 'lightJazz') {
        return { delay: 800, flash: 500 }; // ~80 BPM - slow, relaxed
    } else if (genre === 'rnb') {
        return { delay: 650, flash: 400 }; // ~90 BPM - smooth groove
    } else if (genre === 'electronic') {
        return { delay: 500, flash: 300 }; // ~128 BPM - fast, energetic
    }
    return { delay: 600, flash: 400 }; // default
}

// ============================================================================
// GAME LOGIC
// ============================================================================

/**
 * Plays the current sequence for the player to memorize
 *
 * Uses async/await to flash each color in sequence with timing
 * based on the current music genre.
 *
 * @async
 */
async function playSequence() {
    const timing = getGenreTiming();

    for (let i = 0; i < sequence.length; i++) {
        await sleep(timing.delay);
        await flashColor(sequence[i], timing.flash);
    }
    isPlayerTurn = true;
    messageDisplay.textContent = 'Your turn!';
}

/**
 * Flashes a color button with visual feedback
 *
 * REUSABLE: Promise-based animation pattern
 *
 * @param {string} color - Color identifier ('green', 'red', 'yellow', 'blue')
 * @param {number} [duration] - Flash duration in ms (defaults to genre timing)
 * @returns {Promise<void>} Resolves when animation completes
 */
function flashColor(color, duration) {
    const flashDuration = duration || getGenreTiming().flash;

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
        }, flashDuration);
    });
}

/**
 * Promise-based sleep utility
 *
 * REUSABLE: Standard async delay pattern
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} Resolves after delay
 *
 * @example
 * await sleep(1000); // Wait 1 second
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates the player's input against the target sequence
 *
 * Checks each button press as it happens. If wrong, triggers game over.
 * If the full sequence is matched, advances to the next round.
 *
 * REUSABLE: Pattern for step-by-step sequence validation
 */
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

        // Update best score in localStorage
        if (gameScore > bestScore) {
            bestScore = gameScore;
            bestDisplay.textContent = bestScore;
            localStorage.setItem('simonBestScore', bestScore);
        }

        setTimeout(nextRound, 1500);
    }
}

/**
 * Ends the current game and displays final score
 *
 * Resets game state and enables the start button for replay.
 */
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