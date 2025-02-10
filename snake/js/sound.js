export function setupSound() {
    const collisionSound = document.getElementById('collisionSound');
    const muteBtn = document.getElementById('muteBtn');
    let isMuted = true;

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        collisionSound.muted = isMuted;
        muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    collisionSound.muted = isMuted;

    return function playCollisionSound() {
        if (!isMuted) {
            collisionSound.play();
        }
    };
}
