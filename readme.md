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
   - **Auto mode that starts automatically**
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
   - HUD displaying score, lives, current level, timer, and level name.
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
   - GameSystem: Central state & game logic management
   - RenderSystem: Graphics & UI rendering
   - PhysicsSystem: Movement & collision handling
   - WorldSystem: Environment & game features
   - EventSystem: Input & control handling

2. **State Management**:
   - Centralized in GameSystem.state
   - Event-driven updates
   - YAML configuration
   - Clean system isolation

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

### 2024-01-25 UTC
- **Fix**: UI and Performance
  - Removed redundant speed display from HUD
  - Added sound loading error handling
  - Fixed inactivity timer management
  - Updated documentation

### Developer Instructions
1. Keep changes modular and system-focused
2. Update README with new requirements
3. Document system understanding
4. Include code change explanations
5. Track user feedback and issues

## Implementation Status

1. ✅ **Core Systems**:
   - State Management (Implemented in GameSystem)
   - Rendering (Implemented in RenderSystem)
   - Collision Detection (Implemented in GameWorldSystem)
   - Food System (Implemented in GameWorldSystem)
   - UI System (Implemented in CSS and HTML)
   - Riddle System (Removed in current version)
   - Sound System (NEW: Added audio feedback)

2. ✅ **Features**:
   - Auto-mode pathfinding (Implemented in GameWorldSystem)
   - Level progression (Implemented in GameSystem)
   - Score system (Implemented in GameSystem)
   - Hearts system (Implemented in GameSystem)
   - Auto-start (Implemented in GameWorldSystem)

3. ✅ **Current Issues**:
   - All major issues have been resolved
   - Core systems are functioning as expected
   - UI and controls are working properly

4. 📝 **Future Improvements**:
   - Add sound effects
   - Implement achievement system
   - Add local high scores
   - Consider re-implementing riddle system
   - Add more power-ups
   - Add sound effect volume control
   - Add mute button

## Known Issues

1. **UI Issues** (✅ FIXED):
   - HUD text shifting: Fixed with monospace fonts and min-width in CSS
   - Riddle text blurriness: Fixed with CSS text rendering properties
   - Dark mode: Implemented with proper CSS variables
   - Color schemes: Working with themed CSS classes
   - Update: All UI issues have been resolved in the latest CSS implementation

2. **Auto Mode** (✅ FIXED):
   - Toggle functionality: Implemented in GameSystem
   - State management: Fixed with centralized state in GameSystem
   - Button feedback: Added active-mode CSS classes
   - Path finding: Implemented in GameWorldSystem
   - Update: Auto mode is fully functional with proper visual feedback

3. **GameSystem Refactor** (✅ FIXED):
   - State management: Centralized in GameSystem
   - System separation: Implemented modular architecture
   - Event handling: Properly organized in GameSystem
   - Update: Complete system refactoring implemented

4. **Riddle System** (❌ REMOVED):
   - The riddle system has been removed from the current implementation
   - Related code and styles have been commented out
   - May be reimplemented in future versions

5. **Movement Issues** (✅ FIXED):
   - Snake dying from opposite movement: Fixed with direction validation
   - Added checks for keyboard controls
   - Added checks for touch controls
   - Implemented safe movement logic

5. **Timer Issues** (✅ FIXED):
   - Inactivity timer persisting after game start
   - Sound loading error handling
   - Auto-mode timer cleanup
   - UI simplification

## Change History

### 2024-01-25 UTC
- **Fix**: Snake Movement
  - Added validation to prevent opposite direction movement
  - Fixed snake death from reverse movement
  - Updated both keyboard and touch controls
  - Added direction validation documentation

### 2024-01-25 UTC
- **Feature**: Sound Effects
  - Added SoundSystem for audio management
  - Added sound effects for eating food
  - Added sound effects for snake death
  - Added sound effects for collisions
  - Implemented volume control

### 2024-01-24 18:00 UTC
- **Fix**: Auto Mode Toggle
  - Fixed auto mode toggle during gameplay
  - Added visual feedback for mode changes
  - Improved state management
  - Added keyboard override for auto mode
  - Updated documentation

### 2024-01-24 17:00 UTC
- **Fix**: Visual and Control Issues
  - Fixed HUD text shifting with monospace font
  - Improved riddle text rendering
  - Implemented proper dark mode system
  - Fixed color scheme selection
  - Added multi-color snake support
  - Fixed auto mode toggle
  - Updated documentation

### 2024-01-24 16:00 UTC
- **Fix**: UI Stability
  - Added fixed widths to HUD elements
  - Implemented proper alignment
  - Fixed content shifting issues
  - Improved layout consistency

### 2024-01-24 15:45 UTC
- **Fix**: Game Mode Switching
  - Prevented mode switching during gameplay
  - Added mode lock during active game
  - Updated control system logic
  - Improved mode selection UI
  - Added mode switching documentation

### 2024-01-24 15:30 UTC
- **Enhancement**: Visual Improvements
  - Added snake outline for better visibility
  - Made game canvas semi-transparent
  - Added highlight effect to snake segments
  - Improved contrast against backgrounds
  - Fixed snake visibility in all levels

