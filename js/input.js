export class Input {
    constructor() {
        this.directionCallback = null;
        this.touchStartX = null;
        this.touchStartY = null;
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupMouseControls();
        this.setupMobileButtons();
    }

    onDirectionChange(callback) {
        this.directionCallback = callback;
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            let direction = null;

            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = 'right';
                    break;
            }

            if (direction && this.directionCallback) {
                event.preventDefault();
                this.directionCallback(direction);
            }
        });
    }

    setupTouchControls() {
        document.addEventListener('touchstart', (event) => {
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = event.touches[0].clientX;
            const touchEndY = event.touches[0].clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            // Require minimum swipe distance to trigger direction change
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
                let direction;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    direction = deltaX > 0 ? 'right' : 'left';
                } else {
                    direction = deltaY > 0 ? 'down' : 'up';
                }
                
                this.touchStartX = touchEndX;
                this.touchStartY = touchEndY;
                
                if (this.directionCallback) {
                    event.preventDefault();
                    this.directionCallback(direction);
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            this.touchStartX = null;
            this.touchStartY = null;
        }, { passive: true });
    }

    setupMouseControls() {
        document.addEventListener('click', (event) => {
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = event.clientX - centerX;
            const deltaY = event.clientY - centerY;
            
            let direction;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }
            
            if (this.directionCallback) {
                this.directionCallback(direction);
            }
        });
    }

    setupMobileButtons() {
        const buttons = {
            'upBtn': 'up',
            'downBtn': 'down',
            'leftBtn': 'left',
            'rightBtn': 'right'
        };

        Object.entries(buttons).forEach(([btnId, direction]) => {
            const button = document.getElementById(btnId);
            if (button) {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (this.directionCallback) {
                        this.directionCallback(direction);
                    }
                });
            }
        });
    }
}