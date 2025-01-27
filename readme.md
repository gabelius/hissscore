# Smart Snake Game

## Features

1. **Core Mechanics**:
   - Snake movement with collision detection.
   - Auto-mode with simplified pathfinding logic.
   - Food spawns as either apples or hearts (30% chance for hearts when lives < 3).
   - 3 lives system: losing all lives ends the game.
   - Level progression: Score thresholds trigger higher levels with increased speed.

2. **UI and Controls**:
   - HUD displaying score, lives, current level, and level name.
   - Responsive canvas for desktop and mobile play.
   - Controls via keyboard or touch gestures.
   - Buttons for Start/Pause, Auto-mode, Speed, Color Themes, and Day/Night toggle.

3. **Themes and Levels**:
   - **Translucent Canvas**: The game canvas is translucent, allowing background images to show through.
   - **Level-Based Themes**: Each level has a unique theme with a background image and snake color.
     - **Level 1**: "The Green Meadow" - Snake: Green, Background: meadow.jpg
     - **Level 2**: "The Desert Mirage" - Snake: Sandy Brown, Background: desert.jpg
     - **Level 3**: "The Mystic Forest" - Snake: Dark Green, Background: forest.jpg
     - **Level 4**: "The Arctic Tundra" - Snake: Ice Blue, Background: tundra.jpg
     - **Level 5**: "The Molten Core" - Snake: Lava Red, Background: lava.jpg
     - **Level 6**: "The Starry Night" - Snake: Neon Blue, Background: stars.jpg
     - **Level 7**: "The Ocean Depths" - Snake: Deep Sea Teal, Background: ocean.jpg
     - **Level 8**: "The Golden Sands" - Snake: Golden Yellow, Background: beach.jpg
     - **Level 9**: "The Thunder Plains" - Snake: Electric Purple, Background: storm.jpg
     - **Level 10**: "The Cosmic Void" - Snake: Cosmic Black, Background: cosmos.jpg

4. **Auto Features**:
   - Game auto-starts after 5 seconds of inactivity, switching to auto-mode.
   - A philosophical/funny quote and countdown are displayed before auto-start.

5. **Extras**:
   - Snake-themed riddles with answers, cycling every 15 seconds.
   - Fun snake facts displayed during auto-start or game-over countdown.

## Outstanding Issues

1. **Night Mode**:
   - Fully integrated with color definitions from `config.yaml`.
   - Night mode button not working as intended.

2. **Color Modes**:
   - Functionality for switching color modes (Rainbow, Pastel, Neon, Grayscale) is now complete.

3. **Level Story**:
   - A narrative connecting each level theme and its progression is a **future topic**.

## Configuration Files

1. **`config.yaml`**:
   - Stores game settings, primary colors, and night mode color configurations.
   - Now includes level themes with associated names, snake colors, background images, and independent JSON files for facts and riddles per level.

2. **Level-Based JSON Files**:
   - Each level has a unique facts and riddles file (e.g., `level1_facts.json`, `level1_riddles.json`).

## Pending Fixes

- Add level-based themes and dynamically load snake colors and background images.
- Update HUD to display the current level and level name.
- Verify and refine UI elements for consistency and usability.



