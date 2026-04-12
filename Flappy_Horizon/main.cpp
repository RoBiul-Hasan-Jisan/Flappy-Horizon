#include <iostream>
#ifdef _WIN32
#include <windows.h>
#include <mmsystem.h>
#pragma comment(lib, "winmm.lib")
#endif
#include <GL/glut.h>
#include <GL/freeglut.h>
#include <math.h>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <algorithm>
#include <string>
#include <tuple>
using namespace std;
#include <algorithm>
using std::min;
using std::max;
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// GAME CONSTANTS

const int   SCREEN_WIDTH     = 800;
const int   SCREEN_HEIGHT    = 600;
const int   GROUND_HEIGHT    = 80;
bool showDeveloperScreen = true;
bool showGameScreen = false;
const float BIRD_RADIUS      = 15.0f;
const float BIRD_X           = 150.0f;

const float GRAVITY          = -0.45f;
const float JUMP_FORCE       = 9.0f;
const float MAX_FALL_SPEED   = -12.0f;
const float ROTATION_SPEED   = 4.5f;

const float PIPE_WIDTH       = 70.0f;
const float PIPE_GAP         = 180.0f;
const float BASE_PIPE_SPEED  = 2.5f;
const float MAX_PIPE_SPEED   = 7.5f;

const float PIPE_MOVE_AMPLITUDE_FULL = 45.0f;
const float PIPE_MOVE_AMPLITUDE_HALF = 20.0f;
const float PIPE_MOVE_SPEED_FULL     = 0.025f;
const float PIPE_MOVE_SPEED_HALF     = 0.012f;

int   PIPE_SPAWN_DELAY = 120;
int   BASE_SPAWN_DELAY = 120;
const int DAY_CYCLE_FRAMES = 3600;

struct RGB { float r, g, b; };

RGB lerpRGB(RGB a, RGB b, float t) {
    return { a.r + (b.r - a.r)*t,
             a.g + (b.g - a.g)*t,
             a.b + (b.b - a.b)*t };
}

struct DayKeyframe {
    RGB skyTop;
    RGB skyBottom;
    RGB groundDirt;
    RGB groundGrass;
    float ambientMult;
};

const int NUM_KEYFRAMES = 6;
DayKeyframe keyframes[NUM_KEYFRAMES] = {
    { {0.18f,0.12f,0.35f}, {0.95f,0.55f,0.30f}, {0.50f,0.32f,0.18f}, {0.35f,0.55f,0.18f}, 0.75f },
    { {0.45f,0.72f,0.98f}, {0.85f,0.92f,1.00f}, {0.60f,0.40f,0.22f}, {0.42f,0.70f,0.22f}, 1.00f },
    { {0.25f,0.60f,1.00f}, {0.60f,0.85f,1.00f}, {0.65f,0.43f,0.24f}, {0.40f,0.75f,0.20f}, 1.00f },
    { {0.30f,0.55f,0.90f}, {0.90f,0.80f,0.55f}, {0.62f,0.41f,0.22f}, {0.38f,0.68f,0.18f}, 0.95f },
    { {0.20f,0.10f,0.30f}, {0.95f,0.42f,0.18f}, {0.48f,0.30f,0.16f}, {0.32f,0.50f,0.15f}, 0.70f },
    { {0.02f,0.02f,0.10f}, {0.05f,0.05f,0.20f}, {0.25f,0.16f,0.08f}, {0.15f,0.28f,0.08f}, 0.50f },
};


// GAME VARIABLES

float birdY        = SCREEN_HEIGHT / 2;
float birdVelocity = 0;
int   score        = 0;
int   highScore    = 0;
int   lives        = 3;
bool  gameRunning  = true;
bool  gameStarted  = false;

float currentPipeSpeed = BASE_PIPE_SPEED;
int   nextSpeedScore = 5;
float pipeTimeOffset = 0.0f;
bool  pipesFlipped = false;
int   flipLevel = 3;
int   moveStartLevel = 2;
int   fullMoveLevel = 3;

struct Pipe {
    float x, gapY;
    bool counted;
    float originalGapY;
    float movePhase;
    bool isFlipped;
};
vector<Pipe> pipes;

int   frameCounter = 0;
float wingAngle    = 0;
float birdRotation = 0;

int   dayFrame     = 0;
float cloudOffset  = 0.0f;

struct Star { float x, y, brightness; };
const int NUM_STARS = 60;
Star stars[NUM_STARS];


// SOUND PATHS

const char* SOUND_JUMP = "D:\\c++\\Flappy_Horizon\\bird_sound.wav";
const char* SOUND_HIT = "D:\\c++\\Flappy_Horizon\\bird_hit.wav";

// ============================================
// FORWARD DECLARATIONS
// ============================================
void drawText(float x, float y, string text, float r, float g, float b, int size = 18);
void drawCircle(float cx, float cy, float r);
void drawGradientQuad(float x1,float y1,float x2,float y2, float r1,float g1,float b1, float r2,float g2,float b2);
void drawRivet(float cx, float cy);
void drawBird(float x, float y, float angle, float ambient);
void drawPipe(float x, float gapY, float ambient, bool flipped);
void drawBackground();
void updateGame();
void resetGame();
void handleDeath();
void spawnPipe();
void doJump();
int getCurrentLevel();

// ============================================
// REAL SOUND PLAYBACK SYSTEM
// ============================================
void playWavSound(const char* filename, bool async = true) {
#ifdef _WIN32
    FILE* file = fopen(filename, "r");
    if (file) {
        fclose(file);
        PlaySound(filename, NULL, SND_FILENAME | (async ? SND_ASYNC : SND_SYNC) | SND_NODEFAULT);
    }
#endif
}

void stopAllSounds() {
#ifdef _WIN32
    PlaySound(NULL, NULL, 0);
#endif
}

void playBeep(int freqHz, int durationMs) {
#ifdef _WIN32
    Beep(freqHz, durationMs);
#endif
}

int getCurrentSpawnDelay() {
    int level = getCurrentLevel();
    switch(level) {
        case 1:  return 180;
        case 2:  return 150;
        case 3:  return 130;
        case 4:  return 110;
        case 5:  return 95;
        case 6:  return 85;
        default: return max(70, 180 - (level * 15));
    }
}

int getCurrentLevel() {
    return (score / 5) + 1;
}

float getCurrentMoveAmplitude() {
    int level = getCurrentLevel();
    if (level >= fullMoveLevel) {
        return PIPE_MOVE_AMPLITUDE_FULL;
    } else if (level >= moveStartLevel) {
        return PIPE_MOVE_AMPLITUDE_HALF;
    } else {
        return 0.0f;
    }
}

float getCurrentMoveSpeed() {
    int level = getCurrentLevel();
    if (level >= fullMoveLevel) {
        return PIPE_MOVE_SPEED_FULL;
    } else if (level >= moveStartLevel) {
        return PIPE_MOVE_SPEED_HALF;
    } else {
        return 0.0f;
    }
}

void getDayState(RGB& skyTop, RGB& skyBottom,
                 RGB& groundDirt, RGB& groundGrass,
                 float& ambient, float& sunAngle,
                 float& nightBlend)
{
    float dayPhase = (float)dayFrame / DAY_CYCLE_FRAMES * NUM_KEYFRAMES;
    int   kA       = (int)dayPhase % NUM_KEYFRAMES;
    int   kB       = (kA + 1) % NUM_KEYFRAMES;
    float t        = dayPhase - (int)dayPhase;

    skyTop     = lerpRGB(keyframes[kA].skyTop,      keyframes[kB].skyTop,      t);
    skyBottom  = lerpRGB(keyframes[kA].skyBottom,   keyframes[kB].skyBottom,   t);
    groundDirt = lerpRGB(keyframes[kA].groundDirt,  keyframes[kB].groundDirt,  t);
    groundGrass= lerpRGB(keyframes[kA].groundGrass, keyframes[kB].groundGrass, t);
    ambient    = keyframes[kA].ambientMult + (keyframes[kB].ambientMult - keyframes[kA].ambientMult)*t;

    float normDay = (float)dayFrame / DAY_CYCLE_FRAMES;
    sunAngle = normDay * 3.14159f * 2.0f;

    float distToNight = fabs(normDay - (5.0f / NUM_KEYFRAMES));
    nightBlend = max(0.0f, 1.0f - distToNight * 8.0f);
}

void drawCircle(float cx, float cy, float r) {
    glBegin(GL_TRIANGLE_FAN);
    for (int i = 0; i <= 360; i++) {
        float rad = i * 3.14159f / 180.0f;
        glVertex2f(cx + r * cos(rad), cy + r * sin(rad));
    }
    glEnd();
}

void drawMagicalStars(float nightBlend, float ambient);
void drawCartoonCelestialBody(float sunAngle, bool isNight, float ambient);
void drawSuperCloud(float x, float y, float size, float r, float g, float b, float alpha, float timeOfDay);
void drawElegantGrassBlade(float x, float y, float height, float ambient, float waveOffset);
void drawPremiumFlower(float x, float y, float size, float ambient, int type, bool hasFace, float timeOfDay);
void drawAnimatedLadybug(float x, float y, float ambient, float timeOfDay, float id);
void drawGracefulButterfly(float x, float y, float ambient, float timeOfDay, float id);
void drawFloatingParticles(float ambient, float timeOfDay);
// Add these function declarations at the top with the others
void drawMountain(float x, float y, float width, float height, float r, float g, float b, float snowCap);
void drawTree(float x, float y, float size, float ambient, int treeType);
void drawHouse(float x, float y, float size, float ambient, float timeOfDay);
void drawFence(float x, float y, float width, float ambient);
void drawPath(float startX, float startY, float endX, float endY, float width);

