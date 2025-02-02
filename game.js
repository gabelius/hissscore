const C={T:20,A:['c.wav','p.wav','d.wav','h.wav','g.wav']},w=window,G$={c:null,x:null,t:C.T,n:C.T,l:1,i:0,m:localStorage.getItem('m')!='0',a:null,g:null,u:{i:new Map,s:new Map},h:'light',s:1};w.GAME=G$;
const S={b:new Map,init:_=>Promise.resolve(),async ia(){if(G$.i)return;try{const c=new(w.AudioContext||w.webkitAudioContext)();c.state==='suspended'&&await c.resume();G$.a=c;G$.g=c.createGain();G$.g.connect(c.destination);G$.g.gain.value=G$.m?0:1;await Promise.race([Promise.all(C.A.map((p,i)=>this.l(i,`assets/audio/${p}`))),new Promise((_,r)=>setTimeout(r,5e3))]);G$.i=1}catch(e){G$.i=0}},async l(k,p,r=3){while(r--)try{this.b.set(k,await G$.a.decodeAudioData(await(await fetch(p)).arrayBuffer()));return}catch{await new Promise(r=>setTimeout(r,500))}this.b.set(k,G$.a.createBuffer(2,44100,44100))},p(s){if(!G$.a||!this.b.has(s))return;try{const x=G$.a.createBufferSource();x.buffer=this.b.get(s);x.connect(G$.g);x.start()}catch{}}};
const R={l:0,d(s=G.s){const{x:c,t}=G$,m=t-2;this.l?this.l.n.concat(this.l.f?[this.l.f]:[]).map(p=>c.clearRect(p.x*t,p.y*t,t,t)):c.clearRect(0,0,c.canvas.width,c.canvas.height);s.n.map((g,i)=>{c.fillStyle=i?'#81C784':'#4CAF50';c.fillRect(g.x*t,g.y*t,m,m)});s.f&&(c.fillStyle='#FF5252',c.fillRect(s.f.x*t,s.f.y*t,m,m));this.l={...s}}};

G={
    s:{r:0,p:0,a:0,o:0,l:1,v:3,n:[],f:0,d:'r',x:'r'},
    f:0,t:0,d:0,v:150,
    init(){this.e();return Promise.resolve()},
    e(){
        this.v=150;
        this.d=0;
        this.t=performance.now();
        this.deltaAccumulator=0;
        Object.assign(this.s,{r:0,p:0,a:0,o:0,l:1,v:3,n:[{x:10,y:10}],f:null,d:'r',x:'r'});
        this.s.f=this.f()
    },
    q(){if(!this.s.r||this.s.p)return;const now=performance.now();this.deltaTime=Math.min(now-this.lastTime,32);this.lastTime=now;this.u();R.d(this.s);requestAnimationFrame(()=>this.q())},
    u(){const s=this.s,h={...s.n[0]};if(!s.r||s.p)return;({u:_=>h.y--,d:_=>h.y++,l:_=>h.x--,r:_=>h.x++})[s.d]();if(this.c(h)){S.p(3);this.i();return}h.x===s.f.x&&h.y===s.f.y?(s.o+=10,s.f=this.f(),S.p(0)):s.n.pop();s.n.unshift(h);s.d=s.x;this.H()},
    c:h=>h.x<0||h.x>=G$.n||h.y<0||h.y>=G$.n||G.s.n.some(s=>s.x==h.x&&s.y==h.y),i(){if(this.r)return;this.r=1;this.s.v--;S.p(2);this.s.r=0;this.s.v>0?setTimeout(()=>{this.e();this.t=0;this.s.r=1;this.r=0;this.q()},1e3):this.j()},
    j(){this.s.r=this.s.p=1;S.p(4);this.k()},
    f(){let f;do f={x:~~(Math.random()*G$.n),y:~~(Math.random()*G$.n)};while(this.s.n.some(s=>s.x==f.x&&s.y==f.y));return f},
    h(){document.querySelector('.game-over-overlay')?.remove()},
    k(){const o=document.createElement('div'),h=document.querySelector('.game-header');o.className='welcome-screen game-over-overlay';o.innerHTML=`<div class="welcome-logo-container"><img src="assets/img/logo.webp" alt="Smart Snake" class="welcome-logo"><div class="game-over-text">Game Over!</div><div class="game-over-score">Final Score: ${this.s.o}</div><button id="welcomeStartBtn" title="Restart Game">▶️</button></div>`;h&&(h.style.opacity='0');document.getElementById('gameContainer').appendChild(o);o.querySelector('#welcomeStartBtn').onclick=()=>{o.classList.add('hidden');h&&(h.style.opacity='1');setTimeout(()=>o.remove(),500);this.e();this.s.v=3;this.s.r=1;this.q()}},
    H(){['hearts','score','levelNumber'].map(i=>{const e=document.getElementById(i);e&&(e.textContent=i=='hearts'?'❤'.repeat(this.s.v):i=='score'?this.s.o:this.s.l)})},
    t(){if(this.s.r)return;this.h();this.e();this.s.r=1;this.s.p=0;this.lastTime=performance.now();this.q()},
    setSpeed(v){G$.s=v;this.v=150-v*20},
    w(){
        const c=document.getElementById('gameContainer');
        if(!c)return;
        const h=document.querySelector('.game-header');
        const n=document.querySelector('.controls');
        h?.classList.remove('visible');
        n?.classList.remove('visible');
        const w=document.createElement('div');
        w.className='welcome-screen';
        w.innerHTML='<div class="welcome-logo-container"><img src="assets/img/logo.webp" alt="Smart Snake" class="welcome-logo"><button id="welcomeStartBtn" title="Start Game">▶️</button></div>';
        c.querySelectorAll('.welcome-screen').forEach(e=>e.remove());
        c.appendChild(w);
        w.querySelector('#welcomeStartBtn').onclick=()=>{
            if(G$.l)return;
            w.classList.add('hidden');
            h?.classList.add('visible');
            n?.classList.add('visible');
            setTimeout(()=>{
                w.remove();
                this.e();
                this.s.r=1;
                this.s.p=0;
                this.lastTime=performance.now();
                this.deltaAccumulator=0;
                this.H();
                this.q()
            },500)
        }
    }
};

async function I() {
    try {
        const c = document.getElementById('gameContainer');
        if (!c) return;
        
        c.classList.add('loading');
        G$.c = document.getElementById('gameCanvas');
        G$.x = G$.c.getContext('2d');
        G$.c.width = G$.c.height = G$.t * G$.n;
        
        await Promise.all([
            S.init(),
            G.init()
        ]);
        
        U(); // Setup controls
        c.classList.remove('loading');
        G$.l = 0; // Reset loading state
        G.w(); // Show welcome screen
    } catch (e) {
        console.error('Initialization failed:', e);
    }
}

w.S={S,R,G};const T={x:0,y:0,t:30,m(e,g){if(!g.s.r||g.s.a)return;const X=e.touches[0].clientX-this.x,Y=e.touches[0].clientY-this.y,d=g.s.d;Math.abs(X)>Math.abs(Y)&&Math.abs(X)>this.t?g.s.x=X>0&&d!='l'?'r':X<0&&d!='r'?'l':d:Math.abs(Y)>this.t&&(g.s.x=Y>0&&d!='u'?'d':Y<0&&d!='d'?'u':d)}};
addEventListener('DOMContentLoaded',()=>setTimeout(I,100));
