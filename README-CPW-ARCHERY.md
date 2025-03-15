# CPW Archery Game

A fun archery game built with Three.js where players shoot arrows at crypto logos to lower the CPW (Cost Per Whatever).

## Game Overview

In CPW Archery, you take on the role of an archer trying to optimize your crypto marketing budget by hitting the right targets. The game features:

- First-person archery gameplay
- Voxel/Minecraft-inspired visual style with neon accents
- Target practice with crypto and web2 logos
- Special "Addressable Power" that helps you target the right logos

## How to Play

1. **Objective**: Lower your CPW by hitting crypto logos (correct targets) and avoid hitting web2 logos (wrong targets).
2. **Controls**:
   - **Mouse**: Aim your bow
   - **Left Click**: Shoot an arrow
   - **Addressable Power Button**: Activate special targeting when charged

3. **Scoring**:
   - Hitting correct targets (crypto logos) lowers your CPW and increases your score
   - Hitting incorrect targets (web2 logos) increases your CPW and decreases your score
   - The game ends when your CPW reaches 0 (you win!) or 200 (you lose!)

4. **Levels**:
   - Each level gives you 10 arrows
   - Targets move faster in higher levels
   - Complete a level by using all your arrows

## Setup Instructions

1. Clone this repository
2. Open `cpw-archery.html` in your browser
3. Click on the game to start playing (enables pointer lock for first-person controls)

## Generating Logo Images

The game includes a utility script to generate placeholder logo images:

1. Open the browser console after loading the game
2. Run the `generateLogoImages()` function
3. Save the downloaded images to the `img/logos` directory

## Technologies Used

- Three.js for 3D rendering
- JavaScript for game logic
- HTML/CSS for UI elements

## Credits

Created as a fun project to demonstrate Three.js capabilities and gamify the concept of optimizing CPW in crypto marketing.

Enjoy the game! 