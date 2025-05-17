document.addEventListener("DOMContentLoaded", () => {
  const gameScreen = document.getElementById("game-screen");
  const austin = document.getElementById("austin");
  const scoreDisplay = document.getElementById("score");
  const gameMessage = document.getElementById("game-message");

  // Ad elements
  const gameOverAdContainer = document.getElementById("ad-container-gameover");
  const continueAfterAdBtn = document.getElementById("continue-after-ad");

  // Add ad related event listeners
  continueAfterAdBtn.addEventListener("click", () => {
    gameOverAdContainer.style.display = "none";
    restartGame();
  });

  // Ad display variables
  let adFrequency = 2; // Show ad every X game overs
  let gameOverCount = 0;

  // Sound elements
  const fartSounds = [
    document.getElementById("fart-sound-1"),
    document.getElementById("fart-sound-2"),
    document.getElementById("fart-sound-3"),
    document.getElementById("fart-sound-4"),
    document.getElementById("fart-sound-5"),
  ];

  // Remove reference to the audio element, we'll use Web Audio API instead
  const toggleMusicBtn = document.getElementById("toggle-music");
  const toggleSoundEffectsBtn = document.getElementById("toggle-sound-effects");

  // Sound state
  let musicEnabled = true;
  let soundEffectsEnabled = true;

  // Web Audio API setup for elevator music
  let audioContext;
  let musicOscillators = [];
  let musicGain;
  let musicTimeout = null; // Track the timeout for music scheduling

  // Initialize Web Audio API
  function initAudio() {
    try {
      // If we already have an audio context, close it first
      if (audioContext) {
        stopElevatorMusic();
        audioContext.close();
      }

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      musicGain = audioContext.createGain();
      musicGain.gain.value = 0.2; // Lower volume for background music
      musicGain.connect(audioContext.destination);

      // Try to resume AudioContext (needed for some browsers)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      return true;
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
      return false;
    }
  }

  // Create and play elevator music
  function createElevatorMusic() {
    if (!musicEnabled || !audioContext) return;

    // Clear any existing oscillators and timeouts
    stopElevatorMusic();

    // Notes for a pleasant elevator music feel
    const notes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.0, // G4
      440.0, // A4
      493.88, // B4
      523.25, // C5
    ];

    // Play a simple arpeggio pattern
    const playArpeggio = () => {
      // Simple elevator-like chord progression: C major, A minor, F major, G major
      const chords = [
        [261.63, 329.63, 392.0], // C major
        [220.0, 261.63, 329.63], // A minor
        [174.61, 220.0, 261.63, 349.23], // F major
        [196.0, 246.94, 293.66, 392.0], // G major
      ];

      let chordIndex = 0;
      let noteIndex = 0;

      // Play a note every 200ms
      const playNote = () => {
        if (!musicEnabled) return;

        // Clear previous note
        if (musicOscillators.length > 0) {
          musicOscillators.forEach((osc) => {
            osc.stop();
            osc.disconnect();
          });
          musicOscillators = [];
        }

        // Get current chord
        const chord = chords[chordIndex];

        // Play a note from the chord
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();

        osc.type = "sine";
        osc.frequency.value = chord[noteIndex % chord.length];

        noteGain.gain.value = 0.2;
        noteGain.gain.setValueAtTime(0.2, audioContext.currentTime);
        noteGain.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + 0.19
        );

        osc.connect(noteGain);
        noteGain.connect(musicGain);

        osc.start();
        musicOscillators.push(osc);

        // Schedule next note
        noteIndex = (noteIndex + 1) % 8;
        if (noteIndex === 0) {
          chordIndex = (chordIndex + 1) % chords.length;
        }

        // Store the timeout so we can clear it if needed
        musicTimeout = setTimeout(playNote, 200);
      };

      playNote();
    };

    playArpeggio();
  }

  // Stop elevator music
  function stopElevatorMusic() {
    // Clear the timeout to stop scheduling new notes
    if (musicTimeout) {
      clearTimeout(musicTimeout);
      musicTimeout = null;
    }

    // Stop all oscillators
    if (musicOscillators.length > 0) {
      musicOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      musicOscillators = [];
    }
  }

  // Setup sound controls
  toggleMusicBtn.addEventListener("click", () => {
    musicEnabled = !musicEnabled;
    toggleMusicBtn.classList.toggle("muted");
    toggleMusicBtn.textContent = musicEnabled ? "🎵" : "🔇";

    if (musicEnabled) {
      if (!audioContext) initAudio();
      createElevatorMusic();
    } else {
      stopElevatorMusic();
    }
  });

  toggleSoundEffectsBtn.addEventListener("click", () => {
    soundEffectsEnabled = !soundEffectsEnabled;
    toggleSoundEffectsBtn.classList.toggle("muted");
    toggleSoundEffectsBtn.textContent = soundEffectsEnabled ? "🔊" : "🔇";
  });

  // Preload and setup sounds
  let soundsReady = [false, false, false, false, false];

  // Setup fart sounds
  fartSounds.forEach((sound, index) => {
    sound.load();
    sound.volume = 0.7; // Set volume to 70%
    sound.addEventListener("canplaythrough", () => {
      soundsReady[index] = true;
    });
    sound.addEventListener("error", (e) => {
      console.error(`Error loading fart sound ${index + 1}:`, e);
    });
  });

  // Function to play a random fart sound
  function playRandomFartSound() {
    if (!soundEffectsEnabled) return;

    // Find all ready sounds
    const readySounds = fartSounds.filter((_, index) => soundsReady[index]);
    if (readySounds.length === 0) return;

    // Select a random sound from ready sounds
    const randomSound =
      readySounds[Math.floor(Math.random() * readySounds.length)];

    try {
      randomSound.currentTime = 0;
      const playPromise = randomSound.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Sound play error:", error);
        });
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }

  // Game state variables
  let gameStarted = false;
  let gameOver = false;
  let score = 0;
  let pipesPassed = 0;

  // Austin's position and movement
  let austinLeft = 50;
  let austinTop = 200;
  let velocity = 0;
  let gravity = 0.5;
  let jump = -10;

  // Game dimensions
  const gameWidth = gameScreen.offsetWidth;
  const gameHeight = gameScreen.offsetHeight;
  const austinWidth = 60;
  const austinHeight = 60;
  const austinRadius = austinWidth / 2; // For circular collision detection

  // Pipes variables
  let pipes = [];
  const pipeWidth = 60;
  const pipeGap = 200;
  const pipeInterval = 1500; // ms between pipe spawns
  let lastPipeTime = 0;

  // Ground
  const ground = document.createElement("div");
  ground.className = "ground";
  gameScreen.appendChild(ground);

  // Update Austin's position
  function updateAustin() {
    if (!gameStarted || gameOver) return;

    // Apply gravity to velocity
    velocity += gravity;

    // Update Austin's position
    austinTop += velocity;

    // Keep Austin within game bounds
    if (austinTop < 0) {
      austinTop = 0;
      velocity = 0;
    }

    if (austinTop > gameHeight - austinHeight - 20) {
      // 20 is ground height
      austinTop = gameHeight - austinHeight - 20;
      gameEnd();
    }

    // Update austin position
    austin.style.left = austinLeft + "px";
    austin.style.top = austinTop + "px";

    // Rotate austin based on velocity
    if (velocity > 5) {
      austin.className = "austin-sprite rotate-down";
    } else if (velocity < 0) {
      austin.className = "austin-sprite rotate-up";
    } else {
      austin.className = "austin-sprite";
    }
  }

  // Create pipes
  function createPipes() {
    if (!gameStarted || gameOver) return;

    const currentTime = Date.now();
    if (currentTime - lastPipeTime < pipeInterval) return;

    lastPipeTime = currentTime;

    // Random height for top pipe
    const pipeTopHeight =
      Math.floor(Math.random() * (gameHeight - pipeGap - 100)) + 50;
    const pipeBottomHeight = gameHeight - pipeTopHeight - pipeGap - 20; // 20 is ground height

    // Create top pipe
    const pipeTop = document.createElement("div");
    pipeTop.className = "pipe pipe-top";
    pipeTop.style.height = pipeTopHeight + "px";
    pipeTop.style.left = gameWidth + "px";
    pipeTop.style.top = "0";
    gameScreen.appendChild(pipeTop);

    // Create bottom pipe
    const pipeBottom = document.createElement("div");
    pipeBottom.className = "pipe pipe-bottom";
    pipeBottom.style.height = pipeBottomHeight + "px";
    pipeBottom.style.left = gameWidth + "px";
    pipeBottom.style.bottom = "20px"; // 20 is ground height
    gameScreen.appendChild(pipeBottom);

    // Add pipes to array
    pipes.push({
      top: pipeTop,
      bottom: pipeBottom,
      passed: false,
      x: gameWidth,
    });
  }

  // Update pipes position
  function updatePipes() {
    if (!gameStarted || gameOver) return;

    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];

      // Move pipe
      pipe.x -= 2;
      pipe.top.style.left = pipe.x + "px";
      pipe.bottom.style.left = pipe.x + "px";

      // Check if Austin passed pipe
      if (!pipe.passed && pipe.x + pipeWidth < austinLeft) {
        pipe.passed = true;
        updateScore();
      }

      // Check for collision
      if (checkCircleCollision(pipe)) {
        gameEnd();
        return;
      }

      // Remove pipes that are off screen
      if (pipe.x + pipeWidth < 0) {
        gameScreen.removeChild(pipe.top);
        gameScreen.removeChild(pipe.bottom);
        pipes.splice(i, 1);
        i--;
      }
    }
  }

  // Check collision between circular Austin and pipe using circle-rectangle collision
  function checkCircleCollision(pipe) {
    // Calculate Austin's center point
    const austinCenterX = austinLeft + austinRadius;
    const austinCenterY = austinTop + austinRadius;

    // Top pipe collision
    const topPipeHeight = parseInt(pipe.top.style.height);

    // Rectangle representation of top pipe
    const topPipeRect = {
      x: pipe.x,
      y: 0,
      width: pipeWidth,
      height: topPipeHeight,
    };

    // Bottom pipe collision
    const bottomPipeHeight = parseInt(pipe.bottom.style.height);
    const bottomPipeY = gameHeight - bottomPipeHeight - 20; // 20 is ground height

    // Rectangle representation of bottom pipe
    const bottomPipeRect = {
      x: pipe.x,
      y: bottomPipeY,
      width: pipeWidth,
      height: bottomPipeHeight,
    };

    // Check collision with either pipe
    return (
      circleRectCollision(
        austinCenterX,
        austinCenterY,
        austinRadius,
        topPipeRect
      ) ||
      circleRectCollision(
        austinCenterX,
        austinCenterY,
        austinRadius,
        bottomPipeRect
      )
    );
  }

  // Helper function to detect collision between a circle and rectangle
  function circleRectCollision(circleX, circleY, radius, rect) {
    // Find the closest point in the rectangle to the center of the circle
    const closestX = Math.max(rect.x, Math.min(circleX, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circleY, rect.y + rect.height));

    // Calculate the distance between the circle's center and the closest point
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;

    // If the distance is less than the circle's radius, there's a collision
    return distanceX * distanceX + distanceY * distanceY < radius * radius;
  }

  // Add clouds for decoration
  function createClouds() {
    const cloudCount = 3;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud";

      const size = Math.random() * 50 + 50;
      const left = Math.random() * gameWidth;
      const top = Math.random() * (gameHeight / 2);

      cloud.style.width = size + "px";
      cloud.style.height = size / 2 + "px";
      cloud.style.left = left + "px";
      cloud.style.top = top + "px";

      gameScreen.appendChild(cloud);
    }
  }

  // Update game score
  function updateScore() {
    pipesPassed++;
    score = pipesPassed;
    scoreDisplay.textContent = score;

    // Play random fart sound when scoring a point
    playRandomFartSound();
  }

  // End the game
  function gameEnd() {
    gameOver = true;

    // Increment game over count
    gameOverCount++;

    // Show standard game over message
    gameMessage.textContent = `Game Over! Score: ${score}. Press Space to Restart`;
    gameMessage.style.display = "block";

    // Show ad overlay based on frequency
    if (gameOverCount % adFrequency === 0) {
      // Refresh ads (if needed)
      try {
        if (window.adsbygoogle && window.adsbygoogle.push) {
          (adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error("Error refreshing ads:", e);
      }

      // Show the ad overlay
      setTimeout(() => {
        gameOverAdContainer.style.display = "block";
      }, 1000); // Small delay before showing ad
    }

    // Don't stop the music when the game ends - let it continue playing
  }

  // Function to actually restart the game (after ad if shown)
  function restartGame() {
    // Ensure we have a clean audio context
    if (musicEnabled) {
      // Make sure any previous music is stopped
      stopElevatorMusic();

      // Only initialize audio if it's not already set up
      if (!audioContext || audioContext.state === "closed") {
        initAudio();
      }

      // Start the elevator music
      createElevatorMusic();
    }

    // Try to get sounds working (some browsers require user interaction)
    fartSounds.forEach((sound, index) => {
      if (!soundsReady[index]) {
        sound.load();
        soundsReady[index] = true;
      }
    });

    // Reset game state
    gameStarted = true;
    gameOver = false;
    score = 0;
    pipesPassed = 0;
    scoreDisplay.textContent = "0";

    // Reset Austin position
    austinLeft = 50;
    austinTop = 200;
    velocity = 0;

    // Clear pipes
    pipes.forEach((pipe) => {
      gameScreen.removeChild(pipe.top);
      gameScreen.removeChild(pipe.bottom);
    });
    pipes = [];

    // Hide game message
    gameMessage.style.display = "none";

    // Position Austin
    austin.style.left = austinLeft + "px";
    austin.style.top = austinTop + "px";

    // Update last pipe time
    lastPipeTime = Date.now();
  }

  // Start or restart the game (check if ad should be shown first)
  function startGame() {
    // If game is over, check whether to show ad or restart directly
    if (gameOver) {
      if (
        gameOverCount % adFrequency === 0 &&
        gameOverAdContainer.style.display !== "block"
      ) {
        // Show ad overlay
        gameOverAdContainer.style.display = "block";
      } else if (gameOverAdContainer.style.display === "block") {
        // Ad is showing, wait for user to click continue
        return;
      } else {
        // No ad to show, restart directly
        restartGame();
      }
    } else {
      // First game start
      restartGame();
    }
  }

  // Handle keyboard input
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (!gameStarted || gameOver) {
        // Don't start game if ad is showing
        if (gameOverAdContainer.style.display === "block") {
          return;
        }
        startGame();
      } else {
        velocity = jump;
      }
      e.preventDefault();

      // Make sure audio context is running (needed for some browsers)
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
    }
  });

  // Handle touch for mobile
  gameScreen.addEventListener("touchstart", (e) => {
    // Don't handle touch if ad is showing
    if (gameOverAdContainer.style.display === "block") {
      return;
    }

    if (!gameStarted || gameOver) {
      startGame();
    } else {
      velocity = jump;
    }
    e.preventDefault();

    // Make sure audio context is running (needed for some browsers)
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }
  });

  // Initialize game
  function init() {
    // Position Austin initially
    austin.style.left = austinLeft + "px";
    austin.style.top = austinTop + "px";

    // Make sure Austin is visible
    austin.style.display = "block";

    // Make sure game message is showing
    gameMessage.style.display = "block";
    gameMessage.textContent = "Press Space to Start";

    // Set initial state - not game over
    gameOver = false;

    // Create clouds
    createClouds();

    // Initialize audio
    initAudio();

    // Setup sound control button states
    toggleMusicBtn.textContent = musicEnabled ? "🎵" : "🔇";
    toggleSoundEffectsBtn.textContent = soundEffectsEnabled ? "🔊" : "🔇";
    if (!musicEnabled) toggleMusicBtn.classList.add("muted");
    if (!soundEffectsEnabled) toggleSoundEffectsBtn.classList.add("muted");

    // Add a click handler to the document to enable audio on iOS and other browsers
    document.addEventListener(
      "click",
      function initAudioOnFirstClick() {
        if (audioContext && audioContext.state === "suspended") {
          audioContext.resume();
        }
        if (musicEnabled) {
          createElevatorMusic();
        }
        document.removeEventListener("click", initAudioOnFirstClick);
      },
      { once: true }
    );

    // Game loop
    setInterval(() => {
      updateAustin();
      createPipes();
      updatePipes();
    }, 1000 / 60); // 60 FPS
  }

  // Start the game
  init();
});
