#  FLAPPY HORIZON

[![OpenGL](https://img.shields.io/badge/OpenGL-4.5-blue.svg)](https://www.opengl.org/)
[![C++](https://img.shields.io/badge/C++-17-green.svg)](https://isocpp.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey.svg)](https://www.microsoft.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Soar Beyond Limits** — A visually stunning, progressively challenging Flappy Bird clone with dynamic day/night cycles, animated environments, and immersive sound design.

---

##  Web Demo

 **Play Now:** [Play Flappy Horizon](https://robiul-hasan-jisan.github.io/Flappy-Horizon/)

>  **Note:** > This web version is a simplified demonstration built to showcase the core gameplay mechanics and system design. It does not fully represent the complete OpenGL-based desktop version, but follows a similar architecture, logic flow, and development approach.

## Overview

**Flappy Horizon** is a feature-rich reimagining of the classic Flappy Bird game, built with **OpenGL** and **C++**. Unlike the original, this version features:

-  **Rich, animated environments** with mountains, trees, flowers, butterflies, and ladybugs
-  **Dynamic day/night cycles** with realistic sky gradients
-  **Progressive difficulty system** that evolves as your score increases
-  **Immersive sound effects** for jumps, collisions, and level-ups
-  **Life system** with visual heart indicators
-  **High score tracking** across gaming sessions

---

## Features

### Core Gameplay
- Smooth physics-based bird movement with gravity simulation
- Procedurally generated pipes with dynamic gap positioning
- Score-based difficulty scaling
- 3-lives system with second chances
- Instant restart functionality

### Visual Excellence
- **Day/Night Cycle**: 6 unique keyframes (Dawn, Morning, Noon, Afternoon, Dusk, Night)
- **Animated Environment**:
  - 35+ unique flowers with facial animations
  - 12 animated ladybugs crawling on grass
  - 8 graceful butterflies floating through the air
  - 60+ twinkling stars with shooting stars at night
  - Animated clouds with smooth scrolling
- **Scenic Background**:
  - Layered mountains with snow caps
  - Detailed trees (pine and oak varieties)
  - Cozy house with glowing windows
  - Wooden fences and winding paths
- **Special Effects**:
  - Dynamic sunset/sunrise color blending
  - Floating dust particles in sunlight
  - Chimney smoke animation
  - Animated bird with flapping wings and rotation

### Progressive Difficulty
| Level | Score Range | Pipe Behavior |
|-------|-------------|---------------|
| 1 | 0-4 pts | Static pipes (no movement) |
| 2 | 5-9 pts | Slow vertical movement |
| 3 | 10-14 pts | Full amplitude movement |
| 3+ | 15+ pts | Pipes flip upside down! |

- Speed increases every 5 points (up to 7.5x base speed)
- Pipe spawn rate increases with difficulty
- Maximum challenge at higher scores

---

##  Screenshots
 [![Flappy Horizon Gameplay](https://i.ibb.co.com/1GgWYxS5/image.png )](https://github.com/RoBiul-Hasan-Jisan/Flappy-Horizon/blob/main/Flappy.mp4)

---

##  System Requirements

### Minimum Requirements
| Component | Specification |
|-----------|---------------|
| **OS** | Windows 7/8/10/11 |
| **CPU** | Intel Core i3 or equivalent |
| **RAM** | 2 GB |
| **GPU** | OpenGL 2.1 compatible |
| **Storage** | 50 MB free space |
| **Sound** | Windows-compatible sound card |

### Recommended Requirements
| Component | Specification |
|-----------|---------------|
| **OS** | Windows 10/11 |
| **CPU** | Intel Core i5 or better |
| **RAM** | 4 GB |
| **GPU** | OpenGL 3.3+ compatible |
| **Storage** | 100 MB free space |

---

##  Installation Guide

### Prerequisites

1. **Install OpenGL Libraries**
   ```bash
   # Windows: Download and install from:
   # https://www.opengl.org/resources/libraries/glut/

2.**Required Files**

  - **freeglut.dll** - FreeGLUT library

  - **glut.dll** - GLUT library

  - **winmm.lib** - Windows multimedia library (built-in)

### Setup Instructions**
**Option 1:** Pre-compiled Binary (Recommended)

    - Download FlappyHorizon.exe from the Releases page

    - Place the sound files in the same directory:

    - bird_sound.wav (jump sound)

    - bird_hit.wav (collision sound)

    - Double-click to run

**Option 2:** Build from Source

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/FlappyHorizon.git
cd FlappyHorizon
```
---
**2. Configure sound paths**

Edit the source file to update sound paths:

```bash
const char* SOUND_JUMP = "your\\path\\to\\bird_sound.wav";
const char* SOUND_HIT = "your\\path\\to\\bird_hit.wav";
```
---

**3. Compile with MinGW**

```bash
g++ -o FlappyHorizon.exe main.cpp -lopengl32 -lglu32 -lglut32 -lfreeglut -lwinmm -lm
```
---
**4. Run the game**

```bash
./FlappyHorizon.exe
```
---


## How to Play

### Quick Start Guide
   - Launch the game → Developer info screen appears

   - Click "START JOURNEY" or press SPACE to begin

   - Click/SPACE/↑ to make the bird fly upward

   - Avoid pipes and navigate through the gaps

   - Survive as long as possible to achieve a high score

### Game Flow
```bash
Developer Screen → Game Start → Playing → Collision → Life Lost → Continue/Game Over
                     ↓              ↓           ↓            ↓
                  Tutorial      Score++      Lives--      High Score Update
```
---

## Game Mechanics

### Physics System

  - Gravity: -0.45f units per frame

  - Jump Force: 9.0f upward impulse

  - Terminal Velocity: Caps at -12.0f

  - Rotation: Bird rotates up to ±30° based on velocity

### Scoring System

  - +1 point for successfully passing through a pipe pair

  - Speed increase every 5 points

  - Level progression every 5 points

  - High score persists during gameplay session

### Life System
  - 3 lives initially

  - Life lost on pipe or ground collision

  - Reset position after losing a life

  - Game over when all lives are depleted

## Difficulty Progression


| Parameter        | Level 1 (Easy) | Level 2 (Normal) | Level 3 (Hard)    | Level 4+ (Insane) |
| ---------------- | -------------- | ---------------- | ----------------- | ----------------- |
| Pipe Movement    | Static         | Slow (±20px)     | Medium (±35px)    | Full (±45px)      |
| Pipe Orientation | Normal         | Normal           | Random Flip (10%) | Random Flip (30%) |
| Pipe Speed       | 2.5            | 2.5 – 3.8        | 3.0 – 5.5         | 6.0 – 5.6         |
| Spawn Delay      | 180 frames     | 150 frames       | 130–135 frames    | 85–110 frames     |
| Gap Size         | 180px          | 180px            | 180px             | 180px             |


##  Visual Features

### Day/Night Cycle Progression

| Time of Day   | Sky Colors         | Ambient Light | Special Effects        |
| ------------- | ------------------ | ------------- | ---------------------- |
|    Dawn       | Purple → Orange    | 75%           | Stars fading           |
|    Morning    | Light Blue → White | 100%          | Butterflies active     |
|    Noon       | Deep Blue → Bright | 100%          | Maximum visibility     |
|     Afternoon | Blue → Golden      | 95%           | Dust particles         |
|    Dusk       | Purple → Orange    | 70%           | Sunset glow            |
|    Night      | Dark Blue / Black  | 50%           | Stars & shooting stars |
### Environmental Details

> **Animated Elements:**
```bash

 Butterflies: 8 individuals with wing-flapping physics

 Ladybugs: 12 crawling insects with antenna movement

 Flowers: 35+ with 7 color types, some with smiling faces

 Stars: 60 twinkling stars + random shooting stars

 Clouds: 7 layered clouds with smooth scrolling

 Trees: 15+ detailed trees (pine and oak variants)

```
---

> **Static Elements:**
```bash
 Mountains: 6 layered peaks with snow caps

 House: Detailed cottage with chimney smoke

 Fence: Wooden fencing along the ground

 Path: Winding dirt path with stones

 Grass: 80 individual swaying grass blades

```
---
## Sound System

| Action      | Sound File     | Frequency      | Duration       |
| ----------- | -------------- | -------------- | -------------- |
| Jump        | bird_sound.wav | N/A            | Async playback |
| Collision   | bird_hit.wav   | N/A            | Async playback |
| Score Point | System Beep    | 600 Hz         | 50 ms          |
| Level Up    | System Beep    | 800 → 1000 Hz  | 60 ms each     |
| Flip Mode   | System Beep    | 1000 → 1200 Hz | 200 ms each    |
| Death       | System Beep    | 200 → 150 Hz   | 200 + 250 ms   |

### Sound Configuration
```bash
// Default sound paths (UPDATE THESE)
const char* SOUND_JUMP = "D:\\c++\\Flappy_Horizon\\bird_sound.wav";
const char* SOUND_HIT = "D:\\c++\\Flappy_Horizon\\bird_hit.wav";

```
---
## Controls
**Action	Input Method**
   - Jump/Fly	Spacebar / Up Arrow / Left Mouse Click
   - Start Game	Spacebar / Left Mouse Click
   - Restart	Spacebar (after game over)
   - Exit	ESC key
   - 
## Technical Details
### Architecture
```bash
┌─────────────────────────────────────────────────────┐
│                   MAIN LOOP                         │
├─────────────┬─────────────┬─────────────────────────┤
│  Display    │   Update    │      Timer              │
│  Function   │   Game      │      (16ms)             │
├─────────────┼─────────────┼─────────────────────────┤
│  Background │   Physics   │   Collision Detection   │
│  Rendering  │   System    │                         │
├─────────────┼─────────────┼─────────────────────────┤
│  UI Layer   │   Scoring   │   Difficulty Manager    │
│  (Text/UI)  │   System    │                         │
└─────────────┴─────────────┴─────────────────────────┘
```
---

### Key Components

| Component       | Technology          | Purpose                           |
| --------------- | ------------------- | --------------------------------- |
| Graphics        | OpenGL 2.1 / 3.3    | 2D rendering, textures            |
| Windowing       | GLUT / FreeGLUT     | Window management, input          |
| Audio           | WinMM (Windows)     | WAV playback, system beeps        |
| Mathematics     | Custom + cmath      | Physics, collision, animations    |
| Data Structures | STL (vector, tuple) | Pipe management, particle systems |


## Performance Optimizations

  - Static initialization for environment elements (flowers, ladybugs, butterflies)

  - Efficient particle system with frame-based updates

  - Optimized collision detection using bounding circle checks

  - Lazy loading of sound resources

## Troubleshooting

| Issue                     | Possible Cause             | Solution                            |
| ------------------------- | -------------------------- | ----------------------------------- |
| Black screen on launch    | Missing OpenGL drivers     | Update graphics drivers             |
| No sound effects          | Incorrect sound file paths | Update paths in source code         |
| Game crashes at start     | Missing DLL files          | Install freeglut.dll in system path |
| Slow performance          | Insufficient GPU power     | Close background applications       |
| Pipes not rendering       | Corrupted game state       | Restart the game                    |
| Bird falls through ground | Physics glitch             | Reset game (press SPACE)            |

## Debug Mode
> To enable console debug output:
```bash
 // Add to main() before glutMainLoop()
#ifdef _DEBUG
    cout << "Debug mode enabled" << endl;
#endif
```
---
##  Future Updates

**Planned Features**
  - Power-ups (slow motion, invincibility, score multipliers)

  - Multiple bird skins (unlockable through achievements)

  - Leaderboard system (online rankings)

  - Day/night transition effects (smoother blending)

  - Weather system (rain, fog, thunderstorms)

  - More pipe styles (metal, ice, wood, crystal)

  - Mobile touch controls (Android/iOS port)

  - Achievement system (badges and rewards)

  - Custom sound track (background music)

**Under Consideration**
  - Multiplayer mode (race against friends)

  - Level editor (create custom pipe patterns)

  - Save/load game states

  - Cloud save for high scores

## Acknowledgments

  - OpenGL Community - Documentation and tutorials

  - GLUT/FreeGLUT Developers - Windowing and input handling

  - Original Flappy Bird - Dong Nguyen (inspiration)

  - Testers - Friends and family who provided feedback



##  Author
**Robiul Hasan Jisan**

- **Portfolio:** [robiulhasanjisan.vercel.app](https://robiulhasanjisan.vercel.app/)
- **GitHub:** [@RoBiul-Hasan-Jisan](https://github.com/RoBiul-Hasan-Jisan)