void drawBackground() {
    RGB skyTop, skyBottom, groundDirt, groundGrass;
    float ambient, sunAngle, nightBlend;
    getDayState(skyTop, skyBottom, groundDirt, groundGrass, ambient, sunAngle, nightBlend);

    float timeOfDay = (float)dayFrame / DAY_CYCLE_FRAMES;

    float sunHeight = sin(sunAngle);
    float sunsetGlow = max(0.0f, 1.0f - abs(sunHeight) * 1.5f);
    float sunriseGlow = max(0.0f, sunHeight) * 0.5f;

    RGB finalSkyTop = skyTop;
    RGB finalSkyBottom = skyBottom;

    if (sunsetGlow > 0.3f) {
        finalSkyTop.r = min(1.0f, finalSkyTop.r + sunsetGlow * 0.4f);
        finalSkyTop.g = min(1.0f, finalSkyTop.g + sunsetGlow * 0.2f);
        finalSkyBottom.r = min(1.0f, finalSkyBottom.r + sunsetGlow * 0.5f);
        finalSkyBottom.g = min(1.0f, finalSkyBottom.g + sunsetGlow * 0.25f);
    }

    glBegin(GL_QUADS);
    glColor3f(finalSkyBottom.r, finalSkyBottom.g, finalSkyBottom.b);
    glVertex2f(0, GROUND_HEIGHT);
    glVertex2f(SCREEN_WIDTH, GROUND_HEIGHT);
    glColor3f(finalSkyTop.r, finalSkyTop.g, finalSkyTop.b);
    glVertex2f(SCREEN_WIDTH, SCREEN_HEIGHT);
    glVertex2f(0, SCREEN_HEIGHT);
    glEnd();

    drawFloatingParticles(ambient, timeOfDay);
    drawMagicalStars(nightBlend, ambient);

    bool isNight = (nightBlend > 0.4f);
    drawCartoonCelestialBody(sunAngle, isNight, ambient);

    // ============= DRAW MOUNTAINS IN BACKGROUND =============
    float mountainR = 0.55f + skyBottom.r * 0.2f;
    float mountainG = 0.5f + skyBottom.g * 0.2f;
    float mountainB = 0.6f + skyBottom.b * 0.15f;

    // Far mountains (lighter, more atmospheric)
    drawMountain(100, GROUND_HEIGHT - 40, 280, 220,
                 mountainR * 0.85f, mountainG * 0.85f, mountainB * 0.9f, 0.3f);
    drawMountain(450, GROUND_HEIGHT - 35, 320, 250,
                 mountainR * 0.88f, mountainG * 0.88f, mountainB * 0.92f, 0.35f);
    drawMountain(800, GROUND_HEIGHT - 45, 300, 240,
                 mountainR * 0.82f, mountainG * 0.82f, mountainB * 0.87f, 0.28f);

    // Near mountains (darker, more detailed)
    drawMountain(-50, GROUND_HEIGHT - 30, 250, 200,
                 mountainR * 0.7f, mountainG * 0.65f, mountainB * 0.75f, 0.5f);
    drawMountain(550, GROUND_HEIGHT - 25, 280, 230,
                 mountainR * 0.72f, mountainG * 0.67f, mountainB * 0.77f, 0.55f);
    drawMountain(950, GROUND_HEIGHT - 35, 260, 210,
                 mountainR * 0.68f, mountainG * 0.63f, mountainB * 0.73f, 0.45f);

    // ============= DRAW CLOUDS =============
    float cloudR, cloudG, cloudB, cloudAlpha;
    float sunInfluence = (sin(sunAngle) + 1.0f) * 0.5f;
    if (isNight) {
        cloudR = 0.4f + skyBottom.r * 0.35f + nightBlend * 0.15f;
        cloudG = 0.45f + skyBottom.g * 0.35f + nightBlend * 0.1f;
        cloudB = 0.65f + skyBottom.b * 0.3f;
        cloudAlpha = 0.55f * ambient;
    } else {
        cloudR = min(1.0f, 0.92f + sunInfluence * 0.25f);
        cloudG = min(1.0f, 0.92f + sunInfluence * 0.2f);
        cloudB = min(1.0f, 0.98f);
        cloudAlpha = 0.85f * (0.7f + ambient * 0.3f);

        if (sunsetGlow > 0.3f) {
            cloudR = min(1.0f, cloudR + sunsetGlow * 0.3f);
            cloudG = min(1.0f, cloudG + sunsetGlow * 0.2f);
        }
    }

    float co = cloudOffset;

    drawSuperCloud(fmod(80 + co * 0.38f, SCREEN_WIDTH + 350) - 175, 540, 58,
                   cloudR * 0.88f, cloudG * 0.88f, cloudB, cloudAlpha, timeOfDay);
    drawSuperCloud(fmod(450 + co * 0.45f, SCREEN_WIDTH + 350) - 175, 575, 52,
                   cloudR * 0.9f, cloudG * 0.9f, cloudB, cloudAlpha, timeOfDay);
    drawSuperCloud(fmod(780 + co * 0.42f, SCREEN_WIDTH + 350) - 175, 525, 64,
                   cloudR * 0.85f, cloudG * 0.85f, cloudB, cloudAlpha, timeOfDay);
    drawSuperCloud(fmod(150 + co * 0.65f, SCREEN_WIDTH + 300) - 150, 495, 48,
                   cloudR, cloudG, cloudB, cloudAlpha, timeOfDay);
    drawSuperCloud(fmod(520 + co * 0.72f, SCREEN_WIDTH + 300) - 150, 535, 52,
                   cloudR * 0.94f, cloudG * 0.94f, cloudB, cloudAlpha, timeOfDay);
    drawSuperCloud(fmod(890 + co * 0.68f, SCREEN_WIDTH + 300) - 150, 565, 56,
                   cloudR * 0.97f, cloudG * 0.97f, cloudB, cloudAlpha, timeOfDay);
    drawSuperCloud(fmod(1150 + co * 0.6f, SCREEN_WIDTH + 300) - 150, 480, 44,
                   cloudR * 0.91f, cloudG * 0.91f, cloudB, cloudAlpha, timeOfDay);

    // ============= GROUND LAYERS =============
    glColor3f(groundDirt.r * 1.08f, groundDirt.g * 1.03f, groundDirt.b * 0.92f);
    glBegin(GL_POLYGON);
    glVertex2f(0, 0);
    glVertex2f(SCREEN_WIDTH, 0);
    glVertex2f(SCREEN_WIDTH, GROUND_HEIGHT);
    glVertex2f(0, GROUND_HEIGHT);
    glEnd();

    glColor3f(groundDirt.r * 0.7f, groundDirt.g * 0.65f, groundDirt.b * 0.6f);
    glPointSize(1.5f);
    glBegin(GL_POINTS);
    for (int i = 0; i < 150; i++) {
        float x = rand() % SCREEN_WIDTH;
        float y = rand() % (int)(GROUND_HEIGHT - 15);
        glVertex2f(x, y);
    }
    glEnd();

    // ============= GRASS LAYER =============
    glBegin(GL_POLYGON);
    glColor3f(groundGrass.r * 1.15f, groundGrass.g * 1.2f, groundGrass.b * 0.78f);
    glVertex2f(0, GROUND_HEIGHT - 18);
    glVertex2f(SCREEN_WIDTH, GROUND_HEIGHT - 18);
    glColor3f(groundGrass.r * 0.95f, groundGrass.g * 1.05f, groundGrass.b * 0.7f);
    glVertex2f(SCREEN_WIDTH, GROUND_HEIGHT);
    glVertex2f(0, GROUND_HEIGHT);
    glEnd();

    // ============= DRAW TREES ON MOUNTAINS AND GROUND =============
    // Trees on mountain slopes
    drawTree(180, GROUND_HEIGHT - 35, 28, ambient, 0);
    drawTree(220, GROUND_HEIGHT - 38, 32, ambient, 1);
    drawTree(280, GROUND_HEIGHT - 32, 25, ambient, 0);
    drawTree(510, GROUND_HEIGHT - 33, 30, ambient, 1);
    drawTree(570, GROUND_HEIGHT - 36, 35, ambient, 0);
    drawTree(620, GROUND_HEIGHT - 30, 28, ambient, 1);
    drawTree(850, GROUND_HEIGHT - 38, 33, ambient, 0);
    drawTree(910, GROUND_HEIGHT - 35, 29, ambient, 1);
    drawTree(1050, GROUND_HEIGHT - 32, 31, ambient, 0);

    // Trees in foreground
    drawTree(40, GROUND_HEIGHT - 15, 45, ambient, 0);
    drawTree(90, GROUND_HEIGHT - 18, 50, ambient, 1);
    drawTree(340, GROUND_HEIGHT - 12, 38, ambient, 0);
    drawTree(720, GROUND_HEIGHT - 14, 42, ambient, 1);
    drawTree(1100, GROUND_HEIGHT - 16, 48, ambient, 0);
    drawTree(1180, GROUND_HEIGHT - 13, 40, ambient, 1);

    // ============= DRAW HOUSE =============
    drawHouse(640, GROUND_HEIGHT - 8, 65, ambient, timeOfDay);

    // Add chimney smoke
    if (!isNight && ambient > 0.4f) {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        float smokeX = 668;
        float smokeY = GROUND_HEIGHT + 32;
        float smokeOffset = sin(dayFrame * 0.01f) * 3.0f;
        glColor4f(0.7f, 0.7f, 0.75f, 0.3f * ambient);
        glPointSize(3.0f);
        glBegin(GL_POINTS);
        for (int i = 0; i < 15; i++) {
            float xOffset = sin(dayFrame * 0.02f + i) * (2 + i * 0.3f);
            glVertex2f(smokeX + xOffset + smokeOffset, smokeY + i * 4.0f);
        }
        glEnd();
        glDisable(GL_BLEND);
    }

    // ============= DRAW FENCE =============
    drawFence(400, GROUND_HEIGHT - 5, 180, ambient);
    drawFence(820, GROUND_HEIGHT - 5, 150, ambient);

    // ============= DRAW PATH TO HOUSE =============
    drawPath(640, GROUND_HEIGHT - 5, 640, 30, 18);

    // Add small stones on the path
    glColor3f(0.5f, 0.45f, 0.4f);
    glPointSize(2.0f);
    glBegin(GL_POINTS);
    for (int i = 0; i < 30; i++) {
        float pathX = 640 + (rand() % 30 - 15);
        float pathY = 30 + rand() % 60;
        if (abs(pathX - 640) < 12) {
            glVertex2f(pathX, pathY);
        }
    }
    glEnd();

    // ============= GRASS BLADES =============
    for (int i = 0; i < 80; i++) {
        float x = i * 15.0f + sin(dayFrame * 0.003f + i) * 4.0f;
        float height = 10 + (rand() % 20);
        float waveOffset = sin(dayFrame * 0.008f + i * 0.15f) * 2.5f;
        drawElegantGrassBlade(x, GROUND_HEIGHT, height, ambient, waveOffset);
    }

    // ============= FLOWERS =============
    static bool flowersInitialized = false;
    static vector<tuple<float, float, int, bool, float>> flowers;

    if (!flowersInitialized) {
        for (int i = 0; i < 35; i++) {
            float x = 25 + rand() % (SCREEN_WIDTH - 50);
            float size = 13 + rand() % 16;
            int type = rand() % 7;
            bool hasFace = (rand() % 4 == 0);
            float swayOffset = (float)(rand() % 100) / 100.0f;
            flowers.push_back(make_tuple(x, size, type, hasFace, swayOffset));
        }
        flowersInitialized = true;
    }

    for (auto& flower : flowers) {
        float x = get<0>(flower);
        float size = get<1>(flower);
        int type = get<2>(flower);
        bool hasFace = get<3>(flower);
        float swayOffset = get<4>(flower);

        float sway = sin(dayFrame * 0.003f + swayOffset * 10) * 3.0f;
        float baseY = GROUND_HEIGHT - 2;

        drawPremiumFlower(x + sway, baseY, size, ambient, type, hasFace, timeOfDay);

        if (rand() % 5 == 0) {
            float offsetX = x + (rand() % 25 - 12);
            float smallSize = size * 0.55f;
            drawPremiumFlower(offsetX, baseY - 1, smallSize, ambient, rand() % 7, false, timeOfDay);
        }
    }

    // ============= LADYBUGS =============
    static vector<pair<float, float>> ladybugs;
    static bool ladybugInit = false;
    if (!ladybugInit) {
        for (int i = 0; i < 12; i++) {
            float x = 50 + rand() % (SCREEN_WIDTH - 100);
            ladybugs.push_back(make_pair(x, GROUND_HEIGHT - 7));
        }
        ladybugInit = true;
    }

    for (size_t i = 0; i < ladybugs.size(); i++) {
        float x = ladybugs[i].first + sin(dayFrame * 0.004f + i) * 3.0f;
        float y = ladybugs[i].second + sin(dayFrame * 0.006f + i * 2) * 1.5f;
        drawAnimatedLadybug(x, y, ambient, timeOfDay, i);
    }

    // ============= BUTTERFLIES =============
    static vector<pair<float, float>> butterflies;
    static bool butterflyInit = false;
    if (!butterflyInit) {
        for (int i = 0; i < 8; i++) {
            float x = 80 + rand() % (SCREEN_WIDTH - 160);
            float y = 350 + rand() % 180;
            butterflies.push_back(make_pair(x, y));
        }
        butterflyInit = true;
    }

    for (size_t i = 0; i < butterflies.size(); i++) {
        float x = butterflies[i].first + sin(dayFrame * 0.006f + i) * 20.0f;
        float y = butterflies[i].second + sin(dayFrame * 0.008f + i * 2.5f) * 12.0f;
        drawGracefulButterfly(x, y, ambient, timeOfDay, i);
    }

    // ============= DUST PARTICLES =============
    if (ambient > 0.3f && !isNight) {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        static vector<pair<float, float>> dustParticles;
        static bool dustInit = false;
        if (!dustInit) {
            for (int i = 0; i < 60; i++) {
                dustParticles.push_back(make_pair(rand() % SCREEN_WIDTH, rand() % (SCREEN_HEIGHT - GROUND_HEIGHT) + GROUND_HEIGHT));
            }
            dustInit = true;
        }

        glColor4f(1.0f, 0.9f, 0.5f, 0.15f * ambient);
        glPointSize(1.5f);
        glBegin(GL_POINTS);
        for (auto& particle : dustParticles) {
            float yOffset = sin(dayFrame * 0.005f + particle.first * 0.01f) * 5.0f;
            glVertex2f(particle.first, particle.second + yOffset);
        }
        glEnd();

        glDisable(GL_BLEND);
    }
}

// ============= IMPLEMENTATION OF NEW DRAWING FUNCTIONS =============

void drawMountain(float x, float y, float width, float height, float r, float g, float b, float snowLevel) {
    // Main mountain body (rounded/sloped, not just a triangle)
    glColor3f(r, g, b);
    glBegin(GL_TRIANGLE_FAN);
    glVertex2f(x + width/2, y + height);  // Peak

    int segments = 20;
    for(int i = 0; i <= segments; i++) {
        float t = (float)i / segments;  // 0 to 1 across base
        float xPos = x + t * width;
        // Parabolic curve for natural mountain shape
        float yOffset = (1 - pow(2*t - 1, 2)) * height * 0.3f;
        glVertex2f(xPos, y + yOffset);
    }
    glEnd();

    // Snow cap based on actual snowLevel (0 to 1)
    if(snowLevel > 0.05f) {
        glColor3f(0.95f, 0.95f, 0.98f);
        glBegin(GL_TRIANGLE_FAN);
        glVertex2f(x + width/2, y + height);

        float snowHeight = height * (0.2f + snowLevel * 0.5f);
        float snowWidth = width * (0.3f + snowLevel * 0.2f);

        for(int i = 0; i <= segments; i++) {
            float t = (float)i / segments;
            float xPos = x + width/2 - snowWidth/2 + t * snowWidth;
            // Parabolic snow line
            float yOffset = (1 - pow(2*t - 1, 2)) * snowHeight * 0.5f;
            glVertex2f(xPos, y + height - snowHeight + yOffset);
        }
        glEnd();
    }
}