### 2024-01-24 15:15 UTC
- **Fix**: Auto Mode Behavior
  - Simplified pathfinding algorithm
  - Improved directional decision making
  - Fixed stuck movement patterns
  - Added immediate food collection
  - Removed unnecessary delays

### 2024-01-24 15:00 UTC
- **Bug Fix**: Multiple System Issues
  - Fixed missing nextLevel function
  - Added LevelSystem module
  - Fixed game initialization sequence
  - Improved state management
  - Added proper error handling

### 2024-01-24 14:45 UTC
- **Feature**: AI Improvements
  - Added basic A* pathfinding
  - Implemented fallback movement
  - Added safe move detection
  - Fixed auto mode activation

### 2024-01-24 14:30 UTC
- **Bug Fix**: Game start and auto mode not working
  - Fixed game initialization
  - Added proper event handlers
  - Fixed state management
  - Added WASD controls

### 2024-01-24 14:15 UTC
- **Feature**: Enhanced Riddle System
  - Added 10s question timer
  - Implemented 5s answer display
  - Added fade transitions
  - Fixed timer synchronization
  - Added proper cleanup

### 2024-01-24 14:00 UTC
- **Refactor**: Code Organization
  - Separated game systems
  - Added modular architecture
  - Improved state management
  - Added documentation

### 2024-01-24 13:45 UTC
- **Bug Fix**: Collision and Level Issues
  - Fixed snake collision handling
  - Fixed level progression
  - Added heart collection system
  - Fixed game over state

### 2024-01-24 13:30 UTC
- **Initial Commit**
  - Basic game functionality
  - Snake movement system
  - Food spawning
  - Score tracking
  - Level system

## Debug Guide

### Common Issues and Solutions

1. **Game Not Starting**
   - Check GameState.isGameStarted flag
   - Verify event listener setup
   - Check console for YAML loading errors

2. **Auto Mode Issues**
   - Check MovementSystem.findPathToFood implementation
   - Verify path calculation
   - Monitor snake collision avoidance

3. **Level Progression**
   - Verify score thresholds in config.yaml
   - Check LevelSystem.nextLevel function
   - Monitor level state transitions

4. **Performance Issues**
   - Watch RequestAnimationFrame timing
   - Check render optimization
   - Monitor memory usage with long sessions

### Testing Checklist

1. **Core Functionality**
   - [ ] Manual movement (arrow keys + WASD)
   - [ ] Auto mode pathfinding
   - [ ] Collision detection
   - [ ] Score tracking
   - [ ] Level progression

2. **UI Elements**
   - [ ] Score display updates
   - [ ] Heart system works
   - [ ] Level transitions
   - [ ] Theme switching
   - [ ] Riddle system timing

3. **Mobile Support**
   - [ ] Touch controls responsive
   - [ ] UI scales correctly
   - [ ] Gestures working
   - [ ] Performance acceptable

## Issue Tracking

Each issue is now tracked with timestamps for better debugging and feature implementation tracking. When adding new issues or fixes, please include:

1. Timestamp (UTC)
2. Issue/Feature Category
3. Detailed Description
4. Related Systems
5. Status (🔴 Critical, 🟡 Important, 🟢 Minor)

## Technical Documentation

### Rendering System
- Canvas uses semi-transparent background (rgba(255, 255, 255, 0.15))
- Snake segments have:
  - Main color fill from level theme
  - Black outline (2px) for contrast
  - White highlight (30% opacity) for depth
  - Rounded corners (5px radius)

### Visual Effects
1. **Snake Visibility**:
   - Outline stroke: 2px black
   - Highlight: 30% white
   - Segments: Level-based colors
   - Shape: Rounded rectangles

2. **Canvas Effects**:
   - Background: 15% white
   - Backdrop filter: blur(2px)
   - Border: Level-based accent color

3. **UI Elements**:
   - Backdrop blur for overlays
   - Semi-transparent backgrounds
   - Consistent color schemes
   - Smooth transitions

## Game Modes

1. **Manual Mode**:
   - Started by clicking "Start" button
   - Uses keyboard (arrows/WASD) or touch controls
   - Cannot switch to auto mode while running
   - Must end game to change modes

2. **Auto Mode**:
   - Started by clicking "Auto" button
   - Uses A* pathfinding with fallback logic
   - Cannot switch to manual mode while running
   - Must end game to change modes

3. **Auto-Start Feature**:
   - Activates after 5 seconds of inactivity
   - Automatically starts in auto mode
   - Can be interrupted by manual interaction

## Current Implementation
- Modular system architecture
- Core gameplay mechanics
- Theme system
- Auto-mode with pathfinding
- Level progression

## Project Structure

### Directory Layout
[Directory structure as shown above]

## Setup
1. Place background images in /assets
2. Configure levels in config.yaml
3. Place sound files (.wav) in /assets/sounds:
   - eat.wav: Food eating sound
   - die.wav: Game over sound
   - hit.wav: Collision sound
4. Start local server
5. Open index.html

---
Last updated: 2024-01-25 UTC



