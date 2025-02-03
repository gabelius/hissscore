const C={T:20,A:['c.wav','p.wav','d.wav','h.wav','g.wav']},w=window,G$={c:null,x:null,t:C.T,n:C.T,l:1,i:0,m:localStorage.getItem('m')!='0',a:null,g:null,u:{i:new Map,s:new Map},h:'light',s:1};w.GAME=G$;

// Declare G first to avoid reference errors
const G={s:{r:0,p:0,a:0,o:0,l:1,v:3,n:[],f:0,d:'r',x:'r'},f:0,t:0,d:0,v:150,lastTime:0,deltaAccumulator:0};

// Define SoundSystem
const S={b:new Map,init:_=>Promise.resolve(),async ia(){if(G$.i)return;try{
    const c=new(w.AudioContext||w.webkitAudioContext)();
    c.state==='suspended'&&await c.resume();G$.a=c;G$.g=c.createGain();G$.g.connect(c.destination);G$.g.gain.value=G$.m?0:1;await Promise.race([Promise.all(C.A.map((p,i)=>this.l(i,`assets/audio/${p}`))),new Promise((_,r)=>setTimeout(r,5e3))]);G$.i=1}catch(e){G$.i=0}},async l(k,p,r=3){while(r--)try{this.b.set(k,await G$.a.decodeAudioData(await(await fetch(p)).arrayBuffer()));return}catch{await new Promise(r=>setTimeout(r,500))}this.b.set(k,G$.a.createBuffer(2,44100,44100))},p(s){if(!G$.a||!this.b.has(s))return;try{const x=G$.a.createBufferSource();x.buffer=this.b.get(s);x.connect(G$.g);x.start()}catch{}}};

// Move UI setup function before initialization
function U() {
    const b = e => document.getElementById(e);
    const s = b('startBtn'), 
          a = b('autoBtn'), 
          m = b('muteBtn'),
          p = b('speedBtn'),
          t = b('themeToggle');

    const i = async () => {
        if (!G$.i) {
            await S.ia();
            document.removeEventListener('click', i);
            document.removeEventListener('keydown', i);
        }
    };

    document.addEventListener('click', i);
    document.addEventListener('keydown', i);

    const u = () => {
        m.textContent = G$.m ? '🔇' : '🔊';
        m.title = G$.m ? 'Unmute' : 'Mute';
    };

    s.onclick = async () => {
        if (G$.l) return;
        await i();
        if (G.s.r) {
            G.s.p = !G.s.p;
            G.s.p || G.q();
        } else {
            G.t();
        }
    };

    a.onclick = () => !G$.l && !G.s.r && (G.s.a = 1, G.t());
    m.onclick = () => {
        G$.m = !G$.m;
        localStorage.setItem('m', G$.m ? 1 : 0);
        G$.g && (G$.g.gain.value = G$.m ? 0 : 1);
        u();
    };

    p.onclick = () => {
        G$.s = G$.s % 3 + 1;
        p.textContent = ['⚡','⚡⚡','⚡⚡⚡'][G$.s-1];
        G.setSpeed(G$.s);
    };

    t.onclick = () => {
        G$.h = G$.h == 'light' ? 'dark' : 'light';
        document.body.className = G$.h;
        localStorage.setItem('theme', G$.h);
    };

    // Setup touch controls
    if (G$.c) {
        G$.c.ontouchstart = e => {
            e.preventDefault();
            T.x = e.touches[0].clientX;
            T.y = e.touches[0].clientY;
        };

        G$.c.ontouchmove = e => {
            e.preventDefault();
            T.m(e, G);
        };
    }

    // Set initial theme
    G$.h = localStorage.getItem('theme') || 'light';
    document.body.className = G$.h;
    u();

    // Setup keyboard controls
    document.onkeydown = e => {
        if (!G.s.r || G.s.a) return;
        const d = G.s.d;
        switch (e.key) {
            case 'ArrowUp': case 'w': d != 'd' && (G.s.x = 'u'); break;
            case 'ArrowDown': case 's': d != 'u' && (G.s.x = 'd'); break;
            case 'ArrowLeft': case 'a': d != 'r' && (G.s.x = 'l'); break;
            case 'ArrowRight': case 'd': d != 'l' && (G.s.x = 'r');
        }
    };
}

// Now RenderSystem can reference G safely
const R={d(s=G.s){
    // Should implement dirty rectangle rendering
    // Add frame skipping for performance
    // Cache frequently accessed values
}};