void drawTree(float x, float y, float size, float ambient, int treeType) {
    float trunkWidth = size * 0.25f;
    float trunkHeight = size * 0.4f;
    float foliageSize = size * 0.8f;

    // Adjust colors based on ambient
    float greenR = 0.2f + ambient * 0.2f;
    float greenG = 0.55f + ambient * 0.2f;
    float greenB = 0.15f + ambient * 0.1f;

    // Trunk
    glColor3f(0.55f, 0.35f, 0.2f);
    glBegin(GL_POLYGON);
    glVertex2f(x - trunkWidth/2, y);
    glVertex2f(x + trunkWidth/2, y);
    glVertex2f(x + trunkWidth/3, y + trunkHeight);
    glVertex2f(x - trunkWidth/3, y + trunkHeight);
    glEnd();

    if (treeType == 0) {
        // Pine tree
        glColor3f(greenR, greenG, greenB);
        for (int i = 0; i < 4; i++) {
            float layerY = y + trunkHeight + i * foliageSize * 0.25f;
            float layerWidth = foliageSize * (1.0f - i * 0.2f);
            glBegin(GL_TRIANGLES);
            glVertex2f(x - layerWidth/2, layerY);
            glVertex2f(x + layerWidth/2, layerY);
            glVertex2f(x, layerY + foliageSize * 0.35f);
            glEnd();
        }
    } else {
        // Round tree (oak/apple style)
        glColor3f(greenR, greenG, greenB);
        for (int i = 0; i < 3; i++) {
            float layerY = y + trunkHeight + i * foliageSize * 0.2f;
            float layerWidth = foliageSize * (0.8f - i * 0.15f);
            glBegin(GL_TRIANGLE_FAN);
            glVertex2f(x, layerY);
            for (int angle = 0; angle <= 360; angle += 30) {
                float rad = angle * 3.14159f / 180.0f;
                glVertex2f(x + cos(rad) * layerWidth/2, layerY + sin(rad) * layerWidth/2);
            }
            glEnd();
        }
    }
}

void drawHouse(float x, float y, float size, float ambient, float timeOfDay) {
    float houseWidth = size;
    float houseHeight = size * 0.7f;
    float roofHeight = size * 0.5f;

    // House body
    float brightness = 0.7f + ambient * 0.3f;
    glColor3f(0.85f * brightness, 0.7f * brightness, 0.55f * brightness);
    glBegin(GL_POLYGON);
    glVertex2f(x - houseWidth/2, y);
    glVertex2f(x + houseWidth/2, y);
    glVertex2f(x + houseWidth/2, y + houseHeight);
    glVertex2f(x - houseWidth/2, y + houseHeight);
    glEnd();

    // Roof
    glColor3f(0.6f, 0.35f, 0.25f);
    glBegin(GL_TRIANGLES);
    glVertex2f(x - houseWidth/2 - 5, y + houseHeight);
    glVertex2f(x + houseWidth/2 + 5, y + houseHeight);
    glVertex2f(x, y + houseHeight + roofHeight);
    glEnd();

    // Door
    float doorWidth = size * 0.2f;
    float doorHeight = size * 0.35f;
    glColor3f(0.5f, 0.35f, 0.25f);
    glBegin(GL_POLYGON);
    glVertex2f(x - doorWidth/2, y);
    glVertex2f(x + doorWidth/2, y);
    glVertex2f(x + doorWidth/2, y + doorHeight);
    glVertex2f(x - doorWidth/2, y + doorHeight);
    glEnd();

    // Door knob
    glColor3f(0.9f, 0.8f, 0.2f);
    glPointSize(3);
    glBegin(GL_POINTS);
    glVertex2f(x + doorWidth/4, y + doorHeight/2);
    glEnd();

    // Windows
    float windowSize = size * 0.18f;
    float windowY = y + houseHeight * 0.6f;

    // Left window
    glColor3f(0.3f, 0.4f, 0.6f);
    glBegin(GL_POLYGON);
    glVertex2f(x - houseWidth/3 - windowSize/2, windowY);
    glVertex2f(x - houseWidth/3 + windowSize/2, windowY);
    glVertex2f(x - houseWidth/3 + windowSize/2, windowY + windowSize);
    glVertex2f(x - houseWidth/3 - windowSize/2, windowY + windowSize);
    glEnd();

    // Window glow at night
    if (timeOfDay > 0.7f || timeOfDay < 0.3f) {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        glColor4f(1.0f, 0.8f, 0.4f, 0.4f);
        glBegin(GL_POLYGON);
        glVertex2f(x - houseWidth/3 - windowSize/2 - 2, windowY - 2);
        glVertex2f(x - houseWidth/3 + windowSize/2 + 2, windowY - 2);
        glVertex2f(x - houseWidth/3 + windowSize/2 + 2, windowY + windowSize + 2);
        glVertex2f(x - houseWidth/3 - windowSize/2 - 2, windowY + windowSize + 2);
        glEnd();
        glDisable(GL_BLEND);
    }

    // Right window
    glColor3f(0.3f, 0.4f, 0.6f);
    glBegin(GL_POLYGON);
    glVertex2f(x + houseWidth/3 - windowSize/2, windowY);
    glVertex2f(x + houseWidth/3 + windowSize/2, windowY);
    glVertex2f(x + houseWidth/3 + windowSize/2, windowY + windowSize);
    glVertex2f(x + houseWidth/3 - windowSize/2, windowY + windowSize);
    glEnd();

    // Window cross bars
    glColor3f(0.5f, 0.4f, 0.3f);
    glLineWidth(1.5f);
    glBegin(GL_LINES);
    // Left window cross
    glVertex2f(x - houseWidth/3, windowY);
    glVertex2f(x - houseWidth/3, windowY + windowSize);
    glVertex2f(x - houseWidth/3 - windowSize/2, windowY + windowSize/2);
    glVertex2f(x - houseWidth/3 + windowSize/2, windowY + windowSize/2);
    // Right window cross
    glVertex2f(x + houseWidth/3, windowY);
    glVertex2f(x + houseWidth/3, windowY + windowSize);
    glVertex2f(x + houseWidth/3 - windowSize/2, windowY + windowSize/2);
    glVertex2f(x + houseWidth/3 + windowSize/2, windowY + windowSize/2);
    glEnd();

    // Chimney
    float chimneyX = x + houseWidth/3;
    float chimneyY = y + houseHeight + roofHeight * 0.4f;
    glColor3f(0.55f, 0.4f, 0.3f);
    glBegin(GL_POLYGON);
    glVertex2f(chimneyX, chimneyY);
    glVertex2f(chimneyX + size*0.12f, chimneyY);
    glVertex2f(chimneyX + size*0.12f, chimneyY + size*0.25f);
    glVertex2f(chimneyX, chimneyY + size*0.25f);
    glEnd();
}

void drawFence(float x, float y, float width, float ambient) {
    float postSpacing = 20.0f;
    int numPosts = (int)(width / postSpacing);
    float postHeight = 25.0f;

    glColor3f(0.55f, 0.4f, 0.25f);

    // Horizontal rails
    glLineWidth(3.0f);
    glBegin(GL_LINES);
    for (int i = 0; i <= numPosts; i++) {
        float postX = x + i * postSpacing;
        // Top rail
        glVertex2f(postX - postSpacing/2, y + postHeight * 0.7f);
        glVertex2f(postX + postSpacing/2, y + postHeight * 0.7f);
        // Bottom rail
        glVertex2f(postX - postSpacing/2, y + postHeight * 0.3f);
        glVertex2f(postX + postSpacing/2, y + postHeight * 0.3f);
    }
    glEnd();

    // Vertical posts
    for (int i = 0; i <= numPosts; i++) {
        float postX = x + i * postSpacing;
        glBegin(GL_POLYGON);
        glVertex2f(postX - 3, y);
        glVertex2f(postX + 3, y);
        glVertex2f(postX + 3, y + postHeight);
        glVertex2f(postX - 3, y + postHeight);
        glEnd();

        // Post cap
        glBegin(GL_TRIANGLES);
        glVertex2f(postX - 4, y + postHeight);
        glVertex2f(postX + 4, y + postHeight);
        glVertex2f(postX, y + postHeight + 5);
        glEnd();
    }
}

void drawPath(float startX, float startY, float endX, float endY, float width) {
    glColor3f(0.65f, 0.55f, 0.45f);
    glBegin(GL_POLYGON);
    glVertex2f(startX - width/2, startY);
    glVertex2f(startX + width/2, startY);
    glVertex2f(endX + width/3, endY);
    glVertex2f(endX - width/3, endY);
    glEnd();
}
void drawMagicalStars(float nightBlend, float ambient) {
    if (nightBlend < 0.15f) return;

    static vector<pair<float, float>> starPositions;
    static vector<float> starTwinkleSpeeds;
    static bool starsInit = false;

    if (!starsInit) {
        for (int i = 0; i < 120; i++) {
            starPositions.push_back(make_pair(rand() % SCREEN_WIDTH, rand() % (SCREEN_HEIGHT - GROUND_HEIGHT) + GROUND_HEIGHT));
            starTwinkleSpeeds.push_back(0.5f + (rand() % 100) / 100.0f);
        }
        starsInit = true;
    }

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    float intensity = min(1.0f, nightBlend * 1.3f);

    for (size_t i = 0; i < starPositions.size(); i++) {
        float twinkle = (sin(dayFrame * 0.015f * starTwinkleSpeeds[i] + i) + 1.0f) * 0.5f;
        float alpha = intensity * (0.4f + twinkle * 0.6f);
        float size = 1.5f + twinkle * 1.5f;

        glColor4f(1.0f, 0.95f + twinkle * 0.05f, 0.8f, alpha);

        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 45) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(starPositions[i].first + cos(rad) * size,
                      starPositions[i].second + sin(rad) * size);
        }
        glEnd();
    }

    static int shootingStarFrame = 0;
    static float shootingStarX, shootingStarY;

    if (nightBlend > 0.6f && rand() % 300 == 0 && shootingStarFrame == 0) {
        shootingStarFrame = 80;
        shootingStarX = rand() % SCREEN_WIDTH;
        shootingStarY = SCREEN_HEIGHT - 50 + rand() % 100;
    }

    if (shootingStarFrame > 0) {
        float progress = 1.0f - (float)shootingStarFrame / 80.0f;
        float currentX = shootingStarX + progress * 300;
        float currentY = shootingStarY - progress * 150;

        if (currentX < SCREEN_WIDTH + 50 && currentY > GROUND_HEIGHT - 50) {
            glColor4f(1.0f, 0.9f, 0.6f, 0.8f * (1.0f - progress));
            glLineWidth(2);
            glBegin(GL_LINES);
            glVertex2f(currentX, currentY);
            glVertex2f(currentX - 15, currentY + 8);
            glEnd();

            glBegin(GL_POINTS);
            for (int i = 0; i < 8; i++) {
                float trailProgress = progress - i * 0.03f;
                if (trailProgress > 0) {
                    float trailX = shootingStarX + trailProgress * 300;
                    float trailY = shootingStarY - trailProgress * 150;
                    glColor4f(1.0f, 0.8f, 0.4f, 0.5f * (1.0f - trailProgress));
                    glVertex2f(trailX, trailY);
                }
            }
            glEnd();
        }
        shootingStarFrame--;
    }

    glDisable(GL_BLEND);
}

void drawSuperCloud(float x, float y, float size, float r, float g, float b, float alpha, float timeOfDay) {
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    float pulse = 1.0f + sin(dayFrame * 0.002f + x * 0.01f) * 0.03f;
    size = size * pulse;

    glColor4f(r, g, b, alpha);

    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 15) {
        float rad = a * M_PI / 180.0f;
        float radiusX = size * (1.0f + sin(rad * 3) * 0.1f);
        float radiusY = size * 0.65f * (1.0f + cos(rad * 2) * 0.1f);
        glVertex2f(x + cos(rad) * radiusX, y + sin(rad) * radiusY);
    }
    glEnd();

    float offsets[4][2] = {{-size*0.65f, -size*0.2f}, {size*0.7f, -size*0.15f},
                           {-size*0.3f, size*0.25f}, {size*0.35f, size*0.3f}};
    float scales[4] = {0.75f, 0.8f, 0.7f, 0.72f};

    for (int i = 0; i < 4; i++) {
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 20) {
            float rad = a * M_PI / 180.0f;
            float partSize = size * scales[i];
            glVertex2f(x + offsets[i][0] + cos(rad) * partSize,
                      y + offsets[i][1] + sin(rad) * partSize * 0.7f);
        }
        glEnd();
    }

    glDisable(GL_BLEND);
}

