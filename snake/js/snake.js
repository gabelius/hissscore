export class Snake {
    constructor() {
        this.gridSize = 20;
        this.reset();
    }

    reset() {
        // Start with length of 3 in the middle of the grid
        const startX = Math.floor(30 / 2);
        const startY = Math.floor(30 / 2);
        
        this.segments = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        
        this.direction = 'right';
        this.nextDirection = 'right';
        this.ghostSegment = null;
        this.foodCollected = 0;
        this.moveTime = 0;
        this.moveDelay = 150; // Snake speed (lower = faster)
    }

    setDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        // Prevent reversing into self
        if (opposites[this.direction] !== newDirection) {
            this.nextDirection = newDirection;
        }
    }

    update(deltaTime) {
        this.moveTime += deltaTime;
        
        if (this.moveTime >= this.moveDelay) {
            this.moveTime = 0;
            this.move();
        }
    }

    move() {
        const head = { ...this.segments[0] };
        this.direction = this.nextDirection;

        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        this.segments.unshift(head);
        
        // Only remove tail if we haven't just eaten
        if (!this.ghostSegment) {
            this.segments.pop();
        } else {
            // Handle ghost segment solidification
            this.foodCollected++;
            if (this.foodCollected >= 2) {
                this.ghostSegment = null;
                this.foodCollected = 0;
            }
        }
    }

    checkCollision(width, height) {
        const head = this.segments[0];
        const maxX = Math.floor(width / this.gridSize);
        const maxY = Math.floor(height / this.gridSize);

        // Wall collision
        if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
            return true;
        }

        // Self collision - start from index 1 to skip head
        for (let i = 1; i < this.segments.length; i++) {
            if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
                return true;
            }
        }

        return false;
    }

    checkFoodCollection(foodPosition) {
        const head = this.segments[0];
        if (head.x === foodPosition.x && head.y === foodPosition.y) {
            this.ghostSegment = { ...this.segments[this.segments.length - 1] };
            return true;
        }
        return false;
    }

    getSegmentStyle(index) {
        if (index === 0) return 'head';
        if (this.ghostSegment && index === this.segments.length - 1) return 'ghost';
        return 'body';
    }
}