// Add methods to G
Object.assign(G, {
    init(){this.e();return Promise.resolve()},
    e(){
        this.v=150;
        this.d=0;
        this.t=performance.now();
        this.deltaAccumulator=0;
        Object.assign(this.s,{r:0,p:0,a:0,o:0,l:1,v:3,n:[{x:10,y:10}],f:null,d:'r',x:'r'});
        this.s.f=this.f()
    },
    q(){if(!this.s.r||this.s.p)return;
        const now=performance.now();
        this.deltaTime=Math.min(now-this.lastTime,32);
        this.lastTime=now;
        this.u();R.d(this.s);requestAnimationFrame(()=>this.q())},
    u(){const s=this.s,h={...s.n[0]};if(!s.r||s.p)return;({u:_=>h.y--,d:_=>h.y++,l:_=>h.x--,r:_=>h.x++})[s.d]();if(this.c(h)){S.p(3);this.i();return}h.x===s.f.x&&h.y===s.f.y?(s.o+=10,s.f=this.f(),S.p(0)):s.n.pop();s.n.unshift(h);s.d=s.x;this.H()},
    c:h=>h.x<0||h.x>=G$.n||h.y<0||h.y>=G$.n||G.s.n.some(s=>s.x==h.x&&s.y==h.y),i(){if(this.r)return;this.r=1;this.s.v--;S.p(2);this.s.r=0;this.s.v>0?setTimeout(()=>{this.e();this.t=0;this.s.r=1;this.r=0;this.q()},1e3):this.j()},
    j(){this.s.r=this.s.p=1;S.p(4);this.k()},
    f(){let f;do f={x:~~(Math.random()*G$.n),y:~~(Math.random()*G$.n)};while(this.s.n.some(s=>s.x==f.x&&s.y==f.y));return f},
    h(){document.querySelector('.game-over-overlay')?.remove()},
    k(){const o=document.createElement('div'),h=document.querySelector('.game-header');o.className='welcome-screen game-over-overlay';o.innerHTML=`<div class="welcome-logo-container"><img src="assets/img/logo.webp" alt="Smart Snake" class="welcome-logo"><div class="game-over-text">Game Over!</div><div class="game-over-score">Final Score: ${this.s.o}</div><button id="welcomeStartBtn" title="Restart Game">▶️</button></div>`;h&&(h.style.opacity='0');document.getElementById('gameContainer').appendChild(o);o.querySelector('#welcomeStartBtn').onclick=()=>{o.classList.add('hidden');h&&(h.style.opacity='1');setTimeout(()=>o.remove(),500);this.e();this.s.v=3;this.s.r=1;this.q()}},
    H(){['hearts','score','levelNumber'].map(i=>{const e=document.getElementById(i);e&&(e.textContent=i=='hearts'?'❤'.repeat(this.s.v):i=='score'?this.s.o:this.s.l)})},
    t(){if(this.s.r)return;this.h();this.e();this.s.r=1;this.s.p=0;this.lastTime=performance.now();this.q()},
    setSpeed(v){G$.s=v;this.v=150-v*20},
    w() {
        console.log('Creating welcome screen');
        const c = document.getElementById('gameContainer');
        if (!c) {
            console.error('No container found');
            return;
        }
        
        // Remove any existing welcome screens first
        c.querySelectorAll('.welcome-screen').forEach(e => e.remove());
        
        // Create new welcome screen
        const w = document.createElement('div');
        w.className = 'welcome-screen';
        w.style.opacity = '0'; // Start invisible
        w.innerHTML = `
            <div class="welcome-logo-container">
                <img src="assets/img/logo.webp" alt="Smart Snake" class="welcome-logo">
                <button id="welcomeStartBtn" title="Start Game">▶️</button>
            </div>
        `;
        
        // Add to DOM and force reflow
        c.appendChild(w);
        w.offsetHeight; // Force reflow
        
        // Make visible with animation
        requestAnimationFrame(() => {
            w.style.transition = 'opacity 0.3s ease';
            w.style.opacity = '1';
        });
        
        const startBtn = w.querySelector('#welcomeStartBtn');
        startBtn.onclick = () => {
            if (G$.l) return;
            console.log('Game starting...');
            w.classList.add('hidden');
            const h = document.querySelector('.game-header');
            const n = document.querySelector('.controls');
            h?.classList.add('visible');
            n?.classList.add('visible');
            
            setTimeout(() => {
                w.remove();
                this.e();
                this.s.r = 1;
                this.s.p = 0;
                this.lastTime = performance.now();
                this.deltaAccumulator = 0;
                this.H();
                this.q();
                console.log('Game started');
            }, 500);
        };
    }
});

// Fix initialization function
async function I() {
    try {
        console.log('Starting initialization...');
        const c = document.getElementById('gameContainer');
        if (!c) {
            console.error('No game container found');
            return;
        }
        
        c.classList.add('loading');
        G$.c = document.getElementById('gameCanvas');
        G$.x = G$.c.getContext('2d');
        G$.c.width = G$.c.height = G$.t * G$.n;
        
        await Promise.all([
            S.init(),
            G.init()
        ]);
        
        // Setup UI once
        U();
        
        c.classList.remove('loading');
        G$.l = 0;
        
        // Show welcome screen with delay
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                G.w();
            });
        });
        
        console.log('Initialization complete');
    } catch (e) {
        console.error('Initialization failed:', e);
        G$.l = 0;
        document.querySelector('.game-header')?.classList.add('visible');
        document.querySelector('.controls')?.classList.add('visible');
    }
}

w.S = {S, R, G};

const T = {x:0, y:0, t:30, m(e,g){
    if(!g.s.r || g.s.a) return;
    const X = e.touches[0].clientX - this.x,
          Y = e.touches[0].clientY - this.y,
          d = g.s.d;
    Math.abs(X) > Math.abs(Y) && Math.abs(X) > this.t
        ? g.s.x = X > 0 && d != 'l' ? 'r' : X < 0 && d != 'r' ? 'l' : d
        : Math.abs(Y) > this.t && (g.s.x = Y > 0 && d != 'u' ? 'd' : Y < 0 && d != 'd' ? 'u' : d);
}};

// Initialize on DOM load
addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting game...');
    setTimeout(I, 100);
});

// Add high score persistence
// Implement proper level progression
// Add power-ups system
// Improve mobile controls

// Use WebWorker for game logic
// Implement sprite batching
// Add asset preloading
// Optimize collision detection