void drawElegantGrassBlade(float x, float y, float height, float ambient, float waveOffset) {
    glBegin(GL_TRIANGLES);
    glColor3f(0.25f * ambient, 0.65f * ambient, 0.2f * ambient);
    glVertex2f(x - 1.5f + waveOffset * 0.3f, y);
    glVertex2f(x + 1.5f + waveOffset * 0.3f, y);
    glColor3f(0.3f * ambient, 0.75f * ambient, 0.25f * ambient);
    glVertex2f(x + waveOffset, y + height);
    glEnd();

    glPointSize(1.5f);
    glColor3f(0.35f * ambient, 0.8f * ambient, 0.3f * ambient);
    glBegin(GL_POINTS);
    glVertex2f(x + waveOffset, y + height);
    glEnd();
}

void drawPremiumFlower(float x, float y, float size, float ambient, int type, bool hasFace, float timeOfDay) {
    glLineWidth(3);
    glBegin(GL_LINES);
    glColor3f(0.2f * ambient, 0.65f * ambient, 0.18f * ambient);
    glVertex2f(x, y);
    glColor3f(0.25f * ambient, 0.75f * ambient, 0.22f * ambient);
    glVertex2f(x, y + size * 0.85f);
    glEnd();

    int petalCount = 6 + (type % 3) * 2;
    float petalSize = size * 0.38f;

    float petalR, petalG, petalB;
    switch(type % 7) {
        case 0: petalR = 1.0f; petalG = 0.45f; petalB = 0.75f; break;
        case 1: petalR = 1.0f; petalG = 0.85f; petalB = 0.25f; break;
        case 2: petalR = 0.85f; petalG = 0.35f; petalB = 0.85f; break;
        case 3: petalR = 1.0f; petalG = 0.55f; petalB = 0.2f; break;
        case 4: petalR = 0.4f; petalG = 0.7f; petalB = 1.0f; break;
        case 5: petalR = 0.95f; petalG = 0.3f; petalB = 0.3f; break;
        default: petalR = 1.0f; petalG = 0.7f; petalB = 0.9f; break;
    }

    for (int p = 0; p < petalCount; p++) {
        float angle = p * (360.0f / petalCount) * M_PI / 180.0f;
        float px = x + cos(angle) * size * 0.55f;
        float py = y + size * 0.85f + sin(angle) * size * 0.45f;

        glBegin(GL_TRIANGLE_FAN);
        glColor3f(petalR * ambient, petalG * ambient, petalB * ambient);
        for (int a = 0; a <= 360; a += 30) {
            float rad = a * M_PI / 180.0f;
            float radius = petalSize * (1.0f + sin(rad * 2) * 0.15f);
            glVertex2f(px + cos(rad) * radius, py + sin(rad) * radius * 0.9f);
        }
        glEnd();
    }

    glBegin(GL_TRIANGLE_FAN);
    glColor3f(0.85f * ambient, 0.55f * ambient, 0.2f * ambient);
    for (int a = 0; a <= 360; a += 20) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x + cos(rad) * size * 0.28f, y + size * 0.85f + sin(rad) * size * 0.28f);
    }
    glEnd();

    glBegin(GL_TRIANGLE_FAN);
    glColor3f(0.7f * ambient, 0.4f * ambient, 0.15f * ambient);
    for (int a = 0; a <= 360; a += 30) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x + cos(rad) * size * 0.18f, y + size * 0.85f + sin(rad) * size * 0.18f);
    }
    glEnd();

    if (hasFace && ambient > 0.5f) {
        float blink = (int)(dayFrame * 0.1f) % 60 < 55 ? 1.0f : 0.0f;

        glColor3f(0.15f, 0.1f, 0.05f);
        glPointSize(4);
        glBegin(GL_POINTS);
        if (blink > 0) {
            glVertex2f(x - size * 0.13f, y + size * 0.92f);
            glVertex2f(x + size * 0.13f, y + size * 0.92f);
        } else {
            glLineWidth(2);
            glBegin(GL_LINES);
            glVertex2f(x - size * 0.18f, y + size * 0.92f);
            glVertex2f(x - size * 0.08f, y + size * 0.92f);
            glVertex2f(x + size * 0.08f, y + size * 0.92f);
            glVertex2f(x + size * 0.18f, y + size * 0.92f);
            glEnd();
        }
        glEnd();

        float smileCurve = sin(dayFrame * 0.01f) * 0.03f;
        glBegin(GL_LINE_STRIP);
        for (float a = 0.25f; a <= 0.75f; a += 0.05f) {
            float offset = sin(a * M_PI) * size * 0.13f;
            glVertex2f(x + (a - 0.5f) * size * 0.35f, y + size * 0.78f - offset + smileCurve);
        }
        glEnd();

        glColor4f(1.0f, 0.6f, 0.6f, 0.3f);
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 45) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x - size * 0.22f + cos(rad) * size * 0.08f, y + size * 0.86f + sin(rad) * size * 0.06f);
        }
        glEnd();
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 45) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x + size * 0.22f + cos(rad) * size * 0.08f, y + size * 0.86f + sin(rad) * size * 0.06f);
        }
        glEnd();
    }
}

void drawAnimatedLadybug(float x, float y, float ambient, float timeOfDay, float id) {
    glColor3f(0.92f * ambient, 0.25f * ambient, 0.22f * ambient);
    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 20) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x + cos(rad) * 6.5f, y + sin(rad) * 5.5f);
    }
    glEnd();

    glColor4f(1.0f, 0.9f, 0.8f, 0.4f);
    glBegin(GL_TRIANGLE_FAN);
    for (int a = -30; a <= 30; a += 15) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x - 1 + cos(rad) * 2, y + 1.5f + sin(rad) * 1.5f);
    }
    glEnd();

    float spotWobble = sin(dayFrame * 0.01f + id) * 0.5f;

    glColor3f(0.12f * ambient, 0.1f * ambient, 0.1f * ambient);
    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 45) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x - 2.2f + spotWobble * 0.3f + cos(rad) * 1.6f, y + 1.2f + sin(rad) * 1.3f);
    }
    glEnd();

    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 45) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x + 2.3f - spotWobble * 0.2f + cos(rad) * 1.6f, y - 0.8f + sin(rad) * 1.3f);
    }
    glEnd();

    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 45) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x + 0.5f + cos(rad) * 1.2f, y - 1.8f + sin(rad) * 1.0f);
    }
    glEnd();

    glColor3f(0.12f * ambient, 0.1f * ambient, 0.1f * ambient);
    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 45) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x + 5.5f + cos(rad) * 3.2f, y + sin(rad) * 2.8f);
    }
    glEnd();

    float antennaWave = sin(dayFrame * 0.02f + id) * 2.0f;
    glLineWidth(1.5f);
    glColor3f(0.08f, 0.06f, 0.05f);
    glBegin(GL_LINES);
    glVertex2f(x + 4.8f, y + 1.2f);
    glVertex2f(x + 6.5f + antennaWave * 0.3f, y + 3.5f);
    glVertex2f(x + 6.2f, y + 0.8f);
    glVertex2f(x + 8.0f - antennaWave * 0.2f, y + 3.0f);
    glEnd();

    glColor3f(1.0f, 1.0f, 1.0f);
    glBegin(GL_POINTS);
    glVertex2f(x + 6.8f, y + 0.8f);
    glVertex2f(x + 4.2f, y + 0.9f);
    glEnd();

    glColor3f(0.1f, 0.1f, 0.1f);
    glPointSize(2);
    glBegin(GL_POINTS);
    glVertex2f(x + 6.5f, y + 1.1f);
    glVertex2f(x + 3.9f, y + 1.2f);
    glEnd();
}

void drawGracefulButterfly(float x, float y, float ambient, float timeOfDay, float id) {
    float wingBeat = sin(dayFrame * 0.025f + id) * 0.7f;
    float flutter = sin(dayFrame * 0.01f + id) * 2.0f;

    float wingR = 0.85f * ambient;
    float wingG = 0.55f * ambient + sin(dayFrame * 0.01f) * 0.1f;
    float wingB = 0.9f * ambient;

    glColor3f(wingR, wingG, wingB);
    glBegin(GL_TRIANGLE_FAN);
    for (int a = -90; a <= 90; a += 10) {
        float rad = a * M_PI / 180.0f;
        float wingX = x - 9 + cos(rad) * 9;
        float wingY = y + sin(rad) * 7 + wingBeat * 4 + flutter;
        if (a == -90) glVertex2f(x, y);
        glVertex2f(wingX, wingY);
    }
    glEnd();

    glBegin(GL_TRIANGLE_FAN);
    for (int a = 90; a <= 270; a += 10) {
        float rad = a * M_PI / 180.0f;
        float wingX = x + 9 + cos(rad) * 9;
        float wingY = y + sin(rad) * 7 + wingBeat * 4 + flutter;
        if (a == 90) glVertex2f(x, y);
        glVertex2f(wingX, wingY);
    }
    glEnd();

    glColor3f(0.6f * ambient, 0.3f * ambient, 0.7f * ambient);
    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 60) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x - 5 + cos(rad) * 2.5f, y + 1 + sin(rad) * 2.0f);
    }
    glEnd();

    glBegin(GL_TRIANGLE_FAN);
    for (int a = 0; a <= 360; a += 60) {
        float rad = a * M_PI / 180.0f;
        glVertex2f(x + 5 + cos(rad) * 2.5f, y + 1 + sin(rad) * 2.0f);
    }
    glEnd();

    glBegin(GL_QUADS);
    glColor3f(0.45f * ambient, 0.35f * ambient, 0.25f * ambient);
    glVertex2f(x - 2, y - 2.5f);
    glVertex2f(x + 2, y - 2.5f);
    glColor3f(0.55f * ambient, 0.45f * ambient, 0.35f * ambient);
    glVertex2f(x + 2, y + 4.5f);
    glVertex2f(x - 2, y + 4.5f);
    glEnd();

    glLineWidth(1.2f);
    glColor3f(0.25f, 0.2f, 0.15f);
    glBegin(GL_LINES);
    glVertex2f(x - 1, y + 4.2f);
    glVertex2f(x - 3.5f + sin(dayFrame * 0.02f) * 0.5f, y + 7.5f);
    glVertex2f(x + 1, y + 4.2f);
    glVertex2f(x + 3.5f - sin(dayFrame * 0.02f) * 0.5f, y + 7.5f);
    glEnd();

    glColor3f(1.0f, 1.0f, 1.0f);
    glPointSize(2.5f);
    glBegin(GL_POINTS);
    glVertex2f(x - 1, y + 3.2f);
    glVertex2f(x + 1, y + 3.2f);
    glEnd();

    glColor3f(0.1f, 0.1f, 0.1f);
    glPointSize(1.5f);
    glBegin(GL_POINTS);
    glVertex2f(x - 0.8f, y + 3.5f);
    glVertex2f(x + 1.2f, y + 3.5f);
    glEnd();
}

void drawFloatingParticles(float ambient, float timeOfDay) {
    static vector<pair<float, float>> particles;
    static bool particlesInit = false;

    if (!particlesInit) {
        for (int i = 0; i < 40; i++) {
            particles.push_back(make_pair(rand() % SCREEN_WIDTH, rand() % SCREEN_HEIGHT));
        }
        particlesInit = true;
    }

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    float particleAlpha = 0.08f * ambient;
    glColor4f(1.0f, 0.95f, 0.85f, particleAlpha);
    glPointSize(1.2f);

    glBegin(GL_POINTS);
    for (auto& particle : particles) {
        float drift = sin(dayFrame * 0.002f + particle.first * 0.005f) * 8.0f;
        glVertex2f(particle.first + drift, particle.second);
    }
    glEnd();

    glDisable(GL_BLEND);
}

