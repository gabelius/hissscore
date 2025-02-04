class AutoPlayer {
    constructor(game) {
        this.game = game;
        this.setupAutoPlayLoop();
        this.pathMemory = [];
    }

    setupAutoPlayLoop() {
        setInterval(() => {
            if (this.game.isAutoMode && !this.game.isPaused && !this.game.isGameOver) {
                this.makeMove();
            }
        }, 50);
    }

    makeMove() {
        const snake = this.game.getSnake();
        const head = snake[0];
        const food = this.game.getFood();
        
        // Calculate relative positions
        const deltaX = food.x - head.x;
        const deltaY = food.y - head.y;
        
        // Get possible moves that don't result in immediate collision
        const possibleMoves = this.getPossibleMoves(head, snake);
        
        if (possibleMoves.length === 0) {
            // If no safe moves, try following tail or emergency moves
            if (snake.length > 5) {
                const tail = snake[snake.length - 1];
                const tailDeltaX = tail.x - head.x;
                const tailDeltaY = tail.y - head.y;
                
                const emergencyMoves = this.getEmergencyMoves(head);
                if (emergencyMoves.length > 0) {
                    this.game.setNextDirection(this.chooseBestMove(emergencyMoves, tailDeltaX, tailDeltaY));
                }
            }
            return;
        }

        // If we have a path in memory, try to follow it
        if (this.pathMemory.length > 0) {
            const nextMove = this.pathMemory[0];
            if (possibleMoves.includes(nextMove)) {
                this.pathMemory.shift();
                this.game.setNextDirection(nextMove);
                return;
            }
            this.pathMemory = []; // Clear invalid path
        }

        // Calculate new path if needed
        if (this.pathMemory.length === 0) {
            this.pathMemory = this.findPath(head, food, snake);
        }

        // If we have a new path, use it, otherwise use simple direction choice
        if (this.pathMemory.length > 0) {
            this.game.setNextDirection(this.pathMemory.shift());
        } else {
            this.game.setNextDirection(this.chooseBestMove(possibleMoves, deltaX, deltaY));
        }
    }

    findPath(start, goal, snake) {
        const queue = [[start]];
        const visited = new Set();
        const key = (pos) => `${pos.x},${pos.y}`;
        visited.add(key(start));

        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];

            if (current.x === goal.x && current.y === goal.y) {
                return this.pathToDirections(path);
            }

            const moves = this.getPossibleMoves(current, snake);
            for (const move of moves) {
                const next = this.getNextPosition(current, move);
                const nextKey = key(next);
                
                if (!visited.has(nextKey)) {
                    visited.add(nextKey);
                    queue.push([...path, next]);
                }
            }
        }

        return []; // No path found
    }

    pathToDirections(path) {
        const directions = [];
        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i];
            const next = path[i + 1];
            
            if (next.x > current.x) directions.push('right');
            else if (next.x < current.x) directions.push('left');
            else if (next.y > current.y) directions.push('down');
            else if (next.y < current.y) directions.push('up');
        }
        return directions;
    }

    getNextPosition(pos, direction) {
        const next = { x: pos.x, y: pos.y };
        switch (direction) {
            case 'up': next.y--; break;
            case 'down': next.y++; break;
            case 'left': next.x--; break;
            case 'right': next.x++; break;
        }
        return next;
    }

    getPossibleMoves(head, snake) {
        const moves = ['up', 'down', 'left', 'right'];
        const possibleMoves = [];
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        moves.forEach(move => {
            if (move === opposites[this.game.getCurrentDirection()]) return;

            const newHead = { ...head };
            switch (move) {
                case 'up': newHead.y--; break;
                case 'down': newHead.y++; break;
                case 'left': newHead.x--; break;
                case 'right': newHead.x++; break;
            }

            if (!this.wouldCollide(newHead, snake)) {
                possibleMoves.push(move);
            }
        });

        return possibleMoves;
    }

    getEmergencyMoves(head) {
        const moves = ['up', 'down', 'left', 'right'];
        const possibleMoves = [];
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        moves.forEach(move => {
            if (move === opposites[this.game.getCurrentDirection()]) return;

            const newHead = { ...head };
            switch (move) {
                case 'up': newHead.y--; break;
                case 'down': newHead.y++; break;
                case 'left': newHead.x--; break;
                case 'right': newHead.x++; break;
            }

            if (!this.wouldHitWall(newHead)) {
                possibleMoves.push(move);
            }
        });

        return possibleMoves;
    }

    wouldCollide(newHead, snake) {
        return this.wouldHitWall(newHead) || this.wouldHitSnake(newHead, snake);
    }

    wouldHitWall(newHead) {
        const canvasSize = this.game.getCanvasSize();
        const gridSize = this.game.getGridSize();
        return newHead.x < 0 || 
               newHead.x >= canvasSize.width / gridSize ||
               newHead.y < 0 || 
               newHead.y >= canvasSize.height / gridSize;
    }

    wouldHitSnake(newHead, snake) {
        return snake.some(segment => 
            segment.x === newHead.x && segment.y === newHead.y
        );
    }

    chooseBestMove(possibleMoves, deltaX, deltaY) {
        // Prioritize moves based on distance and safety
        const movePriority = possibleMoves.map(move => {
            let score = 0;
            
            // Prefer moves that get us closer to the target
            switch (move) {
                case 'right': score += deltaX > 0 ? 3 : 0; break;
                case 'left': score += deltaX < 0 ? 3 : 0; break;
                case 'down': score += deltaY > 0 ? 3 : 0; break;
                case 'up': score += deltaY < 0 ? 3 : 0; break;
            }

            // Prefer moves that keep us away from walls
            const nextPos = this.getNextPosition({ x: this.game.getSnake()[0].x, y: this.game.getSnake()[0].y }, move);
            const canvasSize = this.game.getCanvasSize();
            const gridSize = this.game.getGridSize();
            
            if (nextPos.x > 1 && nextPos.x < (canvasSize.width / gridSize) - 2) score += 1;
            if (nextPos.y > 1 && nextPos.y < (canvasSize.height / gridSize) - 2) score += 1;

            return { move, score };
        });

        // Sort by score and return the best move
        movePriority.sort((a, b) => b.score - a.score);
        return movePriority[0].move;
    }
}

// Wait for DOM and game instance to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short moment to ensure game instance is created
    setTimeout(() => {
        if (typeof game !== 'undefined') {
            window.autoPlayer = new AutoPlayer(game);
        }
    }, 100);
});