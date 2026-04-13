// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let gameStarted = false;
let score = 0;
let bestScore = 0;

// ── SOUNDS ────────────────────────────────────────────────
const sfx = {
    wing:   new Audio('./sfx_wing.wav'),
    swoosh: new Audio('./sfx_swooshing.wav'),
    point:  new Audio('./sfx_point.wav'),
    hit:    new Audio('./sfx_hit.wav'),
    die:    new Audio('./sfx_die.wav'),
};
function playSound(name) {
    try { sfx[name].currentTime = 0; sfx[name].play(); } catch(e) {}
}

// ── 3 LIVES ───────────────────────────────────────────────
let lives = 3;
let invincible = false;
let invincibleTimer = 0;
const INVINCIBLE_FRAMES = 90;
let blinkFrame = 0;

// ── DAY / NIGHT CYCLE ─────────────────────────────────────
const PHASES = [
    { name:"DAWN",      sky1:"#2d1b5e", sky2:"#e8824a", light:0.75, stars:true,  starFade:true,  butterflies:false, dust:false, sunset:false, shooting:false },
    { name:"MORNING",   sky1:"#aadcf5", sky2:"#f8f8f8", light:1.00, stars:false, starFade:false, butterflies:true,  dust:false, sunset:false, shooting:false },
    { name:"NOON",      sky1:"#1a6fcc", sky2:"#7dc8f7", light:1.00, stars:false, starFade:false, butterflies:false, dust:false, sunset:false, shooting:false },
    { name:"AFTERNOON", sky1:"#3a7bd5", sky2:"#f5b942", light:0.95, stars:false, starFade:false, butterflies:false, dust:true,  sunset:false, shooting:false },
    { name:"DUSK",      sky1:"#4a1a7a", sky2:"#f06030", light:0.70, stars:true,  starFade:false, butterflies:false, dust:false, sunset:true,  shooting:false },
    { name:"NIGHT",     sky1:"#050a1a", sky2:"#0d1a3a", light:0.50, stars:true,  starFade:false, butterflies:false, dust:false, sunset:false, shooting:true  },
];
const PHASE_DURATION = 600;
let phaseIdx = 0, phaseTick = 0, transitionT = 0;
let stars = [], shootingStars = [], butterflies = [], dustParticles = [], clouds = [];
let frameCount = 0;

// ── HELPERS ───────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }

function lerpColor(c1, c2, t) {
    const r1=parseInt(c1.slice(1,3),16), g1=parseInt(c1.slice(3,5),16), b1=parseInt(c1.slice(5,7),16);
    const r2=parseInt(c2.slice(1,3),16), g2=parseInt(c2.slice(3,5),16), b2=parseInt(c2.slice(5,7),16);
    return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`;
}

function getPhaseBlend() {
    const cur = PHASES[phaseIdx], nxt = PHASES[(phaseIdx+1) % PHASES.length], t = transitionT;
    return {
        sky1: lerpColor(cur.sky1,nxt.sky1,t), sky2: lerpColor(cur.sky2,nxt.sky2,t),
        light: lerp(cur.light,nxt.light,t),
        stars: cur.stars||nxt.stars, starFade: cur.starFade,
        butterflies: cur.butterflies, dust: cur.dust,
        sunset: cur.sunset, shooting: cur.shooting,
        name: cur.name, t
    };
}

function initAmbient() {
    stars = [];
    for (let i=0;i<60;i++) stars.push({x:Math.random()*boardWidth, y:Math.random()*(boardHeight*0.6), r:0.5+Math.random()*1.5, twinkle:Math.random()*Math.PI*2});
    butterflies = [];
    for (let i=0;i<6;i++) butterflies.push({x:Math.random()*boardWidth, y:60+Math.random()*180, vx:0.5+Math.random()*0.8, vy:0, t:Math.random()*100, color:`hsl(${Math.floor(Math.random()*360)},80%,65%)`});
    dustParticles = [];
    for (let i=0;i<40;i++) dustParticles.push({x:Math.random()*boardWidth, y:100+Math.random()*(boardHeight-180), vx:0.2+Math.random()*0.4, vy:-0.05+Math.random()*0.1, alpha:Math.random()*0.5});
    clouds = [{x:40,y:55,r:30,s:0.25},{x:180,y:85,r:22,s:0.18},{x:290,y:48,r:26,s:0.22},{x:120,y:125,r:18,s:0.20}];
    shootingStars = [];
}

// ── DRAW BACKGROUND ───────────────────────────────────────
function drawBackground(ph) {
    const grad = context.createLinearGradient(0,0,0,boardHeight);
    grad.addColorStop(0,ph.sky1); grad.addColorStop(1,ph.sky2);
    context.fillStyle = grad;
    context.fillRect(0,0,boardWidth,boardHeight);

    const dim = 1 - ph.light;
    if (dim > 0) { context.fillStyle=`rgba(0,0,0,${dim*0.6})`; context.fillRect(0,0,boardWidth,boardHeight); }

    if (ph.stars) {
        const sa = ph.starFade ? lerp(1,0,ph.t) : ph.shooting ? 1 : 0.8;
        stars.forEach(s => {
            s.twinkle += 0.03;
            context.fillStyle = `rgba(255,255,220,${sa*(0.5+0.5*Math.sin(s.twinkle))})`;
            context.beginPath(); context.arc(s.x,s.y,s.r,0,Math.PI*2); context.fill();
        });
    }

    if (ph.shooting && Math.random()<0.004)
        shootingStars.push({x:Math.random()*boardWidth, y:Math.random()*(boardHeight*0.4), vx:-4-Math.random()*3, vy:2+Math.random()*2, life:1, len:60+Math.random()*40});
    shootingStars = shootingStars.filter(s=>s.life>0);
    shootingStars.forEach(s => {
        context.save(); context.globalAlpha=s.life;
        const grd=context.createLinearGradient(s.x,s.y,s.x-s.vx*(s.len/5),s.y-s.vy*(s.len/5));
        grd.addColorStop(0,'rgba(255,255,255,1)'); grd.addColorStop(1,'rgba(255,255,255,0)');
        context.strokeStyle=grd; context.lineWidth=1.5;
        context.beginPath(); context.moveTo(s.x,s.y); context.lineTo(s.x-s.vx*(s.len/5),s.y-s.vy*(s.len/5)); context.stroke();
        context.restore();
        s.x+=s.vx; s.y+=s.vy; s.life-=0.025;
    });

    if (ph.sunset) {
        const sg=context.createRadialGradient(boardWidth*0.75,boardHeight,0,boardWidth*0.75,boardHeight,180);
        sg.addColorStop(0,'rgba(255,160,30,.35)'); sg.addColorStop(1,'rgba(255,80,0,0)');
        context.fillStyle=sg; context.fillRect(0,0,boardWidth,boardHeight);
    }

    clouds.forEach(cl => {
        context.fillStyle=`rgba(255,255,255,${ph.light*0.85})`;
        context.beginPath();
        context.arc(cl.x,cl.y,cl.r,0,Math.PI*2);
        context.arc(cl.x+cl.r*0.7,cl.y-cl.r*0.3,cl.r*0.65,0,Math.PI*2);
        context.arc(cl.x-cl.r*0.5,cl.y-cl.r*0.2,cl.r*0.5,0,Math.PI*2);
        context.fill();
        cl.x -= cl.s; if (cl.x+cl.r*2<0) cl.x=boardWidth+cl.r;
    });

    if (ph.butterflies) {
        butterflies.forEach(b => {
            b.t+=0.05; b.x+=b.vx; b.vy=Math.sin(b.t*2)*0.8; b.y+=b.vy;
            if (b.x>boardWidth+20) b.x=-20;
            if (b.y<40) b.y=40; if (b.y>boardHeight*0.55) b.y=boardHeight*0.55;
            const ws=8+Math.abs(Math.sin(b.t*4))*5;
            context.save(); context.translate(b.x,b.y); context.globalAlpha=0.75;
            context.fillStyle=b.color;
            context.beginPath(); context.ellipse(-ws/2,-3,ws/2,4,0.3,0,Math.PI*2); context.fill();
            context.beginPath(); context.ellipse(ws/2,-3,ws/2,4,-0.3,0,Math.PI*2); context.fill();
            context.fillStyle='#333'; context.beginPath(); context.ellipse(0,0,1.5,5,0,0,Math.PI*2); context.fill();
            context.restore();
        });
    }

    if (ph.dust) {
        dustParticles.forEach(d => {
            d.x+=d.vx; d.y+=d.vy; if (d.x>boardWidth+5) d.x=-5;
            context.fillStyle=`rgba(210,170,80,${d.alpha*0.6})`;
            context.beginPath(); context.arc(d.x,d.y,1.5,0,Math.PI*2); context.fill();
        });
    }
}

// ── DRAW HEARTS ───────────────────────────────────────────
function drawHeart(x, y, size, filled) {
    context.fillStyle = filled ? '#FF4D6D' : 'rgba(255,255,255,0.25)';
    const s = size/2;
    context.beginPath();
    context.moveTo(x, y+s*0.4);
    context.bezierCurveTo(x,y-s*0.6, x-s,y-s*0.6, x-s,y);
    context.bezierCurveTo(x-s,y+s*0.5, x,y+s*1.1, x,y+s*1.3);
    context.bezierCurveTo(x,y+s*1.1, x+s,y+s*0.5, x+s,y);
    context.bezierCurveTo(x+s,y-s*0.6, x,y-s*0.6, x,y+s*0.4);
    context.closePath(); context.fill();
}

function drawLives() {
    for (let i=0; i<3; i++) drawHeart(boardWidth-28-i*28, 24, 20, i<lives);
}

// ── ROUNDED RECT PATH ─────────────────────────────────────
function roundRect(x, y, w, h, r, topOnly) {
    context.beginPath();
    context.moveTo(x+r, y);
    context.lineTo(x+w-r, y);
    context.quadraticCurveTo(x+w, y, x+w, y+r);
    if (topOnly) {
        context.lineTo(x+w, y+h);
        context.lineTo(x, y+h);
    } else {
        context.lineTo(x+w, y+h-r);
        context.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        context.lineTo(x+r, y+h);
        context.quadraticCurveTo(x, y+h, x, y+h-r);
    }
    context.lineTo(x, y+r);
    context.quadraticCurveTo(x, y, x+r, y);
    context.closePath();
}

// ── SCORE PANEL ───────────────────────────────────────────
function drawScorePanel() {
    const isNewBest = score > 0 && score >= bestScore;
    const medal     = score>=30 ? "GOLD" : score>=20 ? "SILVER" : score>=10 ? "BRONZE" : null;
    const medalCol  = medal==="GOLD" ? "#FFD700" : medal==="SILVER" ? "#C0C0C0" : "#cd7f32";

    // overlay
    context.fillStyle = "rgba(0,0,0,0.55)";
    context.fillRect(0,0,boardWidth,boardHeight);

    const pw=280, ph=260, px=(boardWidth-pw)/2, py=(boardHeight-ph)/2-20, r=14;

    // panel bg
    context.fillStyle = "#dff0ea";
    roundRect(px,py,pw,ph,r); context.fill();
    context.strokeStyle = "#8ecdb7"; context.lineWidth=3;
    roundRect(px,py,pw,ph,r); context.stroke();

    // title bar
    context.fillStyle = "#3a7bd5";
    roundRect(px,py,pw,48,r,true); context.fill();
    context.fillStyle = "white";
    context.font = "bold 22px sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", boardWidth/2, py+31);

    // medal
    if (medal) {
        context.fillStyle = medalCol;
        context.beginPath(); context.arc(boardWidth/2, py+48+36, 30, 0, Math.PI*2); context.fill();
        context.strokeStyle="rgba(0,0,0,0.2)"; context.lineWidth=2; context.stroke();
        context.fillStyle="rgba(0,0,0,0.4)";
        context.font="bold 11px sans-serif"; context.textAlign="center";
        context.fillText(medal, boardWidth/2, py+48+40);
    }

    const rowY = py+48+85, col1=px+20, col2=px+pw-20;

    // top divider
    context.strokeStyle="#8ecdb7"; context.lineWidth=1.5;
    context.beginPath(); context.moveTo(px+16,rowY-14); context.lineTo(px+pw-16,rowY-14); context.stroke();

    // SCORE row
    context.fillStyle="#555"; context.font="15px sans-serif"; context.textAlign="left";
    context.fillText("SCORE", col1, rowY);
    context.fillStyle="#222"; context.font="bold 22px sans-serif"; context.textAlign="right";
    context.fillText(score, col2, rowY);

    // BEST row
    context.fillStyle="#555"; context.font="15px sans-serif"; context.textAlign="left";
    context.fillText("BEST", col1, rowY+40);
    context.fillStyle= isNewBest ? "#e67e00" : "#222";
    context.font="bold 22px sans-serif"; context.textAlign="right";
    context.fillText(bestScore, col2, rowY+40);
    if (isNewBest) {
        context.fillStyle="#e67e00"; context.font="bold 11px sans-serif"; context.textAlign="right";
        context.fillText("NEW BEST!", col2, rowY+56);
    }

    // bottom divider
    context.strokeStyle="#8ecdb7"; context.lineWidth=1.5;
    context.beginPath(); context.moveTo(px+16,rowY+70); context.lineTo(px+pw-16,rowY+70); context.stroke();

    // phase reached
    context.fillStyle="#444"; context.font="13px sans-serif"; context.textAlign="center";
    context.fillText("Phase reached: " + PHASES[phaseIdx].name, boardWidth/2, rowY+90);

    // restart hint
    context.fillStyle="#666"; context.font="13px sans-serif"; context.textAlign="center";
    context.fillText("Press SPACE or tap to restart", boardWidth/2, py+ph-14);

    context.textAlign="left";
}

// ── UPDATE PHASE ──────────────────────────────────────────
function updatePhase() {
    phaseTick++;
    transitionT = Math.min(1, phaseTick/60);
    if (phaseTick >= PHASE_DURATION) { phaseIdx=(phaseIdx+1)%PHASES.length; phaseTick=0; transitionT=0; }
}

// ── WINDOW ONLOAD ─────────────────────────────────────────
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width  = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image(); birdImg.src = "./flappybird.png";
    birdImg.onload = function() { context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); }

    topPipeImg    = new Image(); topPipeImg.src    = "./toppipe.png";
    bottomPipeImg = new Image(); bottomPipeImg.src = "./bottompipe.png";

    initAmbient();
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
    board.addEventListener("pointerdown", function() {
    if (gameOver) {
        bird.y=birdY; pipeArray=[]; score=0; lives=3;
        gameOver=false; gameStarted=true; invincible=false;
        phaseIdx=0; phaseTick=0; transitionT=0;
        initAmbient(); playSound('swoosh'); return;
    }
    if (!gameStarted) {
        gameStarted=true;
        playSound('swoosh');
    }
    velocityY = -6;
    playSound('wing');
});
}

// ── MAIN LOOP ─────────────────────────────────────────────
function update() {
    requestAnimationFrame(update);
    frameCount++;
    updatePhase();
    const ph = getPhaseBlend();
    drawBackground(ph);

    if (gameOver) {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        drawLives();
        drawScorePanel();
        return;
    }

    if (!gameStarted) {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        context.fillStyle = "rgba(0,0,0,0.45)";
        context.fillRect(0, boardHeight/2+30, boardWidth, 50);
        context.fillStyle = "white"; context.font="bold 18px sans-serif"; context.textAlign="center";
        context.fillText("Press SPACE or tap to start", boardWidth/2, boardHeight/2+62);
        context.textAlign="left";
        drawLives();
        return;
    }

    // bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    blinkFrame++;
    const showBird = !invincible || Math.floor(blinkFrame/6)%2===0;
    if (showBird) context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (invincible) { invincibleTimer--; if (invincibleTimer<=0) invincible=false; }
    if (bird.y > boardHeight) loseLife();

    // pipes
    for (let i=0; i<pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x+pipe.width) {
            score += 0.5;
            pipe.passed = true;
            if (Number.isInteger(score)) playSound('point');
        }
        if (!invincible && detectCollision(bird, pipe)) loseLife();
    }

    while (pipeArray.length>0 && pipeArray[0].x < -pipeWidth) pipeArray.shift();

    // HUD
    context.fillStyle="white"; context.font="45px sans-serif"; context.textAlign="left";
    context.fillText(score, 5, 45);
    context.fillStyle="rgba(255,255,255,0.6)"; context.font="13px sans-serif";
    context.fillText(ph.name, 5, boardHeight-10);
    drawLives();
}

// ── LOSE A LIFE ───────────────────────────────────────────
function loseLife() {
    if (invincible) return;
    playSound('hit');
    lives--;
    if (lives <= 0) {
        playSound('die');
        if (score > bestScore) bestScore = score;
        gameOver = true;
    } else {
        bird.y = birdY; velocityY = 0;
        invincible = true; invincibleTimer = INVINCIBLE_FRAMES; blinkFrame = 0;
    }
}

// ── PLACE PIPES ───────────────────────────────────────────
function placePipes() {
    if (gameOver || !gameStarted) return;
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;
    pipeArray.push({img:topPipeImg,    x:pipeX, y:randomPipeY,                           width:pipeWidth, height:pipeHeight, passed:false});
    pipeArray.push({img:bottomPipeImg, x:pipeX, y:randomPipeY+pipeHeight+openingSpace,   width:pipeWidth, height:pipeHeight, passed:false});
}

// ── MOVE BIRD ─────────────────────────────────────────────
function moveBird(e) {
    if (e.code=="Space" || e.code=="ArrowUp" || e.code=="KeyX") {
        if (gameOver) {
            bird.y=birdY; pipeArray=[]; score=0; lives=3;
            gameOver=false; gameStarted=true; invincible=false;
            phaseIdx=0; phaseTick=0; transitionT=0;
            initAmbient(); playSound('swoosh'); return;
        }
        if (!gameStarted) { gameStarted=true; playSound('swoosh'); }
        velocityY = -6;
        playSound('wing');
    }
}

// ── COLLISION ─────────────────────────────────────────────
function detectCollision(a, b) {
    return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
}
