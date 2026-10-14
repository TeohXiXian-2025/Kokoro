/* Kokoro pitch deck: navigation, voices, and the interactive solution slides. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const { DEFS, Avatar, Stage3D } = window.Kokoro3D;
  const ORDER = ['bottle', 'glasses', 'bag', 'pencil'];

  /* ================= SVG library ================= */
  const face = (cx, cy, g, s = 1) => `
    <ellipse cx="${cx - g}" cy="${cy}" rx="${4 * s}" ry="${5 * s}" fill="#2b2140"/><ellipse cx="${cx + g}" cy="${cy}" rx="${4 * s}" ry="${5 * s}" fill="#2b2140"/>
    <circle cx="${cx - g + 1.3 * s}" cy="${cy - 1.8 * s}" r="${1.4 * s}" fill="#fff"/><circle cx="${cx + g + 1.3 * s}" cy="${cy - 1.8 * s}" r="${1.4 * s}" fill="#fff"/>
    <ellipse cx="${cx - g - 7 * s}" cy="${cy + 6 * s}" rx="${4.5 * s}" ry="${2.6 * s}" fill="#ff7f9f" opacity=".55"/><ellipse cx="${cx + g + 7 * s}" cy="${cy + 6 * s}" rx="${4.5 * s}" ry="${2.6 * s}" fill="#ff7f9f" opacity=".55"/>
    <path d="M${cx - 3.5 * s} ${cy + 6 * s} Q${cx} ${cy + 9.5 * s} ${cx + 3.5 * s} ${cy + 6 * s}" stroke="#2b2140" stroke-width="${1.8 * s}" fill="none" stroke-linecap="round"/>`;

  let svgUid = 0;
  const SVG = {
    mizuki: (u = 'mz' + (++svgUid)) => `<svg viewBox="0 0 120 120"><defs><clipPath id="${u}"><circle cx="60" cy="60" r="58"/></clipPath></defs>
      <g clip-path="url(#${u})"><circle cx="60" cy="60" r="58" fill="#ffe4ec"/>
      <path d="M22 64 C20 30 40 16 60 16 C80 16 100 30 98 64 L98 96 L22 96 Z" fill="#2f2440"/>
      <rect x="54" y="80" width="12" height="14" fill="#f6d2bd"/>
      <path d="M26 122 C26 100 42 90 60 90 C78 90 94 100 94 122 Z" fill="#2f3f73"/>
      <path d="M44 91 L60 108 L76 91 Z" fill="#fff"/><path d="M51 104 L60 110 L69 104 L65 115 L55 115 Z" fill="#e0567a"/>
      <ellipse cx="60" cy="60" rx="28" ry="27" fill="#fde3d3"/>
      <path d="M31 58 C33 34 49 28 60 28 C73 28 88 34 89 58 C81 47 75 43 67 40 C64 48 55 50 47 46 C43 51 37 55 31 58 Z" fill="#2f2440"/>
      <ellipse cx="49" cy="64" rx="3.6" ry="4.8" fill="#2b2140"/><ellipse cx="71" cy="64" rx="3.6" ry="4.8" fill="#2b2140"/>
      <circle cx="50.3" cy="62.2" r="1.3" fill="#fff"/><circle cx="72.3" cy="62.2" r="1.3" fill="#fff"/>
      <ellipse cx="42" cy="72" rx="5" ry="3" fill="#ff9fb6" opacity=".6"/><ellipse cx="78" cy="72" rx="5" ry="3" fill="#ff9fb6" opacity=".6"/>
      <path d="M56 75 Q60 78 64 75" stroke="#a04a5a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="74" y="35" width="11" height="4.5" rx="2.2" fill="#ffd36e" transform="rotate(-22 79 37)"/></g></svg>`,

    'mini-bottle': () => `<svg viewBox="0 0 100 100"><rect x="31" y="24" width="38" height="68" rx="18" fill="#9ad8ff"/><rect x="31" y="68" width="38" height="11" fill="#fff"/><rect x="36" y="12" width="28" height="15" rx="5" fill="#ff9fb6"/>${face(50, 46, 8)}</svg>`,
    'mini-glasses': () => `<svg viewBox="0 0 100 100"><path d="M50 26 L50 16" stroke="#3fa66b" stroke-width="3"/><ellipse cx="44" cy="15" rx="7" ry="3.5" fill="#6fd6a0"/><ellipse cx="56" cy="15" rx="7" ry="3.5" fill="#6fd6a0"/><ellipse cx="50" cy="58" rx="36" ry="33" fill="#c9b6ff"/>${face(50, 55, 12)}<circle cx="38" cy="55" r="10" fill="rgba(255,255,255,.25)" stroke="#4a3b7a" stroke-width="3"/><circle cx="62" cy="55" r="10" fill="rgba(255,255,255,.25)" stroke="#4a3b7a" stroke-width="3"/><path d="M48 53 Q50 50 52 53" stroke="#4a3b7a" stroke-width="2.5" fill="none"/></svg>`,
    'mini-bag': () => `<svg viewBox="0 0 100 100"><path d="M38 28 Q50 12 62 28" stroke="#e9605a" stroke-width="5" fill="none"/><rect x="16" y="26" width="68" height="64" rx="16" fill="#ff8a80"/><path d="M16 42 Q16 26 32 26 L68 26 Q84 26 84 42 L84 52 Q84 58 78 58 L22 58 Q16 58 16 52Z" fill="#e9605a"/><circle cx="50" cy="56" r="4" fill="#ffd36e"/>${face(50, 72, 11)}</svg>`,
    'mini-pencil': () => `<svg viewBox="0 0 100 100"><g transform="rotate(-30 70 34)"><rect x="64" y="14" width="9" height="34" fill="#6fd6b0"/><polygon points="64,14 73,14 68.5,5" fill="#f5d9b0"/></g><rect x="8" y="38" width="84" height="46" rx="23" fill="#ffd36e"/><path d="M24 41 L76 41" stroke="#d99a2b" stroke-width="2.5"/>${face(50, 61, 11)}</svg>`,

    'photo-bottle': () => `<svg viewBox="0 0 200 340"><defs>
      <linearGradient id="pb1" x1="0" x2="1"><stop offset="0" stop-color="#6fb6e6"/><stop offset=".35" stop-color="#c4e8ff"/><stop offset="1" stop-color="#4a95cc"/></linearGradient>
      <linearGradient id="pb2" x1="0" x2="1"><stop offset="0" stop-color="#f27d9c"/><stop offset=".4" stop-color="#ffc6d4"/><stop offset="1" stop-color="#d7607f"/></linearGradient></defs>
      <ellipse cx="100" cy="331" rx="62" ry="7" fill="rgba(0,0,0,.2)"/>
      <rect x="50" y="78" width="100" height="252" rx="36" fill="url(#pb1)"/>
      <rect x="50" y="220" width="100" height="56" fill="#fff" opacity=".92"/>
      <path d="M100 234 C92 247 90 254 100 262 C110 254 108 247 100 234Z" fill="#4aa8ec"/>
      <rect x="62" y="30" width="76" height="58" rx="14" fill="url(#pb2)"/>
      <rect x="84" y="10" width="32" height="28" rx="13" fill="none" stroke="#d7607f" stroke-width="8"/>
      <rect x="64" y="100" width="12" height="110" rx="6" fill="#fff" opacity=".5"/></svg>`,
    'photo-glasses': () => `<svg viewBox="0 0 200 340">
      <ellipse cx="100" cy="320" rx="92" ry="10" fill="rgba(0,0,0,.16)"/>
      <path d="M24 262 L6 218" stroke="#4a3b7a" stroke-width="7" stroke-linecap="round"/><path d="M176 262 L194 218" stroke="#4a3b7a" stroke-width="7" stroke-linecap="round"/>
      <circle cx="58" cy="274" r="38" fill="rgba(200,230,255,.5)" stroke="#4a3b7a" stroke-width="8"/><circle cx="142" cy="274" r="38" fill="rgba(200,230,255,.5)" stroke="#4a3b7a" stroke-width="8"/>
      <path d="M92 266 Q100 254 108 266" stroke="#4a3b7a" stroke-width="7" fill="none"/>
      <path d="M38 258 Q46 247 60 245" stroke="#fff" stroke-width="5" opacity=".85" fill="none" stroke-linecap="round"/><path d="M122 258 Q130 247 144 245" stroke="#fff" stroke-width="5" opacity=".85" fill="none" stroke-linecap="round"/></svg>`,
    'photo-bag': () => `<svg viewBox="0 0 200 340"><defs><linearGradient id="bg1" x1="0" x2="1"><stop offset="0" stop-color="#e86b63"/><stop offset=".4" stop-color="#ff9a90"/><stop offset="1" stop-color="#c94f48"/></linearGradient></defs>
      <ellipse cx="100" cy="331" rx="82" ry="8" fill="rgba(0,0,0,.2)"/>
      <path d="M66 118 C66 74 134 74 134 118" stroke="#b84a44" stroke-width="12" fill="none"/>
      <rect x="26" y="108" width="148" height="222" rx="28" fill="url(#bg1)"/>
      <path d="M26 136 Q26 108 54 108 L146 108 Q174 108 174 136 L174 198 Q174 212 160 212 L40 212 Q26 212 26 198Z" fill="#c94f48"/>
      <rect x="88" y="198" width="24" height="28" rx="6" fill="#ffd36e"/>
      <rect x="52" y="246" width="96" height="58" rx="14" fill="rgba(0,0,0,.09)"/>
      <path d="M150 212 L156 240" stroke="#9a8fb5" stroke-width="2"/><circle cx="157" cy="248" r="10" fill="#ff8fab"/></svg>`,
    'photo-pencil': () => `<svg viewBox="0 0 200 340"><defs><linearGradient id="pc1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#e6b23c"/></linearGradient></defs>
      <ellipse cx="100" cy="330" rx="90" ry="8" fill="rgba(0,0,0,.2)"/>
      <g transform="rotate(28 128 245)"><rect x="120" y="160" width="16" height="96" fill="#6fd6b0"/><polygon points="120,160 136,160 128,138" fill="#f5d9b0"/><polygon points="125.5,146 130.5,146 128,138" fill="#2b2140"/></g>
      <rect x="16" y="238" width="168" height="88" rx="44" fill="url(#pc1)"/>
      <path d="M40 251 L158 251" stroke="#c98a1d" stroke-width="4" stroke-dasharray="4 3"/>
      <circle cx="166" cy="251" r="7" fill="none" stroke="#ff8fab" stroke-width="4"/></svg>`,
  };
  function fillSvgs() {
    $$('[data-svg]').forEach(el => { el.innerHTML = SVG[el.dataset.svg](); });
    $$('[data-svg-row]').forEach(el => { el.innerHTML = ORDER.map(id => `<div>${SVG['mini-' + id]()}</div>`).join(''); });
  }

  /* ================= Voices (Web Speech API, offline OS voices) ================= */
  const Voice = {
    ok: 'speechSynthesis' in window, muted: false, voices: [], speaking: 0,
    init() {
      if (!this.ok) return;
      const load = () => { this.voices = speechSynthesis.getVoices(); };
      load(); speechSynthesis.onvoiceschanged = load;
    },
    pick(kind) {
      const en = this.voices.filter(v => /^en/i.test(v.lang));
      const by = re => en.find(v => re.test(v.name));
      if (kind === 'male') return by(/guy|davis|andrew|david|mark|ryan|christopher|daniel|male/i) || en[0];
      if (kind === 'child') return by(/ana online|ana\b/i) || by(/aria|jenny|zira|samantha|libby|sonia|female|google us english/i) || en[0];
      return by(/jenny|aria|ava|emma|zira|samantha|libby|sonia|female|google us english/i) || en[0];
    },
    say(text, who = 'mizuki') {
      return new Promise(res => {
        let p = 1, r = 1, kind = 'female';
        if (who === 'mizuki') { p = 1.2; r = 0.95; }
        else if (who === 'teacher') { p = 0.95; r = 0.95; kind = 'male'; }
        else if (typeof who === 'object') { p = who.pitch; r = who.rate; kind = 'child'; }
        const est = 700 + text.length * 62;
        let done = false;
        const fin = () => { if (done) return; done = true; clearTimeout(to); this.speaking = Math.max(0, this.speaking - 1); res(); };
        this.speaking++;
        const silent = this.muted || !this.ok || !this.voices.length;
        const to = setTimeout(fin, silent ? est : est + 4000);
        if (silent) return;
        const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?'’…:-]/gu, ''));
        u.voice = this.pick(kind); u.pitch = p; u.rate = r;
        u.onend = fin; u.onerror = fin;
        speechSynthesis.speak(u);
      });
    },
    stop() { if (this.ok) speechSynthesis.cancel(); this.speaking = 0; },
  };
  Voice.init();

  // Each slide change bumps SEQ so running scripted sequences stop cleanly.
  let SEQ = 0;
  const alive = tok => tok === SEQ;
  function cancelSeq() { SEQ++; Voice.stop(); }

  async function mizukiSay(el, text, tok) {
    el.textContent = text; el.classList.add('show');
    clearTimeout(el._t);
    await Voice.say(text, 'mizuki');
    el._t = setTimeout(() => el.classList.remove('show'), alive(tok) ? 2200 : 0);
  }
  async function avSay(stage, av, text, tok, cls = '', hold = 1800) {
    const b = stage.bubble(av, text, 0, cls);
    av.setTalking(true);
    await Voice.say(text, av.def);
    av.setTalking(false);
    clearTimeout(b._t);
    b._t = setTimeout(() => b.classList.remove('show'), alive(tok) ? hold : 0);
  }
  const POKES = ['Hehe! That tickles!', 'Boop! Hi Mizuki!', "I'm right here!", 'Hello hello!', 'Again! Again!'];
  function pokeReact(stage, av, line) {
    const text = line || POKES[(Math.random() * POKES.length) | 0];
    stage.bubble(av, text, 1600);
    if (!Voice.speaking) { av.setTalking(true); Voice.say(text, av.def).then(() => av.setTalking(false)); }
  }

  /* ================= Deck navigation ================= */
  const stageEl = $('#stage');
  const slides = $$('.slide');
  const hooks = {};
  let cur = -1;
  function fit() { stageEl.style.setProperty('--s', Math.min(innerWidth / 1600, innerHeight / 900)); }
  addEventListener('resize', fit); fit();

  function go(i, showAllSteps = false) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) { slides[cur].classList.remove('active'); hooks[slides[cur].id]?.leave?.(); }
    cancelSeq();
    const back = i < cur;
    cur = i;
    const s = slides[i];
    $$('.step', s).forEach(st => st.classList.toggle('shown', back || showAllSteps));
    s.classList.add('active');
    hooks[s.id]?.enter?.();
    $$('#dots i').forEach((d, k) => d.classList.toggle('on', k === i));
    renderNotes();
    history.replaceState(null, '', '#' + (i + 1));
  }
  function next() {
    const hidden = $$('.step:not(.shown)', slides[cur]);
    if (hidden.length) { hidden[0].classList.add('shown'); return; }
    go(cur + 1);
  }
  function prev() { go(cur - 1); }

  $('#dots').innerHTML = slides.map(() => '<i></i>').join('');
  $$('#dots i').forEach((d, k) => d.addEventListener('click', () => go(k, true)));
  $('#prevBtn').onclick = prev; $('#nextBtn').onclick = next;
  $('#s-open').addEventListener('click', next);

  const muteBtn = $('#muteBtn');
  function toggleMute() { Voice.muted = !Voice.muted; if (Voice.muted) Voice.stop(); muteBtn.textContent = Voice.muted ? '🔇' : '🔊'; }
  muteBtn.onclick = toggleMute;
  function toggleFs() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
  $('#fsBtn').onclick = toggleFs;

  // speaker notes + pitch timer
  const notes = $('#notes');
  let t0 = Date.now();
  function renderNotes() {
    const s = slides[cur];
    const k = $('.kicker', s);
    $('#nTitle').textContent = `${cur + 1}/${slides.length} · ${k ? k.textContent : (cur === 0 ? 'Cold open' : 'Tagline')}`;
    $('#nBody').textContent = s.dataset.notes || '';
  }
  $('#notesBtn').onclick = () => notes.classList.toggle('show');
  $('#nReset').onclick = () => { t0 = Date.now(); };
  setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    const el = $('#nTimer');
    el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} / 05:00`;
    el.style.color = s > 300 ? '#ff8fab' : '#fff';
  }, 500);

  addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'ArrowDown'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'n' || k === 'N') notes.classList.toggle('show');
    else if (k === 'm' || k === 'M') toggleMute();
    else if (k === 'f' || k === 'F') toggleFs();
  });
  // keep clicked buttons from swallowing the space bar
  document.addEventListener('click', e => { if (e.target.closest('button')) e.target.closest('button').blur(); });

  /* ================= 1 · Problem: count-ups ================= */
  function fmtCount(v, f) {
    if (f === 'k') return Math.round(v / 1000) + 'k';
    if (f === 'M') return v.toFixed(2) + 'M';
    if (f === '%') return Math.round(v) + '%';
    return Math.round(v).toLocaleString('en-US');
  }
  hooks['s-problem'] = {
    enter() {
      $$('#s-problem [data-count]').forEach((el, i) => {
        const to = parseFloat(el.dataset.count), f = el.dataset.fmt; const t0 = performance.now() + i * 180;
        const tick = (now) => {
          const k = Math.min(1, Math.max(0, (now - t0) / 1400)), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmtCount(to * e, f);
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
  };

  /* ================= 3 · Summon (photo → 3D companion) ================= */
  const INTRO = {
    bottle: "Hi Mizuki! I'm Mizu. I'll look after your body: water, sleep and energy!",
    glasses: "I'm Megane! Let's study together. But no pushing too hard, okay?",
    bag: 'Kaban here! I walk with you to school, every single day.',
    pencil: "I'm Fude-pon! Tell me about your friends. I love stories!",
  };
  const SUMMON_CHAT = {
    bottle: ['Are you… really my water bottle?', "Yup! I've ridden in your bag every day. Now I can finally say hi!"],
    glasses: ['You can talk too?', "I've seen everything you've read. Let's take it easy together, okay?"],
    bag: 'My bag feels… really heavy today.|Heavy, huh? Want to tell me what is inside? I am listening.'.split('|'),
    pencil: ['Lunch was kind of lonely today.', 'Then sit with me! Tell me about your day. You are not alone.'],
  };
  const S = { stage: null, av: {}, captured: [], sel: 'bottle', busy: false, last: null, talking: false };
  const SLOTX = [-3.6, -1.2, 1.2, 3.7];
  function initSummon() {
    S.stage = new Stage3D($('#summonCanvas'), $('#summonOverlay'), {
      r: 13, phi: 1.36, target: [0, 1.05, 0], fov: 30, ground: false, autoSway: true,
      onPoke: av => { S.last = av; showCard(av); pokeReact(S.stage, av); },
      onDrag: av => { S.last = av; showCard(av); pokeReact(S.stage, av, 'Whoa, where are we going?'); },
      onSpin: av => pokeReact(S.stage, av, 'Wheee~ I’m dizzy!'),
    });
    ORDER.forEach((id, i) => {
      const av = new Avatar(id);
      S.stage.add(av, SLOTX[i], 0, -SLOTX[i] * 0.07);
      av.root.visible = false;
      S.av[id] = av;
    });
    $('#objChips').innerHTML = ORDER.map(id => `<button class="chip" data-id="${id}">${SVG['mini-' + id]().replace('<svg', '<svg width="26" height="26"')} ${DEFS[id].object}</button>`).join('');
    $$('#objChips .chip').forEach(c => c.addEventListener('click', () => selectObj(c.dataset.id)));
    $('#shutter').addEventListener('click', capture);
    $('#summonSpeak').addEventListener('click', summonSpeak);
    selectObj('bottle');
  }
  function selectObj(id) {
    S.sel = id;
    $('#photoObj').innerHTML = SVG['photo-' + id]();
    $('#photoObj').classList.toggle('gone', S.captured.includes(id));
    $$('#objChips .chip').forEach(c => { c.classList.toggle('sel', c.dataset.id === id); c.classList.toggle('done', S.captured.includes(c.dataset.id)); });
    $('#scanStatus').textContent = S.captured.includes(id) ? `${DEFS[id].name} is already awake ✨` : `Point at Mizuki's ${DEFS[id].object.toLowerCase()}`;
  }
  function showCard(av) {
    const d = av.def;
    $('#compCard').innerHTML = `<div class="cc-name">${d.name}<span class="jp">${d.jp}</span></div>
      <span class="cc-dom" style="background:${d.color}">Looks after: ${d.domain}</span>
      <div class="cc-row">📦 Object: ${d.object}</div><div class="cc-row">👀 Notices: ${d.looks}</div><div class="cc-row">🤖 Agent #${ORDER.indexOf(d.id) + 1} of 4</div>`;
    $('#compCard').classList.add('show');
  }
  async function capture() {
    if (S.busy) return;
    const id = S.sel, av = S.av[id];
    if (S.captured.includes(id)) { av.poke(); pokeReact(S.stage, av, "I'm already here, silly!"); return; }
    S.busy = true;
    const tok = SEQ, phone = $('.phone');
    try {
      phone.classList.remove('flashing'); void phone.offsetWidth; phone.classList.add('flashing');
      phone.classList.add('scanning');
      for (const msg of ['✂️ Cutting out the object…', '🧊 Building a 3D splat…', '💗 Giving it a heart…']) { $('#scanStatus').textContent = msg; await sleep(430); }
      phone.classList.remove('scanning');
      $('#photoObj').classList.add('gone');
      $('#summonEmpty').classList.add('gone');
      await S.stage.summon(av, [-7.5, 1.8, 2]);
      S.captured.push(id); S.last = av; showCard(av);
      $$('#objChips .chip').forEach(c => c.classList.toggle('done', S.captured.includes(c.dataset.id)));
      $('#scanStatus').textContent = `✨ ${av.def.name} is awake!`;
      if (alive(tok)) await avSay(S.stage, av, INTRO[id], tok);
      const nxt = ORDER.find(o => !S.captured.includes(o));
      if (nxt) selectObj(nxt); else $('#scanStatus').textContent = 'All 4 companions are awake 🎉';
    } finally { phone.classList.remove('scanning', 'flashing'); S.busy = false; }
  }
  async function summonSpeak() {
    if (S.talking) return;
    S.talking = true;
    const tok = SEQ, el = $('#summonMz'), btn = $('#summonSpeak');
    btn.disabled = true;
    try {
      const av = S.last;
      if (!av) { await mizukiSay(el, 'Hmm… which one should I photograph first?', tok); return; }
      const [m, a] = SUMMON_CHAT[av.def.id];
      await mizukiSay(el, m, tok);
      if (!alive(tok)) return;
      av.poke(0.6);
      await avSay(S.stage, av, a, tok);
    } finally { S.talking = false; btn.disabled = false; }
  }
  hooks['s-summon'] = {
    enter() { if (!S.stage) initSummon(); S.stage.resize(); S.stage.active = true; },
    leave() { if (S.stage) { S.stage.active = false; S.stage.hideBubbles(); S.av && Object.values(S.av).forEach(a => a.setTalking(false)); } $('#summonMz').classList.remove('show'); },
  };

  /* ================= 4 · Council (multi-agent) ================= */
  const SIG = {
    bottle: { ok: 'Drinking normally at lunch', bad: 'Drank 60% less at lunch this week' },
    glasses: { ok: 'Reading most evenings', bad: 'No reading for 4 days' },
    bag: { ok: 'Leaving home on time', bad: 'Left home late 3 days in a row' },
    pencil: { ok: 'Talks about classmates', bad: 'No friends mentioned since Monday' },
  };
  const COUNCIL_LINE = {
    bottle: 'She drank 60% less at lunch this week.',
    glasses: "No reading for four days. That's not like her.",
    bag: 'We left home late three days in a row.',
    pencil: "She hasn't mentioned a single friend since Monday.",
  };
  const EXCH = [
    ['bottle', "I don't really feel like eating lunch today.", "That's okay. Just one sip with me? I'm right here."],
    ['glasses', "I can't focus on reading anymore.", "Let's read just one page together. One page is enough."],
    ['bag', "I don't want to go to school tomorrow…", "Then let's just walk to the gate together. Only that far."],
    ['pencil', 'Nobody talked to me at lunch.', "I'm sorry. You're not alone. You have us."],
  ];
  const C = { stage: null, av: {}, worried: {}, lines: [], ex: 0, running: false, talking: false, consented: false };
  const CPOS = [[-3.2, 0.4, 0.38], [-1.08, -0.55, 0.12], [1.08, -0.55, -0.12], [3.2, 0.4, -0.38]];
  function initCouncil() {
    const st = C.stage = new Stage3D($('#councilCanvas'), $('#councilOverlay'), {
      night: true, orbit: true, r: 11.5, phi: 1.27, target: [0, 1.1, 0], fov: 34, groundR: 8,
      onPoke: av => pokeReact(st, av, av.mood === 'worried' ? "I'm a little worried about Mizuki…" : null),
      onSpin: av => pokeReact(st, av, 'Wheee~ the stars are spinning!'),
    });
    ORDER.forEach((id, i) => { const [x, z, r] = CPOS[i]; C.av[id] = st.add(new Avatar(id), x, z, r); C.worried[id] = false; });
    // stars, moon, lantern
    const N = 500, P = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * 1.2;
      P[i * 3] = 30 * Math.sin(ph) * Math.cos(th); P[i * 3 + 1] = 4 + 30 * Math.cos(ph); P[i * 3 + 2] = 30 * Math.sin(ph) * Math.sin(th) - 6;
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(P, 3));
    st.scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.85 })));
    const moon = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 20), new THREE.MeshBasicMaterial({ color: 0xfff3c9 }));
    moon.position.set(-10, 10, -16); st.scene.add(moon);
    const lantern = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 10), new THREE.MeshStandardMaterial({ color: 0x8a6a52 }));
    post.position.y = 0.3;
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffd98a }));
    glow.position.y = 0.75;
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffc870, transparent: true, opacity: 0.18, depthWrite: false }));
    aura.position.y = 0.75;
    const light = new THREE.PointLight(0xffc870, 1.6, 9); light.position.y = 0.9;
    lantern.add(post, glow, aura, light); lantern.position.set(0, 0, 0.9);
    st.scene.add(lantern);
    st.onTick = (dt, t) => {
      aura.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
      C.lines.forEach(l => {
        l.k = Math.min(1, l.k + dt * 1.4);
        const n = l.mesh.geometry.index.count;
        l.mesh.geometry.setDrawRange(0, Math.floor(n * l.k / 3) * 3);
        l.mesh.material.opacity = 0.55 + 0.3 * Math.sin(t * 4 + l.ph);
      });
    };
    $('#signals').innerHTML = ORDER.map(id => `<button class="sig" data-id="${id}"><div class="sav">${SVG['mini-' + id]()}</div><div><div class="sn">${DEFS[id].name} · ${DEFS[id].domain}</div><div class="st"></div></div><span class="ss"></span></button>`).join('');
    $$('#signals .sig').forEach(b => b.addEventListener('click', () => { C.consented = false; setWorried(b.dataset.id, !C.worried[b.dataset.id]); }));
    $('#councilRun').addEventListener('click', runCouncil);
    $('#councilSpeak').addEventListener('click', councilSpeak);
    ORDER.forEach(id => setWorried(id, false));
  }
  function setWorried(id, w) {
    C.worried[id] = w;
    const av = C.av[id];
    av.setMood(w && !C.consented ? 'worried' : 'ok');
    av.setHalo(C.consented ? '#6fd6b0' : (w ? '#ffd36e' : null));
    const row = $(`#signals .sig[data-id="${id}"]`);
    row.classList.toggle('worried', w);
    $('.st', row).textContent = w ? SIG[id].bad : SIG[id].ok;
    $('.ss', row).textContent = w ? '⚠️ worried' : '✓ okay';
    rebuildLines(); renderVerdict();
  }
  function rebuildLines() {
    const st = C.stage;
    C.lines.forEach(l => { st.scene.remove(l.mesh); l.mesh.geometry.dispose(); l.mesh.material.dispose(); });
    const old = C.lines; C.lines = [];
    const ids = ORDER.filter(id => C.worried[id]);
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const a = C.av[ids[i]].headWorld(), b = C.av[ids[j]].headWorld();
      a.y += 0.25; b.y += 0.25;
      const mid = a.clone().add(b).multiplyScalar(0.5); mid.y += 1.1;
      const geo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 48, 0.03, 8, false);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.consented ? 0x6fd6b0 : 0xffd36e, transparent: true, opacity: 0.8, depthWrite: false }));
      st.scene.add(mesh);
      const key = ids[i] + ids[j], prevLine = old.find(l => l.key === key);
      C.lines.push({ mesh, key, k: prevLine ? 1 : 0, ph: Math.random() * 6 });
    }
  }
  function renderVerdict(override) {
    const v = $('#verdict');
    if (override) { v.className = 'verdict'; v.innerHTML = `<span class="vt">${override}</span>Companions are sharing tonight's mood signals…`; return; }
    const n = ORDER.filter(id => C.worried[id]).length;
    let cls, title, body;
    if (n === 0) { cls = 'g'; title = '🟢 All is well'; body = 'Companions cheer small wins.'; }
    else if (n === 1) { cls = 'g'; title = '🟢 Just a bad day'; body = 'One witness isn\'t a pattern. Encourage, no alarm.'; }
    else if (n === 2) { cls = 'y'; title = '🟡 Early pattern'; body = `${n} of 4 companions agree. Suggest a small step or a VR practice.`; }
    else { cls = 'r'; title = '🔴 Strong pattern'; body = `${n} of 4 companions agree. Ask Mizuki if she'd like help reaching an adult.`; }
    v.className = 'verdict ' + cls;
    v.innerHTML = `<span class="vt">${title}</span>${body}` + (C.consented ? '<span class="consent">✅ Mizuki said yes → school counselor contacted, with her consent.</span>' : '');
  }
  async function runCouncil() {
    if (C.running) return;
    C.running = true;
    const tok = SEQ, btn = $('#councilRun');
    btn.disabled = true;
    try {
      C.consented = false;
      ORDER.forEach(id => setWorried(id, false));
      renderVerdict('🌙 22:00 · Council in session');
      await sleep(500);
      for (const id of ORDER) {
        if (!alive(tok)) return;
        const av = C.av[id];
        av.setHalo('#ffffff');
        await avSay(C.stage, av, COUNCIL_LINE[id], tok, 'signal', 500);
        if (!alive(tok)) return;
        setWorried(id, true);
        await sleep(250);
      }
      await sleep(500);
      if (!alive(tok)) return;
      await avSay(C.stage, C.av.bag, "Mizuki, we're all a little worried. Want us to come with you to talk to Ms. Sato?", tok);
      if (!alive(tok)) return;
      await mizukiSay($('#councilMz'), '…Okay. Will you come with me?', tok);
      if (!alive(tok)) return;
      C.consented = true;
      ORDER.forEach(id => { const a = C.av[id]; a.celebrate(); C.stage.bubble(a, 'Always! 💗', 2600); setWorried(id, true); });
      Voice.say('Always!', DEFS.pencil);
    } finally { C.running = false; btn.disabled = false; }
  }
  async function councilSpeak() {
    if (C.talking) return;
    C.talking = true;
    const tok = SEQ, btn = $('#councilSpeak');
    btn.disabled = true;
    try {
      const [id, m, a] = EXCH[C.ex];
      C.ex = (C.ex + 1) % EXCH.length;
      $('#speakIdx').textContent = `${C.ex + 1}/4`;
      await mizukiSay($('#councilMz'), m, tok);
      if (!alive(tok)) return;
      C.av[id].poke(0.6);
      await avSay(C.stage, C.av[id], a, tok);
    } finally { C.talking = false; btn.disabled = false; }
  }
  hooks['s-council'] = {
    enter() { if (!C.stage) initCouncil(); C.stage.resize(); C.stage.active = true; },
    leave() { if (C.stage) { C.stage.active = false; C.stage.hideBubbles(); Object.values(C.av).forEach(a => a.setTalking(false)); } $('#councilMz').classList.remove('show'); },
  };

  /* ================= 5 · Respond / Rehearse / Watch / Build ================= */
  $$('#respTabs .tab').forEach(t => t.addEventListener('click', () => {
    cancelSeq();
    $$('#respTabs .tab').forEach(x => x.classList.toggle('on', x === t));
    $$('#s-respond .pane').forEach(p => p.classList.toggle('on', p.id === t.dataset.tab));
  }));
  $('#vrComps').innerHTML = ORDER.map(id => `<div>${SVG['mini-' + id]()}</div>`).join('');
  const CLASSES = [
    ['1-A', '☀️', 'Sunny'], ['1-B', '☀️', 'Sunny'], ['1-C', '🌤️', 'Mostly sunny'], ['1-D', '☀️', 'Sunny'],
    ['2-A', '🌤️', 'Mostly sunny'], ['2-B', '☁️', 'Cloudy · worry signals ↑', 'cloudy'], ['2-C', '☀️', 'Sunny'], ['2-D', '🌤️', 'Mostly sunny'],
    ['3-A', '⛅', 'Exam stress ↑'], ['3-B', '🌤️', 'Mostly sunny'], ['3-C', '☀️', 'Sunny'], ['3-D', '🌤️', 'Mostly sunny'],
  ];
  $('#dashGrid').innerHTML = CLASSES.map(([n, w, d, c]) => `<div class="cls ${c || ''}"><div class="w">${w}</div><div><div class="cn">${n}</div><div class="cd">${d}</div></div></div>`).join('');

  function vrBub(id, text) { const b = $(id); b.textContent = text; b.classList.add('show'); }
  function confetti() {
    const box = $('#confetti'); box.innerHTML = '';
    const cols = ['#ff8fab', '#ffd36e', '#6fd6b0', '#9ad8ff', '#c9b6ff'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % 5];
      c.style.animationDelay = Math.random() * 0.6 + 's'; c.style.borderRadius = i % 2 ? '50%' : '2px';
      box.appendChild(c);
    }
  }
  let vrRunning = false;
  $('#vrPlay').addEventListener('click', async () => {
    if (vrRunning) return;
    vrRunning = true;
    const tok = SEQ;
    $$('#vrScene .vr-bub').forEach(b => b.classList.remove('show'));
    $('#vrComps').classList.remove('cheer'); $('#confetti').innerHTML = '';
    try {
      vrBub('#vrCoachBub', "Megane: Ready? Ms. Sato is right there. Just one sentence.");
      await Voice.say('Ready? Ms. Sato is right there. Just one sentence.', DEFS.glasses);
      if (!alive(tok)) return;
      vrBub('#vrMzBub', "Ms. Sato… can I talk to you? I'm not okay.");
      await Voice.say("Ms. Sato… can I talk to you? I'm not okay.", 'mizuki');
      if (!alive(tok)) return;
      vrBub('#vrTeacherBub', "Thank you for telling me, Mizuki. Let's talk. You're not alone.");
      await Voice.say("Thank you for telling me, Mizuki. Let's talk. You're not alone.", 'teacher');
      if (!alive(tok)) return;
      $('#vrComps').classList.add('cheer'); confetti();
      vrBub('#vrCoachBub', 'All: You did it!! 🎉 Practice done. Ready for the real thing.');
      await Voice.say('You did it!', DEFS.pencil);
    } finally { vrRunning = false; }
  });

  /* ================= 6 · Compare: research figure popover ================= */
  const pop = $('#figPop');
  $$('#cmpTable tbody tr').forEach(tr => {
    tr.addEventListener('mouseenter', () => {
      $('img', pop).src = '../research/figures/' + tr.dataset.fig;
      $('.cap', pop).textContent = tr.dataset.cap;
      const s = parseFloat(getComputedStyle(stageEl).getPropertyValue('--s')) || 1;
      const sr = stageEl.getBoundingClientRect(), rr = tr.getBoundingClientRect();
      const us = $('td.us', tr).getBoundingClientRect();
      const x = (us.left - sr.left) / s - 412;
      const y = Math.max(20, Math.min(900 - 360, (rr.top - sr.top) / s - 120));
      pop.style.left = x + 'px'; pop.style.top = y + 'px';
      pop.classList.add('show');
    });
    tr.addEventListener('mouseleave', () => pop.classList.remove('show'));
  });

  /* ================= 7 · Business model chart ================= */
  const STREAMS = [
    { id: 'city', name: '🏛️ City boards of education (B2G)', desc: 'Mid-size city ≈ 5,000 students → <b>¥250 / child / month</b>. Paid from existing mental-health & futoukou budgets.', price: '¥15M', unit: 'per city / yr', color: '#d6455f', short: 'Cities (B2G)' },
    { id: 'school', name: '🏫 Private junior highs', desc: 'Own budgets, faster decisions. Includes VR rehearsal kit + counselor dashboard.', price: '¥2.93M', unit: 'per school / yr', color: '#3b6fd6', short: 'Private schools' },
    { id: 'family', name: '👨‍👩‍👧 Family Premium', desc: 'Extra companions, seasonal outfits, home VR. Safety is never paywalled.', price: '¥480', unit: 'per family / mo', color: '#c9831a', short: 'Family Premium' },
    { id: 'eap', name: '🏢 Kokoro for Work (EAP channel)', desc: 'The same companions for young employees, sold through EAP partners.', price: '¥100k', unit: 'per company / mo', color: '#9a4fb8', short: 'Kokoro for Work' },
    { id: 'intl', name: '🌏 Overseas licensing', desc: 'Korea, Taiwan, Hong Kong, Singapore via local edtech partners.', price: 'License', unit: '+ revenue share', color: '#2a8f73', short: 'Overseas' },
  ];
  const YEARS = ['FY2027', 'FY2028', 'FY2029', 'FY2030', 'FY2031'];
  const REV = { city: [30, 150, 600, 1500, 3000], school: [14.65, 58.6, 175.8, 351.6, 586], family: [0, 46.1, 144, 288, 460.8], eap: [0, 12, 60, 180, 360], intl: [0, 0, 30, 200, 600] };
  const COST = [48, 190, 600, 1350, 2800];
  const KPI = { cities: [2, 10, 40, 100, 200], schools: [5, 20, 60, 120, 200], kids: ['12k', '58k', '224k', '548k', '1.08M'] };
  const TOTAL = YEARS.map((_, i) => STREAMS.reduce((s, st) => s + REV[st.id][i], 0));
  const yen = m => m >= 1000 ? `¥${(m / 1000).toFixed(m >= 10000 ? 0 : 2)}B` : `¥${m < 100 ? m.toFixed(1) : Math.round(m)}M`;
  const B = { sel: 4, hover: null, p: 1 };

  $('#streams').innerHTML = STREAMS.map(s => `<div class="stream" data-id="${s.id}"><div class="bar" style="background:${s.color}"></div><div><div class="sn">${s.name}</div><div class="sd">${s.desc}</div></div><div class="sp">${s.price}<small>${s.unit}</small></div></div>`).join('');
  $$('#streams .stream').forEach(el => {
    el.addEventListener('mouseenter', () => { B.hover = el.dataset.id; drawChart(); });
    el.addEventListener('mouseleave', () => { B.hover = null; drawChart(); });
  });
  $('#legend').innerHTML = STREAMS.map(s => `<span><i style="background:${s.color}"></i>${s.short}</span>`).join('') + '<span><i class="line"></i>Operating cost</span>';
  $('#yearBtns').innerHTML = YEARS.map((y, i) => `<button data-i="${i}">Y${i + 1}</button>`).join('') + '<button data-play="1">▶ Play</button>';
  $$('#yearBtns button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.play) { playYears(); return; }
    B.sel = +b.dataset.i; drawChart(); renderKpis();
  }));
  async function playYears() {
    const tok = SEQ;
    for (let i = 0; i < 5; i++) { if (!alive(tok)) return; B.sel = i; drawChart(); renderKpis(); await sleep(900); }
  }
  function renderKpis() {
    const i = B.sel, margin = (TOTAL[i] - COST[i]) / TOTAL[i] * 100;
    $$('#yearBtns button[data-i]').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    $('#kpis').innerHTML = `
      <div class="kpi"><div class="kv">${yen(TOTAL[i])}</div><div class="kl">Revenue · ${YEARS[i]}</div></div>
      <div class="kpi"><div class="kv">${KPI.cities[i]}</div><div class="kl">cities (of ~800 in Japan)</div></div>
      <div class="kpi"><div class="kv">${KPI.kids[i]}</div><div class="kl">children with companions</div></div>
      <div class="kpi"><div class="kv">${margin >= 0 ? '' : '−'}${Math.abs(margin).toFixed(0)}%</div><div class="kl">operating margin</div></div>`;
  }
  function drawChart() {
    const W = 818, H = 330, L = 58, R = 20, T = 30, Bm = 34;
    const pw = W - L - R, ph = H - T - Bm, max = 5500;
    const y = v => T + ph - (v / max) * ph * B.p;
    const band = pw / 5, bw = band * 0.5;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
    for (let v = 0; v <= 5000; v += 1000) {
      const yy = T + ph - (v / max) * ph;
      s += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="${v ? '#f0eaf4' : '#cfc6da'}" stroke-width="1"/>`;
      s += `<text x="${L - 10}" y="${yy + 4}" text-anchor="end" font-size="13" fill="#8a819f">${v ? '¥' + v / 1000 + 'B' : '¥0'}</text>`;
    }
    YEARS.forEach((yr, i) => {
      const x = L + band * i + (band - bw) / 2;
      const dim = i !== B.sel ? 0.38 : 1;
      let acc = 0;
      const segs = STREAMS.filter(st => REV[st.id][i] > 0);
      segs.forEach((st, k) => {
        const v = REV[st.id][i], y1 = y(acc), y2 = y(acc + v);
        acc += v;
        let h = y1 - y2 - (k > 0 ? 2 : 0); if (h <= 0.5) return;
        const op = B.hover && B.hover !== st.id ? 0.18 : dim;
        const top = k === segs.length - 1, r = Math.min(4, h);
        const d = top
          ? `M${x} ${y2 + h} L${x} ${y2 + r} Q${x} ${y2} ${x + r} ${y2} L${x + bw - r} ${y2} Q${x + bw} ${y2} ${x + bw} ${y2 + r} L${x + bw} ${y2 + h} Z`
          : `M${x} ${y2 + h} L${x} ${y2} L${x + bw} ${y2} L${x + bw} ${y2 + h} Z`;
        s += `<path class="seg" d="${d}" fill="${st.color}" opacity="${op}" data-tip="${yr} · ${st.short}: ${yen(v)}"/>`;
      });
      s += `<text x="${x + bw / 2}" y="${y(TOTAL[i]) - 9}" text-anchor="middle" font-size="15" font-weight="800" fill="#2b2140" opacity="${i === B.sel ? 1 : 0.55}">${yen(TOTAL[i])}</text>`;
      s += `<text x="${x + bw / 2}" y="${H - 10}" text-anchor="middle" font-size="14" font-weight="${i === B.sel ? 800 : 600}" fill="${i === B.sel ? '#2b2140' : '#8a819f'}">Y${i + 1} · ${yr}</text>`;
      s += `<rect x="${L + band * i}" y="${T}" width="${band}" height="${ph}" fill="transparent" class="hit" data-i="${i}"/>`;
    });
    const pts = COST.map((c, i) => [L + band * i + band / 2, y(c)]);
    s += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#2b2140" stroke-width="2" stroke-dasharray="6 5" pointer-events="none"/>`;
    pts.forEach((p, i) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#fff" stroke="#2b2140" stroke-width="2" data-tip="${YEARS[i]} · Operating cost: ${yen(COST[i])}" class="seg"/>`; });
    s += '</svg>';
    $('#chart').innerHTML = s;
    const tip = $('#chartTip');
    $$('#chart .seg').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const sc = parseFloat(getComputedStyle(stageEl).getPropertyValue('--s')) || 1;
        const r = $('.chart-box').getBoundingClientRect();
        tip.textContent = el.dataset.tip; tip.classList.add('show');
        tip.style.left = ((e.clientX - r.left) / sc + 14) + 'px'; tip.style.top = ((e.clientY - r.top) / sc - 36) + 'px';
      });
      el.addEventListener('mouseleave', () => tip.classList.remove('show'));
    });
    $$('#chart .hit').forEach(el => el.addEventListener('click', () => { B.sel = +el.dataset.i; drawChart(); renderKpis(); }));
    // segments sit under the hit rects; bring them to front so tooltips work, hit rects still catch empty space
    const svg = $('#chart svg');
    $$('#chart .seg').forEach(el => svg.appendChild(el));
    $$('#chart .seg').forEach(el => el.addEventListener('click', () => {
      const m = /^FY\d+/.exec(el.dataset.tip); if (m) { B.sel = YEARS.indexOf(m[0]); drawChart(); renderKpis(); }
    }));
  }
  hooks['s-business'] = {
    enter() {
      B.sel = 4; renderKpis();
      const t0 = performance.now();
      const tick = (now) => { B.p = Math.min(1, (now - t0) / 900); B.p = 1 - Math.pow(1 - B.p, 3); drawChart(); if (B.p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    },
  };

  /* ================= 9 · Finale ================= */
  const E = { stage: null, timer: null };
  hooks['s-end'] = {
    enter() {
      if (!E.stage) {
        E.stage = new Stage3D($('#endCanvas'), $('#endOverlay'), {
          r: 10.5, phi: 1.42, target: [0, 1.25, 0], fov: 30, ground: false, autoSway: true,
          onPoke: av => pokeReact(E.stage, av, 'Thank you for listening! 💗'),
        });
        ORDER.forEach((id, i) => E.stage.add(new Avatar(id), [-4.2, -1.4, 1.4, 4.3][i], 0, [0.25, 0.08, -0.08, -0.25][i]));
      }
      E.stage.resize(); E.stage.active = true;
      const avs = E.stage.avatars;
      avs.forEach((a, i) => setTimeout(() => a.celebrate(), 300 + i * 180));
      E.timer = setInterval(() => avs[(Math.random() * avs.length) | 0].poke(0.8), 1600);
    },
    leave() { if (E.stage) E.stage.active = false; clearInterval(E.timer); },
  };

  /* ================= boot ================= */
  fillSvgs();
  const start = Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1);
  go(start);
  addEventListener('hashchange', () => { const n = parseInt(location.hash.slice(1), 10); if (n) go(n - 1, true); });
})();
