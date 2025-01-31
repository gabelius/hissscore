
import { GameState, RenderSystem } from './coreGame.js';

const RiddleSystem = {
    riddleIndex: 0,
    animationFrame: null,
    startTime: null,
    lastUpdateTime: 0,
    QUESTION_DURATION: 10,
    ANSWER_DURATION: 5,
    isShowingAnswer: false,
    timeLeft: 10,

    startRiddles() {
        const updateRiddle = (timestamp) => {
            if (!this.startTime) {
                this.startTime = timestamp;
            }

            const elapsed = timestamp - this.startTime;

            if (!this.isShowingAnswer && elapsed >= this.QUESTION_DURATION * 1000) {
                this.isShowingAnswer = true;
                this.timeLeft = this.ANSWER_DURATION;
                this.startTime = timestamp;
            } else if (this.isShowingAnswer && elapsed >= this.ANSWER_DURATION * 1000) {
                this.isShowingAnswer = false;
                this.timeLeft = this.QUESTION_DURATION;
                this.riddleIndex = (this.riddleIndex + 1) % GameState.config.riddles.length;
                this.startTime = timestamp;
            } else {
                this.timeLeft = this.isShowingAnswer 
                    ? Math.max(0, this.ANSWER_DURATION - Math.floor(elapsed / 1000))
                    : Math.max(0, this.QUESTION_DURATION - Math.floor(elapsed / 1000));
            }

            this.lastUpdateTime = timestamp;
            RenderSystem.draw();

            if (!GameState.isGameOver) {
                this.animationFrame = requestAnimationFrame(updateRiddle);
            }
        };

        this.startTime = null;
        this.lastUpdateTime = 0;
        this.timeLeft = 10;
        this.animationFrame = requestAnimationFrame(updateRiddle);
    },

    stopRiddles() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.startTime = null;
        this.lastUpdateTime = 0;
        this.riddleIndex = 0;
        this.isShowingAnswer = false;
        this.timeLeft = 10;
    }
};

export default RiddleSystem;