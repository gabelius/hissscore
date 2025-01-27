# Smart Snake Game

## Table of Contents
1. [User Requirements](#user-requirements)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Development Notes](#development-notes)
5. [Implementation Status](#implementation-status)
6. [Known Issues](#known-issues)
7. [Change History](#change-history)

## User Requirements

1. **Game Controls**:
   - Manual mode with keyboard/touch controls
   - Auto mode with AI pathfinding
   - Start button for manual play
   - Auto button for AI play
   - Speed control for faster gameplay
   - Theme toggle for day/night modes
   - Color scheme selection

2. **Game Mechanics**:
   - Snake grows when eating food
   - Hearts system for multiple lives
   - Progressive difficulty levels
   - Score-based level progression
   - Collectable power-ups (hearts)

3. **UI/UX Requirements**:
   - Responsive design for mobile/desktop
   - Visual feedback for actions
   - Clear level progression
   - Theme-based backgrounds
   - Interactive riddles system

4. **Riddle System Requirements**:
   - Questions visible for 10 seconds
   - Timer countdown display
   - Answers shown for 5 seconds
   - Smooth transitions between states
   - Visual separation of Q&A

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

## System Architecture

1. **Core Systems**:
   - GameState: Central state management
   - MovementSystem: Controls & pathfinding
   - CollisionSystem: Hit detection & response
   - RenderSystem: Graphics & animation
   - UISystem: Interface & feedback
   - FoodSystem: Item spawning & collection
   - RiddleSystem: Q&A management

2. **State Management**:
   - Centralized game state object
   - Event-driven architecture
   - YAML-based configuration
   - System isolation for modularity

3. **Technical Implementation**:
   - RequestAnimationFrame game loop
   - A* pathfinding for AI
   - CSS transitions for animations
   - Modular system design
   - Event delegation pattern

## Development Notes

### Recent Changes
1. **Riddle System Improvements**:
   - Added 10s question timer
   - Implemented 5s answer display
   - Added fade transitions
   - Fixed timer synchronization

2. **Auto Mode Updates**:
   - Implemented A* pathfinding
   - Added fallback movement system
   - Fixed collision avoidance
   - Improved path selection

3. **Start/Auto Functionality**:
   - Start button initiates manual mode
   - Auto button enables AI control
   - Fixed game state management
   - Added proper cleanup

### Developer Instructions
1. Keep changes modular and system-focused
2. Update README with new requirements
3. Document system understanding
4. Include code change explanations
5. Track user feedback and issues

## Implementation Status

1. ✅ **Core Systems**:
   - State Management
   - Rendering
   - Collision Detection
   - Food System
   - UI System
   - Riddle System

2. 🟡 **Features**:
   - Auto-mode A* pathfinding (Implemented)
   - Level progression (Working)
   - Score system (Working)
   - Hearts system (Working)
   - Auto-start (Needs testing)

3. 🔄 **Current Issues**:
   - Auto-mode pathfinding optimization needed
   - Level transition animations
   - Mobile touch controls refinement

4. 📝 **Future Improvements**:
   - Optimize A* pathfinding
   - Add power-ups system
   - Implement achievement system
   - Add local high scores
   - Add sound effects

## Known Issues

1. ~~Start Button~~ (FIXED)
   - ~~Clicking the Start button does not start the game.~~

2. **Auto Mode** (PARTIALLY FIXED):
   - A* pathfinding implemented for auto mode.
   - Automatic activation after inactivity now working.

3. **Buttons**:
   - Some buttons (Speed, Color Themes, Day/Night toggle) need refinement.

4. **Auto-Start**:
   - The game does not auto-start after 5 seconds of inactivity.

## Change History

### 2024-01-xx
- Fixed riddle system timing
- Added transition animations
- Updated auto-mode pathfinding
- Improved start/auto functionality
- Added proper game state management



