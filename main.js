// Track data - exact display order for the wheel
const tracks = [
    { title: "DOGHAT - NATURAL HIGH (TMR006)", img: "images/SIPPIN2.png", src: "music/SIPPIN.mp3" },
    { title: "HEAD? - TELL ME TO SPANK ME (TMR003)", img: "images/head.png", src: "music/track 6.m4a" },
    { title: "DOGHAT - D.H.I.T.H", img: "images/indahouse.png", src: "music/D.H.I.T.H.mp3" },
    { title: "12 HZUI - FISH CITY", img: "images/fish city.png", src: "music/fish city.m4a" },
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

// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Check if we're on the player page
    const player = document.getElementById('player');
    if (!player) {
        console.log('Not on player page');
        return;
    }
    
    // Get elements with detailed logging
    const elements = {
        player: player,
        playPauseBtn: document.querySelector('.control-btn.play-pause'),
        playIcon: document.querySelector('.play-icon'),
        pauseIcon: document.querySelector('.pause-icon'),
        prevBtn: document.querySelector('.control-btn.prev'),
        nextBtn: document.querySelector('.control-btn.next'),
        shuffleBtn: document.querySelector('.control-btn.shuffle'),
        repeatBtn: document.querySelector('.control-btn.repeat'),
        progressBar: document.querySelector('.progress-bar'),
        progressFill: document.querySelector('.progress-fill'),
        progressKnob: document.querySelector('.progress-knob'),
        trackTitle: document.querySelector('.track-title'),
        prevRecord: document.querySelector('.record.prev'),
        centerRecord: document.querySelector('.record.center'),
        nextRecord: document.querySelector('.record.next')
    };
    
    // Log what we found
    console.log('Found elements:', {
        prevBtn: !!elements.prevBtn,
        nextBtn: !!elements.nextBtn,
        playPauseBtn: !!elements.playPauseBtn,
        centerRecord: !!elements.centerRecord
    });
    
    // Core functions
    function updateWheel() {
        const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        const nextIndex = (currentIndex + 1) % tracks.length;
        
        console.log('Updating wheel - Current:', currentIndex, 'Track:', tracks[currentIndex].title);
        
        // Update images
        if (elements.prevRecord) {
            const img = elements.prevRecord.querySelector('img');
            if (img) {
                img.src = tracks[prevIndex].img;
                img.alt = tracks[prevIndex].title;
            }
        }
        
        if (elements.centerRecord) {
            const img = elements.centerRecord.querySelector('img');
            if (img) {
                img.src = tracks[currentIndex].img;
                img.alt = tracks[currentIndex].title;
            }
        }
        
        if (elements.nextRecord) {
            const img = elements.nextRecord.querySelector('img');
            if (img) {
                img.src = tracks[nextIndex].img;
                img.alt = tracks[nextIndex].title;
            }
        }
        
        // Update title
        if (elements.trackTitle) {
            elements.trackTitle.textContent = tracks[currentIndex].title;
        }
        
        // Update audio
        const wasPlaying = isPlaying;
        elements.player.src = tracks[currentIndex].src;
        
        if (wasPlaying && hasUserGesture) {
            elements.player.play().catch(err => console.log('Autoplay error:', err));
        }
    }
    
    function prevTrack() {
        console.log('PREV CLICKED - Moving from', currentIndex, 'to', (currentIndex - 1 + tracks.length) % tracks.length);
        hasUserGesture = true;
        currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        updateWheel();
    }
    
    function nextTrack() {
        console.log('NEXT CLICKED - Moving from', currentIndex, 'to', (currentIndex + 1) % tracks.length);
        hasUserGesture = true;
        
        if (isShuffle && tracks.length > 1) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * tracks.length);
            } while (newIndex === currentIndex);
            currentIndex = newIndex;
        } else {
            currentIndex = (currentIndex + 1) % tracks.length;
        }
        
        updateWheel();
    }
    
    function togglePlay() {
        console.log('PLAY/PAUSE CLICKED');
        hasUserGesture = true;
        
        if (isPlaying) {
            elements.player.pause();
            isPlaying = false;
        } else {
            elements.player.play().then(() => {
                isPlaying = true;
            }).catch(err => {
                console.error('Play error:', err);
                isPlaying = false;
            });
        }
        updatePlayButton();
    }
    
    function updatePlayButton() {
        if (elements.playIcon && elements.pauseIcon) {
            elements.playIcon.style.display = isPlaying ? 'none' : 'block';
            elements.pauseIcon.style.display = isPlaying ? 'block' : 'none';
        }
    }
    
    function toggleShuffle() {
        isShuffle = !isShuffle;
        elements.shuffleBtn?.classList.toggle('active', isShuffle);
        console.log('Shuffle:', isShuffle);
    }
    
    function toggleRepeat() {
        isRepeat = !isRepeat;
        elements.repeatBtn?.classList.toggle('active', isRepeat);
        console.log('Repeat:', isRepeat);
    }
    
    function updateProgress() {
        if (!isDragging && elements.player.duration) {
            const percent = (elements.player.currentTime / elements.player.duration) * 100;
            if (elements.progressFill) elements.progressFill.style.width = percent + '%';
            if (elements.progressKnob) elements.progressKnob.style.left = percent + '%';
        }
    }
    
    function seekToPosition(e) {
        if (!elements.progressBar || !elements.player.duration) return;
        
        const rect = elements.progressBar.getBoundingClientRect();
        let clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
        if (!clientX) return;
        
        const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        elements.player.currentTime = (percent / 100) * elements.player.duration;
        
        if (elements.progressFill) elements.progressFill.style.width = percent + '%';
        if (elements.progressKnob) elements.progressKnob.style.left = percent + '%';
    }
    
    // SETUP EVENT LISTENERS WITH EXPLICIT BINDING
    
    // Previous button - try multiple methods
    if (elements.prevBtn) {
        // Method 1: Direct onclick
        elements.prevBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            prevTrack();
            return false;
        };
        
        // Method 2: addEventListener as backup
        elements.prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            prevTrack();
        }, true);
        
        console.log('Prev button listeners attached');
    } else {
        console.error('PREV BUTTON NOT FOUND!');
    }
    
    // Next button - try multiple methods
    if (elements.nextBtn) {
        // Method 1: Direct onclick
        elements.nextBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            nextTrack();
            return false;
        };
        
        // Method 2: addEventListener as backup
        elements.nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            nextTrack();
        }, true);
        
        console.log('Next button listeners attached');
    } else {
        console.error('NEXT BUTTON NOT FOUND!');
    }
    
    // Play/Pause button
    if (elements.playPauseBtn) {
        elements.playPauseBtn.onclick = function(e) {
            e.preventDefault();
            togglePlay();
        };
        console.log('Play/pause button listener attached');
    }
    
    // Shuffle button
    if (elements.shuffleBtn) {
        elements.shuffleBtn.onclick = function(e) {
            e.preventDefault();
            toggleShuffle();
        };
    }
    
    // Repeat button
    if (elements.repeatBtn) {
        elements.repeatBtn.onclick = function(e) {
            e.preventDefault();
            toggleRepeat();
        };
    }
    
    // Record clicks (desktop only)
    if (elements.prevRecord) {
        elements.prevRecord.onclick = function(e) {
            e.preventDefault();
            prevTrack();
        };
    }
    
    if (elements.nextRecord) {
        elements.nextRecord.onclick = function(e) {
            e.preventDefault();
            nextTrack();
        };
    }
    
    if (elements.centerRecord) {
        elements.centerRecord.onclick = function(e) {
            e.preventDefault();
            togglePlay();
        };
    }
    
    // Progress bar
    if (elements.progressBar) {
        elements.progressBar.onclick = seekToPosition;
        
        if (elements.progressKnob) {
            let startDrag = function(e) {
                isDragging = true;
                e.preventDefault();
            };
            
            elements.progressKnob.onmousedown = startDrag;
            elements.progressKnob.ontouchstart = startDrag;
        }
    }
    
    // Document-wide events for dragging
    document.addEventListener('mousemove', function(e) {
        if (isDragging) seekToPosition(e);
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging) seekToPosition(e);
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    // Player events
    elements.player.addEventListener('timeupdate', updateProgress);
    elements.player.addEventListener('play', function() {
        isPlaying = true;
        updatePlayButton();
    });
    elements.player.addEventListener('pause', function() {
        isPlaying = false;
        updatePlayButton();
    });
    elements.player.addEventListener('ended', function() {
        if (isRepeat) {
            elements.player.currentTime = 0;
            elements.player.play();
        } else {
            nextTrack();
        }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevTrack();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextTrack();
        } else if (e.key === ' ' && (document.activeElement === document.body || document.activeElement === elements.playPauseBtn)) {
            e.preventDefault();
            togglePlay();
        }
    });
    
    // Load saved state
    try {
        const saved = sessionStorage.getItem('playerState');
        if (saved) {
            const state = JSON.parse(saved);
            currentIndex = state.currentIndex || 0;
            isShuffle = state.isShuffle || false;
            isRepeat = state.isRepeat || false;
            if (isShuffle) elements.shuffleBtn?.classList.add('active');
            if (isRepeat) elements.repeatBtn?.classList.add('active');
        }
    } catch(e) {}
    
    // Save state on changes
    function saveState() {
        try {
            sessionStorage.setItem('playerState', JSON.stringify({
                currentIndex,
                isShuffle,
                isRepeat
            }));
        } catch(e) {}
    }
    
    // Initialize display
    updateWheel();
    
    console.log('Player initialization complete!');
    
    // Debug: Add a global function for testing
    window.debugPlayer = {
        next: nextTrack,
        prev: prevTrack,
        play: togglePlay,
        elements: elements
    };
    console.log('Debug: You can test with window.debugPlayer.next() or .prev()');
});
