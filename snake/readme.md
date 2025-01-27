# Smart Snake Game

## Features
- Snake movement and collision detection.
- Auto-mode with pathfinding.
- Riddle system with 15-second cycles.
- Auto-start after 5 seconds of inactivity.
- Day/night mode toggle.
- Responsive design for mobile and desktop.

## Decisions
- Used a central `config.yaml` file for all game configurations.
- Separated CSS and JS for better organization.
- Implemented auto-mode with smart pathfinding.
- Added snake-themed riddles and facts.

## Description about the game to help regenerate and debug code
- The game is supposed to be either started using the start button for manual play or if no button is pressed for 5 seconds to be auto started using auto mode which uses A* path detection. This also applies after a game finishes.
- Before any autostart of the game an in game message overlay shows a funny philosophical message from a predefined list linked in the config yaml alongwith a 5 second countdown. then the game starts.
- The game can run in 4 speed modes
- each player has 3 lives, when the snake dies (touching a wall or itself), one life is consumed. when lives are less than 3, a heart spawns in the game window when eaten, the user gains an extra life.when the user runs out of lives the game is over.
- when the user clears certain thresholds, the game advances, this is shown in the level section. the game has a total of 10 levels - e.g., after 100 points of score, the game goes to level 2. each level has 2 times the scoring of the previous level, but also two times the speed. each level threshold increases by twice the previous threshold. e.g, level 3 is above 300 points, level 4 is above 700 pints and so on. 
- The snake can have 4 color modes
- Above the game window there is a HD showing lives, score and time played since the last start.
- below the game there are buttons showing, start/pause, auto mode, speed, colors, night mode - all as toggle buttons in one straight line
- text for all ui elements should be readable by using shaded backgrounds and appropriate contrasting colous. colours can be cached in the yaml file.
- below these buttons which shoul all appear in one line, is a riddle - which is snake themed (asked using snake puns) but a real riddle regardless - the question should be shown for 10 seconds followed by question plus answer for 5 seconds with an appropriate countdown. there should a 3 second countdown between questions, during which the text Like & Subscribe should be shown. 