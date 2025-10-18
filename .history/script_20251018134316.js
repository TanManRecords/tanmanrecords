// Track data - exact display order for the wheel
const tracks = [
    { title: "HEADBOY - TRACK 6", img: "images/track6.png", src: "music/track 6.m4a" },
    { title: "SIPPIN", img: "images/SIPPIN.png", src: "music/SIPPIN.mp3" },
    { title: "D.H.I.T.H", img: "images/D.H.I.T.H.png", src: "music/D.H.I.T.H.mp3" },
    { title: "FISH CITY", img: "images/fish city.png", src: "music/fish city.m4a" },
    { title: "WANKYWANKY", img: "images/wankywanky.png", src: "music/wankywanky.mp3" },
    { title: "STILLNESS", img: "images/stillness.png", src: "music/stillness.m4a" }
];

// Player state
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isDragging = false;
let hasUserGesture = false;

// DOM elements
const player = document.getElementById('player');
const playPauseBtn = document.querySelector('.play-pause');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const shuffleBtn = document.querySelector('.shuffle');
const repeatBtn = document.querySelector('.repeat');
const progressBar = document.querySelector('.progress-bar');
const progressFill = document.querySelector('.progress-fill');
const progressKnob = document.querySelector('.progress-knob');
const trackTitle = document.querySelector('.track-title');
const prevRecord = document.querySelector('.record.prev');
const centerRecord = document.querySelector('.record.center');
const nextRecord = document.querySelector('.record.next');

// Initialize player
function init() {
    // Load state from sessionStorage if available
    const savedState = sessionStorage.getItem('playerState');
    if (savedState) {
        const state = JSON.parse(savedState);
        currentIndex = state.currentIndex || 0;
        isShuffle = state.isShuffle || false;
        isRepeat = state.isRepeat || false;
        
        // Apply saved button states
        if (isShuffle) shuffleBtn.classList.add('active');
        if (isRepeat) repeatBtn.classList.add('active');
    }
    
    updateWheel();
    setupEventListeners();
}

// Update the record wheel display
function updateWheel() {
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    const nextIndex = (currentIndex + 1) % tracks.length;
    
    // Update images
    if (prevRecord) {
        prevRecord.querySelector('img').src = tracks[prevIndex].img;
        prevRecord.querySelector('img').alt = tracks[prevIndex].title;
    }
    
    centerRecord.querySelector('img').src = tracks[currentIndex].img;
    centerRecord.querySelector('img').alt = tracks[currentIndex].title;
    
    if (nextRecord) {
        nextRecord.querySelector('img').src = tracks[nextIndex].img;
        nextRecord.querySelector('img').alt = tracks[nextIndex].title;
    }
    
    // Update title
    trackTitle.textContent = tracks[currentIndex].title;
    
    // Update audio source
    player.src = tracks[currentIndex].src;
    
    // Save state
    saveState();
}

// Load and play track
function loadTrack(autoPlay = false) {
    updateWheel();
    
    if (autoPlay && hasUserGesture) {
        player.play().then(() => {
            isPlaying = true;
            updatePlayButton();
        }).catch(err => console.log('Autoplay prevented:', err));
    }
}

// Play/Pause functionality
function togglePlay() {
    hasUserGesture = true;
    
    if (isPlaying) {
        player.pause();
        isPlaying = false;
    } else {
        player.play().then(() => {
            isPlaying = true;
        }).catch(err => console.log('Play failed:', err));
    }
    updatePlayButton();
}

// Update play button appearance
function updatePlayButton() {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// Navigate to previous track
function prevTrack() {
    hasUserGesture = true;
    const wasPlaying = isPlaying;
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack(wasPlaying);
}

// Navigate to next track
function nextTrack() {
    hasUserGesture = true;
    const wasPlaying = isPlaying;
    
    if (isShuffle) {
        // Random track but not the same one
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * tracks.length);
        } while (newIndex === currentIndex && tracks.length > 1);
        currentIndex = newIndex;
    } else {
        currentIndex = (currentIndex + 1) % tracks.length;
    }
    
    loadTrack(wasPlaying);
}

// Toggle shuffle
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active');
    saveState();
}

// Toggle repeat
function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active');
    saveState();
}

// Update progress bar
function updateProgress() {
    if (!isDragging && player.duration) {
        const percent = (player.currentTime / player.duration) * 100;
        progressFill.style.width = percent + '%';
        progressKnob.style.left = percent + '%';
    }
}

// Seek to position
function seekToPosition(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    
    if (player.duration) {
        player.currentTime = (percent / 100) * player.duration;
        progressFill.style.width = percent + '%';
        progressKnob.style.left = percent + '%';
    }
}

// Save player state
function saveState() {
    const state = {
        currentIndex,
        isShuffle,
        isRepeat
    };
    sessionStorage.setItem('playerState', JSON.stringify(state));
}

// Setup all event listeners
function setupEventListeners() {
    // Play/Pause button
    playPauseBtn.addEventListener('click', togglePlay);
    
    // Navigation buttons
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    
    // Shuffle and Repeat
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Record clicks
    if (prevRecord) {
        prevRecord.addEventListener('click', prevTrack);
    }
    if (nextRecord) {
        nextRecord.addEventListener('click', nextTrack);
    }
    
    // Progress bar clicking
    progressBar.addEventListener('click', seekToPosition);
    
    // Progress knob dragging
    progressKnob.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            seekToPosition(e);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Touch support for mobile
    progressKnob.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = progressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
            
            if (player.duration) {
                player.currentTime = (percent / 100) * player.duration;
                progressFill.style.width = percent + '%';
                progressKnob.style.left = percent + '%';
            }
        }
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Audio events
    player.addEventListener('timeupdate', updateProgress);
    
    player.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
    });
    
    player.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
    });
    
    player.addEventListener('ended', () => {
        if (isRepeat) {
            player.currentTime = 0;
            player.play();
        } else {
            nextTrack();
        }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
            case 'Enter':
                if (document.activeElement === playPauseBtn || 
                    document.activeElement === centerRecord) {
                    e.preventDefault();
                    togglePlay();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextTrack();
                break;
        }
    });
    
    // Focus accessibility for records
    [prevRecord, centerRecord, nextRecord].forEach(record => {
        if (record) {
            record.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (record === prevRecord) prevTrack();
                    else if (record === nextRecord) nextTrack();
                    else if (record === centerRecord) togglePlay();
                }
            });
        }
    });
}

// Initialize when DOM is ready
if (document.getElementById('player')) {
    init();
}