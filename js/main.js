/* main.js
   Implements features 1-10:
   - typed hero, particles, reactive glow
   - intersection reveal & mood transitions
   - magnetic buttons, tilt cards
   - horizontal project rail + modal
   - custom cursor, theme switcher
   - progress bar + simple badge unlock
   - timeline node movement
   - chat-style contact
*/

// small helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---- Theme & initial state
const body = document.body;
const savedTheme = localStorage.getItem('site-theme') || 'dark';
applyTheme(savedTheme);

// update footer year
$('#year').textContent = new Date().getFullYear();

// ---- 1) Typing effect (Hero)
(function typing(){
  const el = $('#typed');
  const words = ['FullStack Developer', 'Learner', 'Problem Solver', 'Performance-minded'];
  let wi = 0, ci = 0, deleting = false;
  function tick(){
    const w = words[wi];
    if(!deleting){
      el.textContent = w.slice(0, ++ci) + '▌';
      if(ci === w.length){ deleting = true; setTimeout(tick, 900); return; }
    } else {
      el.textContent = w.slice(0, --ci) + '▌';
      if(ci === 0){ deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, deleting ? 40 : 90);
  }
  tick();
})();

// ---- 2) Particles + reactive hero glow
(function particles(){
  const canvas = $('#particleCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize(){ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize);
  resize();
  for(let i=0;i<70;i++){
    particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, r: Math.random()*1.8+0.6 });
  }
  function frame(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();

  // reactive glow: update CSS variables from pointer
  const hero = $('#hero');
  hero && hero.addEventListener('pointermove', (e) => {
    hero.style.setProperty('--mx', e.clientX + 'px');
    hero.style.setProperty('--my', e.clientY + 'px');
  });
})();

// ---- 3) Intersection reveal + mood transitions
(function revealAndMood(){
  const reveals = $$('.reveal');
  const io = new IntersectionObserver((items)=>{
    items.forEach(it=>{
      if(it.isIntersecting){
        it.target.classList.add('in-view');
        // set mood by section (simple mapping)
        const sec = it.target.closest('section');
        if(sec && sec.id){
          switch(sec.id){
            case 'hero': body.classList.remove('theme-light'); body.classList.add('theme-hero'); break;
            case 'about': body.classList.remove('theme-light'); body.classList.add('theme-about'); break;
            case 'projects': body.classList.remove('theme-light'); body.classList.add('theme-projects'); break;
            case 'contact': body.classList.remove('theme-light'); body.classList.add('theme-contact'); break;
          }
        }
      }
    });
  }, {threshold:0.2});
  reveals.forEach(r => io.observe(r));
})();

// ---- 4) Magnetic CTAs + tilt on project cards
(function microInteractions(){
  // magnetic buttons
  $$('.magnetic').forEach(btn=>{
    btn.addEventListener('pointermove', (e)=>{
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
      const dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
      btn.style.transform = `translate(${dx*6}px, ${dy*6}px)`;
    });
    btn.addEventListener('pointerleave', ()=> btn.style.transform = '');
  });

  // tilt cards
  $$('.proj').forEach(card=>{
    card.addEventListener('pointermove', (e)=>{
      const r = card.getBoundingClientRect();
      const rx = - (e.clientY - r.top - r.height/2) / 22;
      const ry = (e.clientX - r.left - r.width/2) / 22;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      card.style.transition = 'transform 0.08s linear';
    });
    card.addEventListener('pointerleave', ()=>{
      card.style.transform = '';
      card.style.transition = 'transform 260ms ease';
    });
  });
})();

// ---- 5) Projects rail horizontal scroll by wheel + keyboard nav + open case study modal
(function projectsRail(){
  const rail = $('#projectsRail');
  if(!rail) return;
  rail.addEventListener('wheel', (e)=>{
    if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      e.preventDefault();
      rail.scrollLeft += e.deltaY;
    }
  }, {passive:false});

  // keyboard navigation left/right
  rail.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') rail.scrollLeft += 320;
    if(e.key === 'ArrowLeft') rail.scrollLeft -= 320;
  });

  // modal open
  const modal = $('#caseModal');
  const title = $('#caseTitle');
  const content = $('#caseContent');
  const openBtns = $$('.openCase');
  openBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const card = btn.closest('.proj');
      const t = card.dataset.title || card.querySelector('h3').innerText;
      title.textContent = t;
      content.textContent = "Quick case study: goals, constraints, approach, and outcomes. This modal shows the core details in a digestible format. Replace with your project's real content.";
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    });
  });

  $('#closeCase').addEventListener('click', () => {
    const modal = $('#caseModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  });
  // close on backdrop click
  $('#caseModal').addEventListener('click', (e) => {
    if(e.target === $('#caseModal')) $('#closeCase').click();
  });
})();

// ---- 6) Custom cursor behaviour
(function cursor(){
  const cur = $('#cursor');
  if(!cur) return;
  document.addEventListener('pointermove', (e)=> {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  });

  const hoverTargets = ['a', 'button', '.proj'];
  hoverTargets.forEach(sel=>{
    document.addEventListener('pointerover', (e)=>{
      if(e.target.closest(sel)) cur.classList.add('grow');
    });
    document.addEventListener('pointerout', (e)=>{
      if(e.target.closest(sel)) cur.classList.remove('grow');
    });
  });
})();

// ---- 7) Theme toggle (dark <-> light)
(function themeToggle(){
  const toggle = $('#themeToggle');
  toggle.addEventListener('click', ()=>{
    const isLight = body.classList.toggle('theme-light');
    localStorage.setItem('site-theme', isLight ? 'light' : 'dark');
    toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  });
})();

// ---- 8) Scroll progress + simple badge unlocks
(function progressAndBadges(){
  const progress = $('#progress');
  const badgesKey = 'portfolio-badges';
  function onScroll(){
    const doc = document.documentElement;
    const p = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
    progress.style.transform = `scaleX(${p})`;
    // unlock simple badges at 25%, 50%, 80%
    const unlocked = JSON.parse(localStorage.getItem(badgesKey) || "[]");
    const milestones = [{p:.25,id:'scrolled-25'},{p:.5,id:'scrolled-50'},{p:.8,id:'scrolled-80'}];
    milestones.forEach(m=>{
      if(p >= m.p && !unlocked.includes(m.id)){
        unlocked.push(m.id);
        localStorage.setItem(badgesKey, JSON.stringify(unlocked));
        // small visual: briefly flash title
        const flash = document.createElement('div');
        flash.textContent = "Badge unlocked!";
        flash.style.position = 'fixed'; flash.style.right = '18px'; flash.style.top = '18px';
        flash.style.background = 'linear-gradient(135deg,var(--accent1),var(--accent2))'; flash.style.color='#021224';
        flash.style.padding = '8px 12px'; flash.style.borderRadius = '10px'; flash.style.boxShadow = 'var(--shadow)';
        document.body.appendChild(flash);
        setTimeout(()=> flash.remove(), 1600);
      }
    });
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// ---- 9) Timeline node position follow
(function timelineNode(){
  const about = $('#about');
  const node = $('#timelineNode');
  const path = $('#timelinePath');
  if(!about || !node || !path) return;
  function moveNode(){
    const r = about.getBoundingClientRect();
    const total = r.height || 500;
    const visible = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (r.height + window.innerHeight)));
    const svgH = 600; // viewBox height
    const y = visible * (svgH - 20);
    node.style.top = (y) + 'px';
  }
  document.addEventListener('scroll', moveNode, {passive:true});
  window.addEventListener('resize', moveNode);
  moveNode();
})();

// ---- 10) Chat-style contact flow (no backend by default; can wire to Formspree)
(function chatForm(){
  const form = $('#chatForm');
  const input = $('#chatInput');
  let step = 0, name='', email='', message='';
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const val = input.value.trim();
    if(!val) return;
    if(step === 0){
      name = val;
      $('#respName').textContent = name; $('#respName').hidden = false;
      $('#qEmail').hidden = false;
      step = 1;
    } else if(step === 1){
      email = val;
      $('#respEmail').textContent = email; $('#respEmail').hidden = false;
      $('#qMsg').hidden = false;
      step = 2;
    } else {
      message = val;
      $('#respMsg').textContent = message; $('#respMsg').hidden = false;
      input.disabled = true;
      form.querySelector('button[type="submit"]').disabled = true;
      // TODO: wire to real backend. For now show confirmation:
      setTimeout(()=> alert('Thanks — message recorded locally. Replace with Formspree/Netlify to receive emails.'), 200);
    }
    input.value = '';
  });
})();

/* ---- Utility: apply initial theme (dark/light) ---- */
function applyTheme(mode){
  if(mode === 'light'){
    body.classList.add('theme-light');
    body.classList.remove('theme-dark');
  } else {
    body.classList.remove('theme-light');
  }
  localStorage.setItem('site-theme', mode);
}