void drawCartoonCelestialBody(float sunAngle, bool isNight, float ambient) {
    float x = SCREEN_WIDTH * 0.85f;
    float y = SCREEN_HEIGHT * 0.85f;
    float size = 48;

    if (isNight) {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        for (int i = 3; i > 0; i--) {
            float glowSize = size + i * 8;
            float glowAlpha = 0.1f * (4 - i) * ambient;
            glColor4f(0.85f, 0.85f, 0.75f, glowAlpha);
            glBegin(GL_TRIANGLE_FAN);
            for (int a = 0; a <= 360; a += 15) {
                float rad = a * M_PI / 180.0f;
                glVertex2f(x + cos(rad) * glowSize, y + sin(rad) * glowSize);
            }
            glEnd();
        }

        glColor3f(0.98f, 0.96f, 0.88f);
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 10) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x + cos(rad) * size, y + sin(rad) * size);
        }
        glEnd();

        glColor3f(0.75f, 0.72f, 0.68f);
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 45) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x - 12 + cos(rad) * 6, y + 5 + sin(rad) * 5);
        }
        glEnd();

        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 45) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x + 8 + cos(rad) * 5, y - 8 + sin(rad) * 4);
        }
        glEnd();

        glColor3f(0.35f, 0.32f, 0.28f);
        glLineWidth(3);
        glBegin(GL_LINES);
        glVertex2f(x - 12, y + 8);
        glVertex2f(x - 6, y + 8);
        glVertex2f(x + 6, y + 8);
        glVertex2f(x + 12, y + 8);
        glEnd();

        glBegin(GL_LINE_STRIP);
        for (float a = 0.35f; a <= 0.65f; a += 0.05f) {
            float offset = sin(a * M_PI) * 6;
            glVertex2f(x + (a - 0.5f) * 28, y - 5 - offset * 0.5f);
        }
        glEnd();

        glColor4f(0.9f, 0.9f, 0.8f, 0.6f);
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 60) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x + 20 + cos(rad) * 4, y + 12 + sin(rad) * 4);
        }
        glEnd();

        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 60) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x + 28 + cos(rad) * 3.5f, y + 18 + sin(rad) * 3.5f);
        }
        glEnd();

        glDisable(GL_BLEND);
    } else {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        for (int i = 4; i > 0; i--) {
            float glowSize = size + i * 10;
            float glowAlpha = 0.12f * (5 - i) * ambient;
            glColor4f(1.0f, 0.85f, 0.4f, glowAlpha);
            glBegin(GL_TRIANGLE_FAN);
            for (int a = 0; a <= 360; a += 10) {
                float rad = a * M_PI / 180.0f;
                glVertex2f(x + cos(rad) * glowSize, y + sin(rad) * glowSize);
            }
            glEnd();
        }

        glColor3f(1.0f, 0.92f, 0.55f);
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 10) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x + cos(rad) * size, y + sin(rad) * size);
        }
        glEnd();

        float rayPulse = sin(dayFrame * 0.01f) * 0.15f + 0.85f;
        glColor3f(1.0f, 0.85f, 0.4f);
        glLineWidth(4);

        glBegin(GL_LINES);
        for (int i = 0; i < 16; i++) {
            float angle = i * 22.5f * M_PI / 180.0f;
            float rayLength = size * (1.3f + sin(dayFrame * 0.02f + i) * 0.1f);
            glVertex2f(x + cos(angle) * size, y + sin(angle) * size);
            glVertex2f(x + cos(angle) * rayLength, y + sin(angle) * rayLength);
        }
        glEnd();

        glColor3f(0.45f, 0.32f, 0.18f);

        float blink = (int)(dayFrame * 0.08f) % 80 < 72 ? 1.0f : 0.0f;

        if (blink > 0) {
            glPointSize(6);
            glBegin(GL_POINTS);
            glVertex2f(x - 14, y + 8);
            glVertex2f(x + 14, y + 8);
            glEnd();
        } else {
            glLineWidth(4);
            glBegin(GL_LINES);
            glVertex2f(x - 18, y + 8);
            glVertex2f(x - 10, y + 8);
            glVertex2f(x + 10, y + 8);
            glVertex2f(x + 18, y + 8);
            glEnd();
        }

        float smileAmount = 12 + sin(dayFrame * 0.02f) * 2;
        glBegin(GL_LINE_STRIP);
        for (float a = 0.25f; a <= 0.75f; a += 0.05f) {
            float offset = sin(a * M_PI) * smileAmount;
            glVertex2f(x + (a - 0.5f) * 32, y - 4 - offset);
        }
        glEnd();

        float cheekPulse = sin(dayFrame * 0.015f) * 0.05f + 0.3f;
        glColor4f(1.0f, 0.55f, 0.55f, cheekPulse);
        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 45) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x - 22 + cos(rad) * 9, y - 2 + sin(rad) * 7);
        }
        glEnd();

        glBegin(GL_TRIANGLE_FAN);
        for (int a = 0; a <= 360; a += 45) {
            float rad = a * M_PI / 180.0f;
            glVertex2f(x + 22 + cos(rad) * 9, y - 2 + sin(rad) * 7);
        }
        glEnd();

        glDisable(GL_BLEND);
    }
}

void drawText(float x, float y, string text, float r, float g, float b, int size) {
    // Create pixelated/stylized retro effect by drawing text multiple times
    void* font = GLUT_BITMAP_HELVETICA_18;
    if (size <= 12) font = GLUT_BITMAP_HELVETICA_12;
    else if (size <= 18) font = GLUT_BITMAP_HELVETICA_18;
    else font = GLUT_BITMAP_TIMES_ROMAN_24;

    // Retro pixel shadow (offset in both directions for blocky look)
    glColor3f(0.05f, 0.05f, 0.15f); // Dark blue-black shadow
    glRasterPos2f(x + 2.5f, y - 2.5f);
    for (char c : text) glutBitmapCharacter(font, c);

    // Secondary shadow for depth
    glColor3f(0.1f, 0.1f, 0.2f);
    glRasterPos2f(x + 1.5f, y - 1.5f);
    for (char c : text) glutBitmapCharacter(font, c);

    // Draw outline for pixelated blocky effect
    glColor3f(0, 0, 0);
    for(int dx = -1; dx <= 1; dx++) {
        for(int dy = -1; dy <= 1; dy++) {
            if(dx == 0 && dy == 0) continue;
            glRasterPos2f(x + dx, y + dy);
            for (char c : text) glutBitmapCharacter(font, c);
        }
    }

    // Draw main text with arcade-style brightness
    glColor3f(r, g, b);
    glRasterPos2f(x, y);
    for (char c : text) glutBitmapCharacter(font, c);

    // Add pixelated highlight effect (slight offset for retro feel)
    glColor4f(r * 1.3f, g * 1.3f, b * 1.3f, 0.5f);
    glRasterPos2f(x - 0.5f, y + 0.5f);
    for (char c : text) glutBitmapCharacter(font, c);
}


void drawHeart(float cx, float cy, float size, bool filled) {
    if (filled) {
        glColor3f(1.0f, 0.15f, 0.20f);
    } else {
        glColor3f(0.28f, 0.28f, 0.28f);
    }

    glBegin(GL_POLYGON);
    for (int i = 0; i <= 360; i++) {
        float t  = i * (float)M_PI / 180.0f;
        float px = size * 16.0f * (float)pow(sin(t), 3);
        float py = size * (13.0f*cos(t) - 5.0f*cos(2*t)
                         - 2.0f*cos(3*t) - cos(4*t));
        glVertex2f(cx + px, cy + py);
    }
    glEnd();

    if (filled) {
        glColor3f(0.75f, 0.05f, 0.10f);
    } else {
        glColor3f(0.50f, 0.50f, 0.50f);
    }
    glLineWidth(1.5f);
    glBegin(GL_LINE_LOOP);
    for (int i = 0; i <= 360; i++) {
        float t  = i * (float)M_PI / 180.0f;
        float px = size * 16.0f * (float)pow(sin(t), 3);
        float py = size * (13.0f*cos(t) - 5.0f*cos(2*t)
                         - 2.0f*cos(3*t) - cos(4*t));
        glVertex2f(cx + px, cy + py);
    }
    glEnd();
    glLineWidth(1.0f);

    if (filled) {
        glColor4f(1.0f, 0.7f, 0.7f, 0.55f);
        glBegin(GL_POLYGON);
        for (int i = 0; i <= 360; i++) {
            float t  = i * (float)M_PI / 180.0f;
            float px = size * 7.0f * (float)pow(sin(t), 3);
            float py = size * (6.0f*cos(t) - 2.5f*cos(2*t)
                             - 1.0f*cos(3*t) - 0.5f*cos(4*t));
            glVertex2f(cx - size*3.5f + px, cy + size*3.0f + py);
        }
        glEnd();
    }
}

void drawHearts(int currentLives) {
    const int   MAX_LIVES = 3;
    const float SIZE      = 0.72f;
    const float SPACING   = 42.0f;

    float startX = SCREEN_WIDTH / 2.0f - (MAX_LIVES - 1) * SPACING / 2.0f;
    float y      = SCREEN_HEIGHT - 36.0f;

    for (int i = 0; i < MAX_LIVES; i++) {
        drawHeart(startX + i * SPACING, y, SIZE, i < currentLives);
    }
}

void drawBird(float x, float y, float angle, float ambient) {
    glPushMatrix();
    glTranslatef(x, y, 0);
    glRotatef(angle, 0, 0, 1);

    for (int i = 0; i < 3; i++) {
        float t = 0.5f - 0.1f*i;
        glColor3f(t, 0.7f, 1.0f - 0.05f*i);
        glBegin(GL_TRIANGLE_FAN);
            glVertex2f(0, 0);
            for (int j = 0; j <= 360; j++) {
                float theta = j * M_PI / 180.0f;
                glVertex2f((18 - i*2) * cos(theta), (14 - i*2) * sin(theta));
            }
        glEnd();
    }

    glColor3f(0.2f, 0.6f, 1.0f);
    glBegin(GL_TRIANGLE_FAN);
        glVertex2f(4, 0);
        for (int i = 0; i <= 360; i++) {
            float theta = i * M_PI / 180.0f;
            glVertex2f(4 + 6*cos(theta), 0 + 5*sin(theta));
        }
    glEnd();

    float wingY[5] = {0, 2, 4, -2, -4};
    for (int i = 0; i < 5; i++) {
        glColor3f(0.3f - 0.05f*i, 0.6f - 0.05f*i, 0.9f - 0.05f*i);
        glBegin(GL_POLYGON);
            glVertex2f(-5, wingY[i]);
            glVertex2f(-18, 8 + wingY[i]/2);
            glVertex2f(-20, 6 + wingY[i]/2);
            glVertex2f(-18, wingY[i]/2);
            glVertex2f(-5, wingY[i] - 1);
        glEnd();
    }

    glColor3f(0.1f, 0.1f, 0.1f);
    glBegin(GL_TRIANGLES);
        glVertex2f(-18, 0);
        glVertex2f(-23, 5);
        glVertex2f(-23, -5);
    glEnd();

    glColor3f(1, 1, 1);
    glBegin(GL_TRIANGLE_FAN);
        glVertex2f(8, 6);
        for (int i=0;i<=360;i++) {
            float theta=i*M_PI/180;
            glVertex2f(8+4*cos(theta), 6+4*sin(theta));
        }
    glEnd();

    glColor3f(0,0,0);
    glBegin(GL_TRIANGLE_FAN);
        glVertex2f(8,6);
        for (int i=0;i<=360;i++) {
            float theta=i*M_PI/180;
            glVertex2f(8+2*cos(theta),6+2*sin(theta));
        }
    glEnd();

    glColor3f(1,0.6f,0);
    glBegin(GL_POLYGON);
        glVertex2f(18,4);
        glVertex2f(28,6);
        glVertex2f(28,3);
        glVertex2f(23,2);
        glVertex2f(18,2);
    glEnd();

    glColor3f(1,0.4f,0);
    glBegin(GL_POLYGON);
        glVertex2f(18,2);
        glVertex2f(23,2);
        glVertex2f(28,1.5f);
        glVertex2f(18,1);
    glEnd();

    glColor3f(0.5f,0.35f,0.2f);
    glBegin(GL_TRIANGLE_FAN);
        glVertex2f(9,18);
        glVertex2f(5,12);
        glVertex2f(13,12);
    glEnd();

    glColor3f(0.35f,0.2f,0.1f);
    glLineWidth(2.0f);
    glBegin(GL_LINE_LOOP);
        glVertex2f(5,12);
        glVertex2f(13,12);
        glVertex2f(12,17);
        glVertex2f(6,17);
    glEnd();

    glLineWidth(3.0f);
    glColor3f(0,0,0);
    glBegin(GL_LINES);
        glVertex2f(4,12); glVertex2f(10,9);
        glVertex2f(10,12); glVertex2f(16,9);
    glEnd();

    glPopMatrix();
}

void drawGradientQuad(float x1, float y1, float x2, float y2,
                      float r1, float g1, float b1,
                      float r2, float g2, float b2) {
    glBegin(GL_QUADS);
    glColor3f(r1, g1, b1);
    glVertex2f(x1, y1);
    glVertex2f(x2, y1);
    glColor3f(r2, g2, b2);
    glVertex2f(x2, y2);
    glVertex2f(x1, y2);
    glEnd();
}
// Add these enums and structs at the top of your file
enum PipeStyle {
    PIPE_STYLE_CLASSIC,
    PIPE_STYLE_METAL,
    PIPE_STYLE_RUSTY,
    PIPE_STYLE_ICE
};

struct PipeAnimation {
    float squashStretch;
    float wobbleOffset;
    float damageParticles;
};

// Helper function for beveled edges
void drawBeveledEdge(float x, float y, float width, float height,
                     float brightness, bool topEdge) {
    glBegin(GL_QUADS);
    if(topEdge) {
        glColor3f(brightness * 1.3f, brightness * 1.3f, brightness * 1.3f);
        glVertex2f(x, y);
        glVertex2f(x + width, y);
        glColor3f(brightness * 0.8f, brightness * 0.8f, brightness * 0.8f);
        glVertex2f(x + width, y + 3);
        glVertex2f(x, y + 3);
    } else {
        glColor3f(brightness * 0.7f, brightness * 0.7f, brightness * 0.7f);
        glVertex2f(x, y - 3);
        glVertex2f(x + width, y - 3);
        glColor3f(brightness * 1.1f, brightness * 1.1f, brightness * 1.1f);
        glVertex2f(x + width, y);
        glVertex2f(x, y);
    }
    glEnd();
}

