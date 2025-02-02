export const SoundSystem = {
    sounds: {
        crunch: new Audio('assets/sounds/crunch.wav'),    // For eating apples
        powerup: new Audio('assets/sounds/powerup.wav'),  // For collecting hearts
        die: new Audio('assets/sounds/die.wav'),
        hit: new Audio('assets/sounds/hit.wav')
    },
    isMuted: false,  // Move mute state here
    isUserInteracted: false,  // Track if user has interacted

    init() {
        return new Promise((resolve, reject) => {
            try {
                // Pre-load sounds
                Object.values(this.sounds).forEach(sound => {
                    sound.addEventListener('error', (e) => {
                        console.error('Sound failed to load:', e.target.src);
                    });
                    sound.load();
                    // Try to restore previous volume setting
                    const savedVolume = localStorage.getItem('gameVolume');
                    sound.volume = savedVolume ? parseFloat(savedVolume) : 0.3;
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    play(soundName) {
        if (!this.isUserInteracted) return;  // Prevent playing sound before user interaction
        const sound = this.sounds[soundName];
        if (!sound || this.isMuted) return;
        
        // Clone audio for overlapping sounds
        if (sound.currentTime > 0 && sound.currentTime < sound.duration) {
            const clone = sound.cloneNode();
            clone.volume = sound.volume;
            clone.play().catch(e => console.log('Sound play failed:', e));
            // Cleanup clone after playing
            clone.onended = () => clone.remove();
        } else {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play failed:', e));
        }
    },

    setVolume(volume) {
        const validVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('gameVolume', validVolume.toString());
        Object.values(this.sounds).forEach(sound => {
            sound.volume = validVolume;
        });
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        Object.values(this.sounds).forEach(sound => {
            sound.muted = this.isMuted;
        });
    },

    handleUserInteraction() {
        this.isUserInteracted = true;
    },

    destroy() {
        // Cleanup and unload sounds when game ends
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.src = '';
            sound.removeEventListener('error', () => {});
        });
        this.sounds = {};
    }
};
