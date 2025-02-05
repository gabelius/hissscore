export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridSize = 20;
        this.effects = new Map();
        this.setupEffects();
    }

    setupEffects() {
        this.effects.set('pulse', (x, y, time) => {
            const intensity = 0.7 + 0.3 * Math.sin(time / 200);
            return `rgba(0, 255, 0, ${intensity})`;
        });

        this.effects.set('circuit', (x, y) => {
            return (x + y) % 2 === 0 ? '#00ffff' : '#008888';
        });

        this.effects.set('shimmer', (x, y, time) => {
            const intensity = 0.7 + 0.3 * Math.sin((x + y + time / 100) / 2);
            return `rgba(255, 0, 255, ${intensity})`;
        });

        this.effects.set('particles', (x, y, time) => {
            const particle = Math.sin(x * 0.5 + y * 0.5 + time / 200) * 0.5 + 0.5;
            return `rgba(255, 255, 0, ${0.7 + 0.3 * particle})`;
        });

        this.effects.set('wave', (x, y, time) => {
            const wave = Math.sin(x * 0.3 + time / 200) * Math.cos(y * 0.3 + time / 200);
            return `rgba(255, 0, 0, ${0.7 + 0.3 * wave})`;
        });

        this.effects.set('matrix', (x, y, time) => {
            const digital = Math.random() > 0.95 ? 1 : 0.7;
            return `rgba(0, 255, 0, ${digital})`;
        });

        this.effects.set('beam', (x, y, time) => {
            const beam = Math.sin(x + y + time / 100);
            return `rgba(255, 128, 0, ${0.7 + 0.3 * beam})`;
        });

        this.effects.set('transparent', (x, y, time) => {
            const alpha = 0.4 + 0.3 * Math.sin(time / 200);
            return `rgba(128, 255, 128, ${alpha})`;
        });

        this.effects.set('phase', (x, y, time) => {
            const phase = Math.sin(x * 0.2 + y * 0.2 + time / 150);
            const r = 128 + 127 * phase;
            const b = 128 + 127 * Math.cos(phase);
            return `rgb(${r}, 128, ${b})`;
        });

        this.effects.set('combined', (x, y, time) => {
            const effects = Array.from(this.effects.values());
            const randomEffect = effects[Math.floor(time / 1000) % (effects.length - 1)];
            return randomEffect(x, y, time);
        });
    }

    render(snake, food, level) {
        this.clear();
        this.drawGrid();
        this.drawFood(food);
        this.drawSnake(snake, level);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.1)';
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawFood(food) {
        const x = food.position.x * this.gridSize;
        const y = food.position.y * this.gridSize;
        
        if (food.type === 'heart') {
            this.drawHeart(x, y);
        } else {
            this.drawRegularFood(x, y);
        }
    }

    drawRegularFood(x, y) {
        const radius = this.gridSize / 3;
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            radius,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fill();
    }

    drawHeart(x, y) {
        const size = this.gridSize;
        x += size / 2;
        y += size / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size / 4);
        
        // Left curve
        this.ctx.bezierCurveTo(
            x - size / 3, y, 
            x - size / 3, y - size / 3, 
            x, y - size / 6
        );
        
        // Right curve
        this.ctx.bezierCurveTo(
            x + size / 3, y - size / 3, 
            x + size / 3, y, 
            x, y + size / 4
        );
        
        this.ctx.fillStyle = '#ff4081';
        this.ctx.fill();
    }

    drawSnake(snake, level) {
        const design = level.getCurrentDesign();
        const effect = this.effects.get(design.effect);
        const time = performance.now();

        snake.segments.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const segmentStyle = snake.getSegmentStyle(index);

            this.ctx.beginPath();
            if (segmentStyle === 'head') {
                // Draw head
                this.drawSnakeHead(x, y, snake.direction);
            } else {
                // Draw body segment
                this.drawSnakeSegment(x, y, segmentStyle, effect, time);
            }
        });

        // Draw ghost segment if exists
        if (snake.ghostSegment) {
            const x = snake.ghostSegment.x * this.gridSize;
            const y = snake.ghostSegment.y * this.gridSize;
            this.drawGhostSegment(x, y);
        }
    }

    drawSnakeHead(x, y, direction) {
        const size = this.gridSize;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, y, size, size);

        // Draw eyes
        const eyeSize = size / 5;
        const eyeOffset = size / 4;
        this.ctx.fillStyle = '#000000';

        switch (direction) {
            case 'right':
                this.ctx.fillRect(x + size - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + size - eyeOffset, y + size - eyeOffset - eyeSize, eyeSize, eyeSize);
                break;
            case 'left':
                this.ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + eyeOffset - eyeSize, y + size - eyeOffset - eyeSize, eyeSize, eyeSize);
                break;
            case 'up':
                this.ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                this.ctx.fillRect(x + size - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                break;
            case 'down':
                this.ctx.fillRect(x + eyeOffset, y + size - eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + size - eyeOffset - eyeSize, y + size - eyeOffset, eyeSize, eyeSize);
                break;
        }
    }

    drawSnakeSegment(x, y, style, effect, time) {
        const size = this.gridSize;
        
        if (style === 'ghost') {
            this.drawGhostSegment(x, y);
        } else {
            this.ctx.fillStyle = effect ? effect(x / size, y / size, time) : '#ffffff';
            this.ctx.fillRect(x, y, size, size);
        }
    }

    drawGhostSegment(x, y) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
    }
}