// Enhanced rivet with 3D effect (replace your existing drawRivet function)
void drawRivet(float x, float y) {
    glBegin(GL_TRIANGLE_FAN);
    // Shadow
    glColor4f(0, 0, 0, 0.3f);
    for(int i = 0; i <= 360; i += 30) {
        float rad = i * 3.14159f / 180.0f;
        glVertex2f(x + 2 + cos(rad) * 3, y - 1 + sin(rad) * 3);
    }

    // Rivet body
    glColor3f(0.6f, 0.65f, 0.7f);
    for(int i = 0; i <= 360; i += 30) {
        float rad = i * 3.14159f / 180.0f;
        glVertex2f(x + cos(rad) * 2.5f, y + sin(rad) * 2.5f);
    }

    // Highlight
    glColor3f(0.9f, 0.95f, 1.0f);
    glVertex2f(x - 1, y - 1);
    glVertex2f(x, y - 1.5f);
    glVertex2f(x + 1, y - 1);
    glEnd();
}

// The enhanced drawPipe function (replace your existing one completely)
void drawPipe(float x, float gapY, float ambient, bool flipped) {
    float a = max(ambient, 0.38f);

    float bt = gapY - PIPE_GAP / 2;
    float tp = gapY + PIPE_GAP / 2;

    float cL  = 0.42f * a;
    float cM  = 0.16f * a;
    float cR  = 0.08f * a;
    float cLg = 0.48f * a;
    float cMg = 0.20f * a;
    float cRg = 0.10f * a;

    if (!flipped) {
        float btHeight = bt;

        glColor3f(cL, cLg, cL*0.9f);
        glBegin(GL_QUADS);
        glVertex2f(x, 0); glVertex2f(x+8, 0);
        glVertex2f(x+8, btHeight); glVertex2f(x, btHeight);
        glEnd();

        drawGradientQuad(x+8, 0, x+PIPE_WIDTH*0.55f, btHeight,
                         cM*1.1f, cMg*1.1f, cM,
                         cL*0.7f, cLg*0.7f, cL*0.6f);
        drawGradientQuad(x+PIPE_WIDTH*0.55f, 0, x+PIPE_WIDTH-6, btHeight,
                         cM, cMg, cM*0.85f,
                         cR*1.4f, cRg*1.4f, cR);

        glColor3f(cR, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(x+PIPE_WIDTH-6, 0); glVertex2f(x+PIPE_WIDTH, 0);
        glVertex2f(x+PIPE_WIDTH, btHeight); glVertex2f(x+PIPE_WIDTH-6, btHeight);
        glEnd();

        // Add beveled edge
        drawBeveledEdge(x+8, 0, PIPE_WIDTH-8, 3, cL, true);

        float capH = 26.0f;
        float cx1  = x - 6, cx2 = x + PIPE_WIDTH + 6;

        glColor3f(cL*1.2f, cLg*1.2f, cL);
        glBegin(GL_QUADS);
        glVertex2f(cx1, btHeight); glVertex2f(cx1+10, btHeight);
        glVertex2f(cx1+10, btHeight+capH); glVertex2f(cx1, btHeight+capH);
        glEnd();

        drawGradientQuad(cx1+10, btHeight, cx2-6, btHeight+capH,
                         cM*1.2f, cMg*1.2f, cM,
                         cL*0.6f, cLg*0.6f, cL*0.5f);

        glColor3f(cR*0.9f, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(cx2-6, btHeight); glVertex2f(cx2, btHeight);
        glVertex2f(cx2, btHeight+capH); glVertex2f(cx2-6, btHeight+capH);
        glEnd();

        drawRivet(cx1 + 8, btHeight + capH/2);
        drawRivet(cx2 - 8, btHeight + capH/2);
        drawRivet(x + PIPE_WIDTH/2, btHeight + capH/2);

        // Top pipe segment
        float tpHeight = SCREEN_HEIGHT;

        glColor3f(cL, cLg, cL*0.9f);
        glBegin(GL_QUADS);
        glVertex2f(x, tp); glVertex2f(x+8, tp);
        glVertex2f(x+8, tpHeight); glVertex2f(x, tpHeight);
        glEnd();

        drawGradientQuad(x+8, tp, x+PIPE_WIDTH*0.55f, tpHeight,
                         cM*1.1f, cMg*1.1f, cM,
                         cL*0.7f, cLg*0.7f, cL*0.6f);
        drawGradientQuad(x+PIPE_WIDTH*0.55f, tp, x+PIPE_WIDTH-6, tpHeight,
                         cM, cMg, cM*0.85f,
                         cR*1.4f, cRg*1.4f, cR);

        glColor3f(cR, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(x+PIPE_WIDTH-6, tp); glVertex2f(x+PIPE_WIDTH, tp);
        glVertex2f(x+PIPE_WIDTH, tpHeight); glVertex2f(x+PIPE_WIDTH-6, tpHeight);
        glEnd();

        drawBeveledEdge(x+8, tp, PIPE_WIDTH-8, 3, cL, false);

        glColor3f(cL*1.2f, cLg*1.2f, cL);
        glBegin(GL_QUADS);
        glVertex2f(cx1, tp-capH); glVertex2f(cx1+10, tp-capH);
        glVertex2f(cx1+10, tp); glVertex2f(cx1, tp);
        glEnd();

        drawGradientQuad(cx1+10, tp-capH, cx2-6, tp,
                         cL*0.6f, cLg*0.6f, cL*0.5f,
                         cM*1.2f, cMg*1.2f, cM);

        glColor3f(cR*0.9f, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(cx2-6, tp-capH); glVertex2f(cx2, tp-capH);
        glVertex2f(cx2, tp); glVertex2f(cx2-6, tp);
        glEnd();

        drawRivet(cx1 + 8, tp - capH/2);
        drawRivet(cx2 - 8, tp - capH/2);
        drawRivet(x + PIPE_WIDTH/2, tp - capH/2);

    } else {
        // Flipped version
        float btHeight = bt;
        float tpHeight = SCREEN_HEIGHT;

        glColor3f(cL, cLg, cL*0.9f);
        glBegin(GL_QUADS);
        glVertex2f(x, tpHeight); glVertex2f(x+8, tpHeight);
        glVertex2f(x+8, tp); glVertex2f(x, tp);
        glEnd();

        drawGradientQuad(x+8, tpHeight, x+PIPE_WIDTH*0.55f, tp,
                         cM*1.1f, cMg*1.1f, cM,
                         cL*0.7f, cLg*0.7f, cL*0.6f);
        drawGradientQuad(x+PIPE_WIDTH*0.55f, tpHeight, x+PIPE_WIDTH-6, tp,
                         cM, cMg, cM*0.85f,
                         cR*1.4f, cRg*1.4f, cR);

        glColor3f(cR, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(x+PIPE_WIDTH-6, tpHeight); glVertex2f(x+PIPE_WIDTH, tpHeight);
        glVertex2f(x+PIPE_WIDTH, tp); glVertex2f(x+PIPE_WIDTH-6, tp);
        glEnd();

        drawBeveledEdge(x+8, tp, PIPE_WIDTH-8, 3, cL, false);

        float capH = 26.0f;
        float cx1  = x - 6, cx2 = x + PIPE_WIDTH + 6;

        glColor3f(cL*1.2f, cLg*1.2f, cL);
        glBegin(GL_QUADS);
        glVertex2f(cx1, tp); glVertex2f(cx1+10, tp);
        glVertex2f(cx1+10, tp-capH); glVertex2f(cx1, tp-capH);
        glEnd();

        drawGradientQuad(cx1+10, tp, cx2-6, tp-capH,
                         cM*1.2f, cMg*1.2f, cM,
                         cL*0.6f, cLg*0.6f, cL*0.5f);

        glColor3f(cR*0.9f, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(cx2-6, tp); glVertex2f(cx2, tp);
        glVertex2f(cx2, tp-capH); glVertex2f(cx2-6, tp-capH);
        glEnd();

        drawRivet(cx1 + 8, tp - capH/2);
        drawRivet(cx2 - 8, tp - capH/2);
        drawRivet(x + PIPE_WIDTH/2, tp - capH/2);

        glColor3f(cL, cLg, cL*0.9f);
        glBegin(GL_QUADS);
        glVertex2f(x, btHeight); glVertex2f(x+8, btHeight);
        glVertex2f(x+8, 0); glVertex2f(x, 0);
        glEnd();

        drawGradientQuad(x+8, btHeight, x+PIPE_WIDTH*0.55f, 0,
                         cM*1.1f, cMg*1.1f, cM,
                         cL*0.7f, cLg*0.7f, cL*0.6f);
        drawGradientQuad(x+PIPE_WIDTH*0.55f, btHeight, x+PIPE_WIDTH-6, 0,
                         cM, cMg, cM*0.85f,
                         cR*1.4f, cRg*1.4f, cR);

        glColor3f(cR, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(x+PIPE_WIDTH-6, btHeight); glVertex2f(x+PIPE_WIDTH, btHeight);
        glVertex2f(x+PIPE_WIDTH, 0); glVertex2f(x+PIPE_WIDTH-6, 0);
        glEnd();

        drawBeveledEdge(x+8, 0, PIPE_WIDTH-8, 3, cL, true);

        glColor3f(cL*1.2f, cLg*1.2f, cL);
        glBegin(GL_QUADS);
        glVertex2f(cx1, btHeight-capH); glVertex2f(cx1+10, btHeight-capH);
        glVertex2f(cx1+10, btHeight); glVertex2f(cx1, btHeight);
        glEnd();

        drawGradientQuad(cx1+10, btHeight-capH, cx2-6, btHeight,
                         cL*0.6f, cLg*0.6f, cL*0.5f,
                         cM*1.2f, cMg*1.2f, cM);

        glColor3f(cR*0.9f, cRg*0.8f, cR*0.7f);
        glBegin(GL_QUADS);
        glVertex2f(cx2-6, btHeight-capH); glVertex2f(cx2, btHeight-capH);
        glVertex2f(cx2, btHeight); glVertex2f(cx2-6, btHeight);
        glEnd();

        drawRivet(cx1 + 8, btHeight - capH/2);
        drawRivet(cx2 - 8, btHeight - capH/2);
        drawRivet(x + PIPE_WIDTH/2, btHeight - capH/2);
    }
}
void spawnPipe() {
    Pipe p;
    p.x = SCREEN_WIDTH;

    float minG = GROUND_HEIGHT + PIPE_GAP/2 + 20;
    float maxG = SCREEN_HEIGHT - PIPE_GAP/2 - 20;

    p.originalGapY = minG + rand() % (int)(maxG - minG);
    p.movePhase = pipeTimeOffset;
    p.gapY = p.originalGapY;

    int currentLevel = getCurrentLevel();
    p.isFlipped = (currentLevel >= flipLevel);

    p.counted = false;
    pipes.push_back(p);
}

void handleDeath() {
    lives--;

    if (lives <= 0) {
        gameRunning = false;
        playWavSound(SOUND_HIT, true);
        playBeep(200, 200);
        playBeep(150, 250);
    } else {
        playWavSound(SOUND_HIT, true);
        birdY        = SCREEN_HEIGHT / 2;
        birdVelocity = 0;
        birdRotation = 0;

        pipes.clear();
        frameCounter = 0;
        spawnPipe();

        playBeep(500, 50);
    }
}

void checkCollisions() {
    if (birdY - BIRD_RADIUS <= GROUND_HEIGHT) {
        handleDeath();
        return;
    }
    if (birdY + BIRD_RADIUS >= SCREEN_HEIGHT) {
        handleDeath();
        return;
    }

    for (int i = (int)pipes.size()-1; i >= 0; i--) {
        Pipe& pipe = pipes[i];

        float top    = pipe.gapY + PIPE_GAP / 2.0f;
        float bottom = pipe.gapY - PIPE_GAP / 2.0f;
        float left   = pipe.x;
        float right  = pipe.x + PIPE_WIDTH;

        // Check horizontal overlap first
        if (BIRD_X + BIRD_RADIUS > left && BIRD_X - BIRD_RADIUS < right) {

            // --- TOP PIPE COLLISION ---
            // FIX: Cast right to float for min, ensure both are float for max
            float closestX = max(left, min(BIRD_X, right));  // Use max/min from algorithm (already included)
            float closestY_top = max(top, min(birdY, (float)SCREEN_HEIGHT));

            // --- BOTTOM PIPE COLLISION ---
            // FIX: Cast GROUND_HEIGHT to float
            float closestY_bottom = max((float)GROUND_HEIGHT, min(birdY, bottom));

            // Check collision using the actual variables (not redeclared)
            float dx1 = BIRD_X - closestX;
            float dy1 = birdY - closestY_top;
            float dx2 = BIRD_X - closestX;
            float dy2 = birdY - closestY_bottom;

            // Check collision
            if ((dx1*dx1 + dy1*dy1 <= BIRD_RADIUS * BIRD_RADIUS) ||
                (dx2*dx2 + dy2*dy2 <= BIRD_RADIUS * BIRD_RADIUS)) {

                handleDeath();
                return;
            }
        }
    }
}

void updateGame() {
    dayFrame = (dayFrame + 1) % DAY_CYCLE_FRAMES;
    cloudOffset += 0.3f;
    if (cloudOffset > SCREEN_WIDTH + 80) cloudOffset = 0;

    pipeTimeOffset += 0.01f;
    if (pipeTimeOffset > M_PI * 2) pipeTimeOffset -= M_PI * 2;

    if (!gameRunning || !gameStarted) return;

    birdVelocity += GRAVITY;
    birdVelocity  = max(birdVelocity, MAX_FALL_SPEED);
    birdY        += birdVelocity;

    float targetRot = birdVelocity * ROTATION_SPEED;
    targetRot       = min(max(targetRot, -30.0f), 28.0f);
    birdRotation   += (targetRot - birdRotation) * 0.18f;

    wingAngle += 0.10f;

   frameCounter++;
   PIPE_SPAWN_DELAY = getCurrentSpawnDelay();
    if (frameCounter >= PIPE_SPAWN_DELAY) {
    frameCounter = 0;
    spawnPipe();
}

    float moveAmplitude = getCurrentMoveAmplitude();
    float moveSpeed = getCurrentMoveSpeed();
    int currentLevel = getCurrentLevel();

    for (int i = (int)pipes.size()-1; i >= 0; i--) {
        pipes[i].x -= currentPipeSpeed;

        if (moveAmplitude > 0) {
            pipes[i].movePhase += moveSpeed;
            if (pipes[i].movePhase > M_PI * 2) pipes[i].movePhase -= M_PI * 2;

            float newGapY = pipes[i].originalGapY + sin(pipes[i].movePhase) * moveAmplitude;

            float minG = GROUND_HEIGHT + PIPE_GAP/2 + 20;
            float maxG = SCREEN_HEIGHT - PIPE_GAP/2 - 20;
            pipes[i].gapY = max(minG + PIPE_GAP/2, min(maxG - PIPE_GAP/2, newGapY));
        } else {
            pipes[i].gapY = pipes[i].originalGapY;
        }

        if (!pipes[i].counted && pipes[i].x + PIPE_WIDTH < BIRD_X) {
            pipes[i].counted = true;
            score++;

            int newLevel = getCurrentLevel();

            if (newLevel >= flipLevel && !pipesFlipped) {
                pipesFlipped = true;
                for (int j = 0; j < pipes.size(); j++) {
                    pipes[j].isFlipped = true;
                }
                playWavSound(SOUND_JUMP, true);
                playBeep(1000, 200);
                playBeep(1200, 200);
            }

            if (score >= nextSpeedScore) {
                currentPipeSpeed = min(MAX_PIPE_SPEED, BASE_PIPE_SPEED + (score / 5) * 0.6f);
                nextSpeedScore  += 5;
                playWavSound(SOUND_JUMP, true);
                playBeep(800, 60);
                playBeep(1000, 60);
            }

            playBeep(600, 50);
        }

        if (pipes[i].x + PIPE_WIDTH < 0)
            pipes.erase(pipes.begin() + i);
    }

    checkCollisions();
    highScore = max(highScore, score);
}

void resetGame() {
    birdY            = SCREEN_HEIGHT / 2;
    birdVelocity     = 0;
    birdRotation     = 0;
    score            = 0;
    lives            = 3;
    gameRunning      = true;
    currentPipeSpeed = BASE_PIPE_SPEED;
    nextSpeedScore   = 5;
    PIPE_SPAWN_DELAY = BASE_SPAWN_DELAY;
    pipes.clear();
    frameCounter = 0;
    wingAngle    = 0;
    pipeTimeOffset = 0.0f;
    pipesFlipped = false;
}

string getTimeLabel() {
    float phase = (float)dayFrame / DAY_CYCLE_FRAMES;
    if (phase < 1.0f/6) return "Dawn";
    else if (phase < 2.0f/6) return "Morning";
    else if (phase < 3.0f/6) return "Noon";
    else if (phase < 4.0f/6) return "Afternoon";
    else if (phase < 5.0f/6) return "Dusk";
    else return "Night";
}

void drawStartScreen() {
    glColor4f(0,0,0,0.75f);
    glBegin(GL_QUADS);
    glVertex2f(150,150); glVertex2f(650,150);
    glVertex2f(650,500); glVertex2f(150,500);
    glEnd();

    drawText(295, 460, "FLAPPY BIRD", 1, 0.85f, 0.2f, 28);
    drawText(260, 420, "Press SPACE to Start", 1, 1, 1, 18);
    drawText(285, 380, "Avoid the pipes!", 1, 0.8f, 0.5f, 18);

    drawText(220, 340, "Progressive Difficulty:", 1, 0.9f, 0.5f, 16);
    drawText(180, 310, "Level 1 (0-4 pts): Static pipes", 0.9f, 0.9f, 0.7f, 12);
    drawText(180, 285, "Level 2 (5-9 pts): Slow pipe movement", 0.9f, 0.9f, 0.7f, 12);
    drawText(180, 260, "Level 3 (10-14 pts): Full pipe movement", 0.9f, 0.9f, 0.7f, 12);
    drawText(180, 235, "Level 3+ (15+ pts): Pipes FLIP UPSIDE DOWN!", 1.0f, 0.5f, 0.2f, 12);
    drawText(180, 210, "Speed increases every 5 points", 0.9f, 0.9f, 0.7f, 12);

    drawText(295, 170, "Best: " + to_string(highScore), 1, 1, 0, 16);
    drawText(260, 140, "Press ESC to Exit", 0.7f, 0.7f, 0.7f, 12);
}

void drawGameOverScreen() {
    glColor4f(0,0,0,0.85f);
    glBegin(GL_QUADS);
    glVertex2f(150,150); glVertex2f(650,150);
    glVertex2f(650,500); glVertex2f(150,500);
    glEnd();

    drawText(295, 450, "GAME OVER", 1, 0.3f, 0.2f, 28);
    drawText(290, 400, "Final Score: " + to_string(score), 1, 1, 1, 20);
    drawText(290, 360, "Best Score:  " + to_string(highScore), 1, 1, 0, 18);
    drawText(310, 320, "Lives Used:  " + to_string(3 - lives), 1, 0.8f, 0.5f, 18);

    float speedMultiplier = currentPipeSpeed / BASE_PIPE_SPEED;
    char speedText[50];
    sprintf(speedText, "Max Speed: %.1fx", speedMultiplier);
    drawText(310, 280, speedText, 0.7f, 0.9f, 1.0f, 16);

    drawText(245, 240, "Press SPACE to Restart", 0.8f, 0.9f, 1.0f, 18);
    drawText(340, 200, "ESC to Exit", 0.7f, 0.7f, 0.7f, 16);
}

// Constants for developer screen layout
struct DeveloperScreenLayout {
    static constexpr int BOX_WIDTH = 460;
    static constexpr int BOX_HEIGHT = 420;
    static constexpr int BUTTON_WIDTH = 260;
    static constexpr int BUTTON_HEIGHT = 60;
    static constexpr int LINE_GAP = 38;
    static constexpr int SMALL_GAP = 25;
    static constexpr int SECTION_GAP = 5;
};

// Color definitions
struct Color {
    float r, g, b;

    static Color BackgroundGradientTop() { return {0.02f, 0.02f, 0.06f}; }
    static Color BackgroundGradientBottom() { return {0.05f, 0.05f, 0.12f}; }
    static Color BoxFill() { return {0.12f, 0.12f, 0.18f}; }
    static Color BoxBorder() { return {1.0f, 0.8f, 0.2f}; }
    static Color SectionDivider() { return {0.8f, 0.8f, 0.2f}; }
    static Color ButtonFill() { return {0.2f, 0.75f, 0.35f}; }
    static Color TitleGold() { return {1.0f, 0.85f, 0.25f}; }
    static Color SubtitleBlue() { return {0.6f, 0.75f, 1.0f}; }
    static Color DeveloperName() { return {1.0f, 0.9f, 0.3f}; }
    static Color IdText() { return {0.6f, 0.6f, 0.6f}; }
    static Color MentorLabel() { return {1.0f, 0.9f, 0.4f}; }
    static Color MentorName() { return {1.0f, 0.7f, 0.2f}; }
    static Color MentorThanks() { return {0.7f, 0.8f, 0.5f}; }
    static Color ButtonText() { return {1.0f, 1.0f, 1.0f}; }
};

// Helper function to draw a bordered box
void drawBorderedBox(int x, int y, int width, int height, const Color& fillColor, const Color& borderColor) {
    // Fill
    glColor3f(fillColor.r, fillColor.g, fillColor.b);
    glBegin(GL_QUADS);
    glVertex2f(x, y);
    glVertex2f(x + width, y);
    glVertex2f(x + width, y + height);
    glVertex2f(x, y + height);
    glEnd();

    // Border
    glColor3f(borderColor.r, borderColor.g, borderColor.b);
    glBegin(GL_LINE_LOOP);
    glVertex2f(x, y);
    glVertex2f(x + width, y);
    glVertex2f(x + width, y + height);
    glVertex2f(x, y + height);
    glEnd();
}

// Helper function to draw a horizontal divider
void drawDivider(int startX, int endX, int y, const Color& color) {
    glColor3f(color.r, color.g, color.b);
    glBegin(GL_LINES);
    glVertex2f(startX, y);
    glVertex2f(endX, y);
    glEnd();
}

// Helper function to draw a button
void drawButton(int centerX, int y, int width, int height, const char* text, const Color& bgColor, const Color& textColor) {
    int buttonX = centerX - width / 2;

    glColor3f(bgColor.r, bgColor.g, bgColor.b);
    glBegin(GL_QUADS);
    glVertex2f(buttonX, y);
    glVertex2f(buttonX + width, y);
    glVertex2f(buttonX + width, y + height);
    glVertex2f(buttonX, y + height);
    glEnd();

    drawText(centerX - 90, y + 20, text, textColor.r, textColor.g, textColor.b, 18);
}

// Helper function to draw a developer entry
void drawDeveloperEntry(int centerX, int y, const char* name, const char* id, const Color& nameColor, const Color& idColor) {
    drawText(centerX - 150, y, name, nameColor.r, nameColor.g, nameColor.b, 22);
    drawText(centerX - 65, y - DeveloperScreenLayout::SMALL_GAP, id, idColor.r, idColor.g, idColor.b, 14);
}

// Helper function to draw mentor section
void drawMentorSection(int centerX, int y, const Color& labelColor, const Color& nameColor, const Color& thanksColor) {
    drawText(centerX - 70, y, "MENTOR", labelColor.r, labelColor.g, labelColor.b, 18);
    drawText(centerX - 85, y - 28, "Tasnimatul Jannah", nameColor.r, nameColor.g, nameColor.b, 24);
    drawText(centerX - 125, y - 50, "Special Thanks & Guidance", thanksColor.r, thanksColor.g, thanksColor.b, 16);
}

// UI Layout Configuration

struct UISpec {
    static constexpr int BOX_WIDTH = 460;
    static constexpr int BOX_HEIGHT = 420;

    static constexpr int BUTTON_WIDTH = 260;
    static constexpr int BUTTON_HEIGHT = 60;

    static constexpr int LINE_GAP = 38;
    static constexpr int SMALL_GAP = 25;
    static constexpr int SECTION_SPACING = 10;

    static constexpr int PADDING = 20;
};

// Color System

struct UIColors {
    float r, g, b;

    constexpr UIColors(float r, float g, float b) : r(r), g(g), b(b) {}

    static UIColors BackgroundTop()    { return {0.02f, 0.02f, 0.06f}; }
    static UIColors BackgroundBottom() { return {0.05f, 0.05f, 0.12f}; }

    static UIColors CardFill()   { return {0.12f, 0.12f, 0.18f}; }
    static UIColors CardBorder() { return {1.0f, 0.8f, 0.2f}; }

    static UIColors AccentGold() { return {1.0f, 0.85f, 0.25f}; }
    static UIColors AccentBlue() { return {0.6f, 0.75f, 1.0f}; }
    static UIColors AccentGreen(){ return {0.4f, 1.0f, 0.6f}; }

    static UIColors TextPrimary()   { return {1.0f, 0.9f, 0.3f}; }
    static UIColors TextSecondary() { return {0.6f, 0.6f, 0.6f}; }

    static UIColors Divider() { return {0.8f, 0.8f, 0.2f}; }

    static UIColors Button()     { return {0.2f, 0.75f, 0.35f}; }
    static UIColors ButtonText() { return {1.0f, 1.0f, 1.0f}; }
};


// Primitive UI Components

void drawFilledRect(int x, int y, int w, int h, const UIColors& color) {
    glColor3f(color.r, color.g, color.b);
    glBegin(GL_QUADS);
    glVertex2f(x, y);
    glVertex2f(x + w, y);
    glVertex2f(x + w, y + h);
    glVertex2f(x, y + h);
    glEnd();
}

void drawBorder(int x, int y, int w, int h, const UIColors& color) {
    glColor3f(color.r, color.g, color.b);
    glBegin(GL_LINE_LOOP);
    glVertex2f(x, y);
    glVertex2f(x + w, y);
    glVertex2f(x + w, y + h);
    glVertex2f(x, y + h);
    glEnd();
}

void drawCard(int x, int y, int w, int h) {
    drawFilledRect(x, y, w, h, UIColors::CardFill());
    drawBorder(x, y, w, h, UIColors::CardBorder());
}

void drawDividerLine(int x1, int x2, int y) {
    UIColors c = UIColors::Divider();
    glColor3f(c.r, c.g, c.b);

    glBegin(GL_LINES);
    glVertex2f(x1, y);
    glVertex2f(x2, y);
    glEnd();
}

void drawCenteredText(int centerX, int y, const char* text,
                      const UIColors& color, int size, int offsetX = 0) {
    drawText(centerX + offsetX, y, text, color.r, color.g, color.b, size);
}


// Composite Components

void drawButton(int centerX, int y, const char* label) {
    int x = centerX - UISpec::BUTTON_WIDTH / 2;

    drawFilledRect(x, y, UISpec::BUTTON_WIDTH, UISpec::BUTTON_HEIGHT, UIColors::Button());
    drawCenteredText(centerX - 90, y + 20, label, UIColors::ButtonText(), 18);
}

void drawDeveloper(int centerX, int y, const char* name, const char* id) {
    drawCenteredText(centerX - 150, y, name, UIColors::TextPrimary(), 22);
    drawCenteredText(centerX - 65, y - UISpec::SMALL_GAP, id, UIColors::TextSecondary(), 14);
}

void drawMentor(int centerX, int y) {
    drawCenteredText(centerX - 70, y, "MENTOR", UIColors::AccentGold(), 18);
    drawCenteredText(centerX - 85, y - 28, "Tasnimatul Jannah", UIColors::AccentGold(), 24);
    drawCenteredText(centerX - 125, y - 50, "Special Thanks & Guidance", UIColors::AccentBlue(), 16);
}


// Background

void drawGradientBackground() {
    glBegin(GL_QUADS);

    UIColors top = UIColors::BackgroundTop();
    UIColors bottom = UIColors::BackgroundBottom();

    glColor3f(top.r, top.g, top.b);
    glVertex2f(0, 0);
    glVertex2f(SCREEN_WIDTH, 0);

    glColor3f(bottom.r, bottom.g, bottom.b);
    glVertex2f(SCREEN_WIDTH, SCREEN_HEIGHT);
    glVertex2f(0, SCREEN_HEIGHT);

    glEnd();
}


// Main Screen Renderer

void drawDeveloperScreen() {
    const int centerX = SCREEN_WIDTH / 2;

    drawGradientBackground();

    // Header
    drawCenteredText(centerX - 170, SCREEN_HEIGHT - 120, "FLAPPY HORIZON", UIColors::AccentGold(), 34);
    drawCenteredText(centerX - 115, SCREEN_HEIGHT - 160, "Soar Beyond Limits", UIColors::AccentBlue(), 18);
    drawCenteredText(centerX - 125, SCREEN_HEIGHT - 200, "DEVELOPER INFO", UIColors::AccentBlue(), 20);

    // Card Container
    int boxX = centerX - UISpec::BOX_WIDTH / 2;
    int boxY = SCREEN_HEIGHT - 500;

    drawCard(boxX, boxY, UISpec::BOX_WIDTH, UISpec::BOX_HEIGHT);

    int y = boxY + UISpec::BOX_HEIGHT - 50;

    // Developed By
    drawCenteredText(centerX - 90, y, "DEVELOPED BY", UIColors::AccentGreen(), 16);
    y -= UISpec::LINE_GAP;

    drawDeveloper(centerX, y, "Robiul Hasan Jisan", "ID: 232008812");
    y -= UISpec::LINE_GAP;

    drawDividerLine(boxX + UISpec::PADDING, boxX + UISpec::BOX_WIDTH - UISpec::PADDING, y);
    y -= UISpec::LINE_GAP;

    // Co-Developer
    drawDeveloper(centerX, y, "Mahbubul Alam", "ID: 223011012");
    y -= UISpec::LINE_GAP;

    drawDividerLine(boxX + UISpec::PADDING, boxX + UISpec::BOX_WIDTH - UISpec::PADDING, y);
    y -= (UISpec::LINE_GAP - UISpec::SECTION_SPACING);

    // Mentor
    drawMentor(centerX, y);

    // Button
    drawButton(centerX, boxY - 100, "START JOURNEY");
}
void display() {
    glClear(GL_COLOR_BUFFER_BIT);
    glLoadIdentity();

    if (showDeveloperScreen) {
        drawDeveloperScreen();
        glutSwapBuffers();
        return;
    }

    RGB dummy1, dummy2, dummy3, dummy4;
    float ambient, sunAngle, nightBlend;
    getDayState(dummy1, dummy2, dummy3, dummy4, ambient, sunAngle, nightBlend);

    drawBackground();

    for (size_t i = 0; i < pipes.size(); i++)
        drawPipe(pipes[i].x, pipes[i].gapY, ambient, pipes[i].isFlipped);

    drawBird(BIRD_X, birdY, birdRotation, ambient);

    if (gameStarted && gameRunning) {
        string scoreStr = to_string(score);
        float tw = scoreStr.size() * 14.0f;
        drawText(SCREEN_WIDTH/2.0f - tw/2.0f, SCREEN_HEIGHT - 80, scoreStr, 1, 1, 1, 24);
        drawHearts(lives);

        int currentLevel = getCurrentLevel();
        char levelText[50];
        sprintf(levelText, "Level: %d", currentLevel);
        drawText(SCREEN_WIDTH - 100, SCREEN_HEIGHT - 30, levelText, 1, 0.8f, 0.5f, 14);

        if (currentLevel == 1) {
            drawText(SCREEN_WIDTH/2 - 80, SCREEN_HEIGHT - 110, "STATIC PIPES", 0.5f, 0.8f, 0.5f, 14);
        } else if (currentLevel == 2) {
            drawText(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT - 110, "SLOW MOVEMENT", 0.7f, 0.9f, 0.5f, 14);
        } else if (currentLevel == 3 && !pipesFlipped) {
            drawText(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2, "NEXT: PIPES WILL FLIP!", 1, 0.5f, 0.2f, 14);
        }

        if (pipesFlipped) {
            drawText(SCREEN_WIDTH - 140, SCREEN_HEIGHT - 55, "FLIPPED MODE!", 1, 0.3f, 0.1f, 14);
        }

        float speedPercent = (currentPipeSpeed / MAX_PIPE_SPEED) * 100;
        char speedText[50];
        sprintf(speedText, "Speed: %.0f%%", speedPercent);
        drawText(SCREEN_WIDTH - 120, SCREEN_HEIGHT - 80, speedText, 0.8f, 0.8f, 1.0f, 14);

        char nextSpeedText[50];
        sprintf(nextSpeedText, "Next +Speed: %d pts", nextSpeedScore);
        drawText(SCREEN_WIDTH - 180, SCREEN_HEIGHT - 105, nextSpeedText, 0.7f, 0.7f, 0.9f, 14);

        drawText(SCREEN_WIDTH - 160, SCREEN_HEIGHT - 130, "BEST: " + to_string(highScore), 1, 1, 0, 14);

        float moveAmp = getCurrentMoveAmplitude();
        if (moveAmp == 0) {
            drawText(12, SCREEN_HEIGHT - 55, "Pipes: Static", 0.5f, 0.7f, 0.5f, 18);
        } else if (moveAmp < 30) {
            drawText(12, SCREEN_HEIGHT - 55, "Pipes: Slow Move", 0.5f, 0.8f, 0.5f, 18);
        } else {
            drawText(12, SCREEN_HEIGHT - 55, "Pipes: Full Move", 0.5f, 0.9f, 0.5f, 18);
        }
        drawText(12, SCREEN_HEIGHT - 70, "Gap: Fixed (180px)", 0.5f, 0.7f, 0.5f, 18);
    }

    drawText(12, SCREEN_HEIGHT - 30, getTimeLabel(), 1, 1, 0.7f, 20);

    if (!gameStarted && showGameScreen) drawStartScreen();
    else if (!gameRunning) drawGameOverScreen();

    glutSwapBuffers();
}

void doJump() {
    if (showDeveloperScreen) {
        showDeveloperScreen = false;
        showGameScreen = true;
        gameStarted = false;
        playWavSound(SOUND_JUMP, true);
        return;
    }

    if (!gameStarted) {
        gameStarted = true;
        resetGame();
        playWavSound(SOUND_JUMP, true);
    } else if (gameRunning) {
        birdVelocity = JUMP_FORCE;
        playWavSound(SOUND_JUMP, true);
    } else {
        resetGame();
        gameStarted = true;
        playWavSound(SOUND_JUMP, true);
    }
}

void mouseClick(int button, int state, int x, int y) {
    if (button == GLUT_LEFT_BUTTON && state == GLUT_DOWN) {
        if (showDeveloperScreen) {
            int mouseY = SCREEN_HEIGHT - y;
            if (x >= SCREEN_WIDTH/2 - 100 && x <= SCREEN_WIDTH/2 + 100 &&
                mouseY >= SCREEN_HEIGHT - 550 && mouseY <= SCREEN_HEIGHT - 490) {
                showDeveloperScreen = false;
                showGameScreen = true;
                gameStarted = false;
                playWavSound(SOUND_JUMP, true);
                return;
            }
        }
        doJump();
    }
}

void keyboard(unsigned char key, int x, int y) {
    if (key == 32) doJump();
    if (key == 27) exit(0);
}

void specialKeys(int key, int x, int y) {
    if (key == GLUT_KEY_UP) doJump();
}

void timer(int value) {
    updateGame();
    glutPostRedisplay();
    glutTimerFunc(16, timer, 0);
}

void initGL() {
    glClearColor(0.02f, 0.02f, 0.10f, 1.0f);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluOrtho2D(0, SCREEN_WIDTH, 0, SCREEN_HEIGHT);
    glMatrixMode(GL_MODELVIEW);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB);
    glutInitWindowSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    glutInitWindowPosition(100, 50);
    glutCreateWindow("Flappy Bird - Progressive Difficulty");

    glutDisplayFunc(display);
    glutKeyboardFunc(keyboard);
    glutSpecialFunc(specialKeys);
    glutMouseFunc(mouseClick);
    glutTimerFunc(0, timer, 0);

    initGL();
    srand((unsigned int)time(NULL));

    for (int i = 0; i < NUM_STARS; i++) {
        stars[i].x          = (float)(rand() % SCREEN_WIDTH);
        stars[i].y          = GROUND_HEIGHT + 30 + rand() % (SCREEN_HEIGHT - GROUND_HEIGHT - 30);
        stars[i].brightness = 0.4f + 0.6f * (rand() % 100) / 100.0f;
    }

#ifdef _WIN32
    PlaySound(NULL, NULL, 0);
#endif

    cout << "=============================================\n";
    cout << "   FLAPPY BIRD — Progressive Difficulty\n";
    cout << "=============================================\n";
    cout << "Developers: Robiul Hasan Jisan (ID: 232008812)\n";
    cout << "           Mahbubul Alam (ID: 223011012)\n";
    cout << "Special Thanks: TJ Mam\n";
    cout << "---------------------------------------------\n";
    cout << "Difficulty Progression:\n";
    cout << "* Level 1 (0-4 pts):  STATIC pipes (no movement)\n";
    cout << "* Level 2 (5-9 pts):  SLOW pipe movement\n";
    cout << "* Level 3 (10-14 pts): FULL pipe movement\n";
    cout << "* Level 3+ (15+ pts): PIPES FLIP UPSIDE DOWN!\n";
    cout << "* Speed increases every 5 points\n";
    cout << "* Fixed pipe gap throughout the game\n";
    cout << "---------------------------------------------\n";
    cout << "CONTROLS: SPACE / Up-arrow / Left-click = jump\n";
    cout << "          ESC = exit\n";
    cout << "=============================================\n";
    cout << "SOUND: bird_sound.wav - Jump/Fly\n";
    cout << "       bird_hit.wav   - Collision/Death\n";
    cout << "=============================================\n";

    glutMainLoop();
    return 0;
}
