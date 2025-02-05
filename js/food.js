export class Food {
    constructor(canvasWidth, canvasHeight) {
        this.gridSize = 20;
        this.maxX = Math.floor(canvasWidth / this.gridSize);
        this.maxY = Math.floor(canvasHeight / this.gridSize);
        this.position = { x: 0, y: 0 };
        this.type = 'regular';
        this.heartTimer = null;
    }

    spawn(snakeSegments) {
        let newPos;
        do {
            newPos = {
                x: Math.floor(Math.random() * this.maxX),
                y: Math.floor(Math.random() * this.maxY)
            };
        } while (this.isPositionOccupied(newPos, snakeSegments));

        this.position = newPos;
        
        // Clear any existing heart timer
        if (this.heartTimer) {
            clearTimeout(this.heartTimer);
            this.heartTimer = null;
        }

        // 20% chance to spawn heart after level 5
        if (this.shouldSpawnHeart()) {
            this.type = 'heart';
            // Heart disappears after 10 seconds
            this.heartTimer = setTimeout(() => {
                if (this.type === 'heart') {
                    this.spawn(snakeSegments);
                }
            }, 10000);
        } else {
            this.type = 'regular';
        }
    }

    shouldSpawnHeart() {
        // Assuming level info is passed or accessible
        const currentLevel = document.getElementById('level').textContent;
        return currentLevel >= 5 && Math.random() < 0.2;
    }

    isPositionOccupied(pos, snakeSegments) {
        return snakeSegments.some(segment => 
            segment.x === pos.x && segment.y === pos.y
        );
    }

    getColor() {
        return this.type === 'heart' ? '#ff4081' : '#4CAF50';
    }

    cleanup() {
        if (this.heartTimer) {
            clearTimeout(this.heartTimer);
            this.heartTimer = null;
        }
    }
}