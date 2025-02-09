export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridSize = 20;
        this.effects = new Map();
        this.setupEffects();
        this.foodLastPosition = null; // ensure this is defined
        this.sparkles = []; // added array for sparkle events
        this.lastFlashedThreshold = 0; // new property to track last flash threshold
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
        this.drawSparkles(); // draw active sparkle events
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

        // Add pulsating glow effect
        const t = Date.now() / 500; // pulsating period
        const glow = Math.abs(Math.sin(t)) * 20; // glow intensity

        this.ctx.save();
        this.ctx.shadowColor = 'orange'; // glow color for food
        this.ctx.shadowBlur = glow;
        this.ctx.fillStyle = 'red'; // prominent food color
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
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

    // New helper to draw a rounded rectangle
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // New helper to darken a hex color by a percent (expects "#rrggbb" format)
    darkenColor(c, percent) {
        let num = parseInt(c.slice(1), 16),
            amt = Math.floor(2.55 * percent),
            r = (num >> 16) - amt,
            g = ((num >> 8) & 0x00FF) - amt,
            b = (num & 0x0000FF) - amt;
        return "#" + (
            0x1000000 +
            (r < 0 ? 0 : r > 255 ? 255 : r) * 0x10000 +
            (g < 0 ? 0 : g > 255 ? 255 : g) * 0x100 +
            (b < 0 ? 0 : b > 255 ? 255 : b)
        ).toString(16).slice(1);
    }

    drawSnakeHead(x, y, direction) {
        const size = this.gridSize;
        // Create a neon gradient for the head to simulate a cyberpunk 3D look
        const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#00ffff');
        this.ctx.fillStyle = gradient;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffff';
        this.drawRoundedRect(x, y, size, size, size * 0.25);
        this.ctx.shadowBlur = 0;

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
            const baseColor = effect ? effect(x / size, y / size, time) : '#ffffff';
            // Create a neon gradient based on the effect color
            const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, this.darkenColor(baseColor, 20)); // darken by 20%
            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#00ffff';
            this.drawRoundedRect(x, y, size, size, size * 0.25);
            this.ctx.shadowBlur = 0;
        }
    }

    drawGhostSegment(x, y) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
    }

    animateFoodEaten() {
        const duration = 300; // animation duration in ms
        const startTime = Date.now();
        const grid = this.gridSize; // default grid size

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            if (progress < 1 && this.foodLastPosition) {
                const alpha = 1 - progress;
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.strokeStyle = 'yellow';
                this.ctx.lineWidth = grid * progress;
                this.ctx.beginPath();
                this.ctx.arc(this.foodLastPosition.x + grid / 2, this.foodLastPosition.y + grid / 2, grid / 2 + grid * progress, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.restore();
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // New helper to draw a star shape
    drawStar(cx, cy, spikes, outerRadius, innerRadius, rotation = 0) {
        const ctx = this.ctx;
        let rot = Math.PI / 2 * 3 + rotation;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    // Modified animateScoreSparkle to push a pulse event for concentric circles
    animateScoreSparkle(position, score) {
        const neonColors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0000'];
        this.sparkles.push({
            position: { ...position },
            startTime: Date.now(),
            duration: 1500,  // duration in ms
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
    }

    // Modified drawSparkles to draw radiating concentric circles with pulsating neon colors
    drawSparkles() {
        const now = Date.now();
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const pulse = this.sparkles[i];
            const elapsed = now - pulse.startTime;
            const progress = elapsed / pulse.duration;
            if (progress >= 1) {
                this.sparkles.splice(i, 1);
                continue;
            }
            const alpha = 1 - progress;
            const baseRadius = this.gridSize * 1.5 * progress;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = pulse.color;
            this.ctx.lineWidth = 4;
            // Draw 3 concentric circles with increasing radii
            for (let j = 0; j < 3; j++) {
                const radius = baseRadius + j * (this.gridSize * 0.3);
                this.ctx.beginPath();
                this.ctx.arc(
                    pulse.position.x * this.gridSize + this.gridSize / 2,
                    pulse.position.y * this.gridSize + this.gridSize / 2,
                    radius,
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    }

    // Updated helper to check if the current score matches a trigger threshold and fire flash
    checkScoreThreshold(score) {
        const thresholds = [10, 20, 50];
        if (thresholds.includes(score)) {
            this.animateScoreFlash(score);
        }
    }

    animateScoreFlash(score) {
        console.log("Flashing score animation triggered for:", score);
        const duration = 2000; // animation lasts 2 seconds
        const startTime = Date.now();
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        // Define start and end positions so text travels fully across the canvas.
        const startX = -100;
        const endX = canvasWidth + 100;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            if (progress > 1) return;
            ctx.save();
            ctx.globalAlpha = 1 - progress; // fade out over time
            // Compute x moving from startX to endX
            const x = startX + (endX - startX) * progress;
            const y = canvasHeight / 2;
            // Neon gradient for text
            const gradient = ctx.createLinearGradient(x, y - 50, x, y + 50);
            gradient.addColorStop(0, "#ff00ff");
            gradient.addColorStop(1, "#00ffff");
            ctx.font = "bold 48px sans-serif";
            ctx.fillStyle = gradient;
            ctx.fillText(`Score: ${score}`, x, y);
            ctx.restore();
            requestAnimationFrame(animate);
        };

        animate();
    }
}