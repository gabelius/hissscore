import { SoundSystem } from './systems/SoundSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { GameWorldSystem } from './systems/GameWorldSystem.js';
import { GameSystem } from './systems/GameSystem.js';
import { setupEventListeners } from './systems/EventSystem.js';

export const Systems = {
    SoundSystem,
    RenderSystem,
    GameWorldSystem,
    GameSystem,
    
    async init() {
        await this.SoundSystem.init();
        await this.GameSystem.init();
        setupEventListeners();
        this.GameWorldSystem.setupAutoMode();
        this.RenderSystem.draw();
    }
};

export { 
    GameSystem,
    RenderSystem, 
    GameWorldSystem,
    SoundSystem
};
