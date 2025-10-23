const progressBar = document.getElementById('progressBar');
const crankButton = document.getElementById('crankButton');
const gearsSound = document.getElementById('gearsSound');

let progress = 0;
let soundPlaying = false;
let drainInterval;
let soundStopTimeout = null;
const lightDuration = 15000; // 15 секунд

// Increase progress on click
crankButton.addEventListener('click', () => {
    progress = Math.min(progress + 5, 100);
    updateProgress();
    
    // Check if progress reached 100%
    if (progress === 100) {
        // Reset progress instantly without transition
        progressBar.classList.add('notransition');
        progress = 0;
        progressBar.style.width = '0%';
        
        // Re-enable transition after instant reset
        setTimeout(() => {
            progressBar.classList.remove('notransition');
        }, 50);
        
        // Закрыть iframe и включить свет в Unity
        PortalsSdk.closeIframe();
        PortalsSdk.sendMessageToUnity(
            JSON.stringify({
                TaskName: "room-light",
                TaskTargetState: "SetNotActiveToActive"
            })
        );
        
        // Выключить звук и свет через 15 секунд
        if (soundPlaying) {
            soundStopTimeout = setTimeout(() => {
                gearsSound.pause();
                gearsSound.currentTime = 0;
                soundPlaying = false;
                
                // Выключить свет в Unity
                PortalsSdk.sendMessageToUnity(
                    JSON.stringify({
                        TaskName: "room-light",
                        TaskTargetState: "SetActiveToNotActive"
                    })
                );
            }, lightDuration);
        }
    }
    
    // Rotate animation
    crankButton.classList.add('rotating');
    setTimeout(() => {
        crankButton.classList.remove('rotating');
    }, 300);
    
    // Start sound on first click if progress > 0
    if (progress > 0 && !soundPlaying) {
        // Clear any pending stop timeout
        if (soundStopTimeout) {
            clearTimeout(soundStopTimeout);
            soundStopTimeout = null;
        }
        gearsSound.play();
        soundPlaying = true;
    }
});

// Drain progress continuously
drainInterval = setInterval(() => {
    if (progress > 0) {
        progress = Math.max(progress - 0.5, 0);
        updateProgress();
        
        // Stop sound when progress reaches 0 (only if not waiting for 15-second delay)
        if (progress === 0 && soundPlaying && !soundStopTimeout) {
            gearsSound.pause();
            gearsSound.currentTime = 0;
            soundPlaying = false;
        }
    }
}, 50);

function updateProgress() {
    progressBar.style.width = progress + '%';
}
