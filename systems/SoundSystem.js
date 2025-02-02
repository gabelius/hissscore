export const SoundSystem = {
    sounds: {
        eat: new Audio('assets/sounds/eat.wav'),
        die: new Audio('assets/sounds/die.wav'),
        hit: new Audio('assets/sounds/hit.wav')
    },
    isMuted: false,  // Move mute state here

    init() {
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
    },

    play(soundName) {
        const sound = this.sounds[soundName];
        if (sound && !this.isMuted) {
            sound.currentTime = 0; // Reset sound to start
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
    }
};
