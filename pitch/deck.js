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

    'mini-bottle': () => `<svg viewBox="0 0 100 100"><circle cx="50" cy="10" r="6" fill="none" stroke="#2b2833" stroke-width="4"/><path d="M37 25 L40 14 H60 L63 25 Z" fill="#2b2833"/><rect x="33" y="24" width="34" height="7" rx="3" fill="#d9dde4"/><rect x="30" y="30" width="40" height="62" rx="18" fill="#3f8fe8"/><rect x="37" y="40" width="6" height="32" rx="3" fill="#fff" opacity=".45"/>${face(52, 58, 8)}</svg>`,
    'mini-glasses': () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="58" rx="36" ry="33" fill="#f4ebe1" stroke="#e2d4c4" stroke-width="2"/>${face(50, 56, 13)}<path d="M15 52 H6 M85 52 H94" stroke="#23212a" stroke-width="4.5" stroke-linecap="round"/><circle cx="36" cy="54" r="14" fill="rgba(223,241,255,.3)" stroke="#23212a" stroke-width="4.5"/><circle cx="64" cy="54" r="14" fill="rgba(223,241,255,.3)" stroke="#23212a" stroke-width="4.5"/><path d="M48 51 Q50 48 52 51" stroke="#23212a" stroke-width="4" fill="none"/></svg>`,
    'mini-bag': () => `<svg viewBox="0 0 100 100"><path d="M20 36 Q50 2 80 36" stroke="#b32a3a" stroke-width="4" fill="none"/><rect x="14" y="28" width="72" height="62" rx="14" fill="#d8394a"/><path d="M14 44 Q14 28 30 28 L70 28 Q86 28 86 44 L86 58 Q86 63 81 63 L19 63 Q14 63 14 58 Z" fill="#b32a3a"/><rect x="21" y="46" width="8" height="24" rx="2" fill="#b32a3a"/><rect x="71" y="46" width="8" height="24" rx="2" fill="#b32a3a"/><rect x="19.5" y="60" width="11" height="8" rx="2" fill="none" stroke="#dfe2e8" stroke-width="2.2"/><rect x="69.5" y="60" width="11" height="8" rx="2" fill="none" stroke="#dfe2e8" stroke-width="2.2"/>${face(50, 76, 10)}</svg>`,
    'mini-pencil': () => `<svg viewBox="0 0 100 100"><g transform="rotate(-24 22 44)"><rect x="18" y="16" width="8" height="30" fill="#e94b4b"/><polygon points="18,16 26,16 22,7" fill="#f5d9b0"/></g><g transform="rotate(-8 30 44)"><rect x="27" y="18" width="8" height="28" fill="#3fb36b"/><polygon points="27,18 35,18 31,9" fill="#f5d9b0"/></g><rect x="8" y="40" width="84" height="46" rx="23" fill="#2f5cc8"/><path d="M24 43 L80 43" stroke="#e0353f" stroke-width="3.5" stroke-linecap="round"/><circle cx="82" cy="44" r="3.5" fill="#e0353f"/><circle cx="20" cy="58" r="2.6" fill="#ffd36e"/><rect x="78" y="62" width="5" height="5" fill="#ff6f7f"/><circle cx="24" cy="74" r="2.4" fill="#6fd6a0"/><rect x="74" y="74" width="5" height="5" fill="#fff"/>${face(50, 63, 11)}</svg>`,
  };
  function fillSvgs() {
    $$('[data-svg]').forEach(el => { el.innerHTML = SVG[el.dataset.svg](); });
    $$('[data-svg-row]').forEach(el => { el.innerHTML = ORDER.map(id => `<div>${SVG['mini-' + id]()}</div>`).join(''); });
  }

  /* ================= Voices (Web Speech API, offline OS voices) ================= */
  // Respell words the OS voices tend to read letter by letter.
  const SAY_AS = [[/Wheee~?/g, 'Weee'], [/Hmm/g, 'Hm'], [/Hehe/g, 'Heh heh'], [/Fude-pon/g, 'Foo-day pon'], [/Ms\./g, 'Miss']];
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
        const spoken = SAY_AS.reduce((t, [re, w]) => t.replace(re, w), text);
        const u = new SpeechSynthesisUtterance(spoken.replace(/[^\p{L}\p{N}\s.,!?'’…:-]/gu, ''));
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
    hooks[s.id]?.enter?.(back || showAllSteps);
    $$('#dots i').forEach((d, k) => d.classList.toggle('on', k === i));
    renderNotes();
    history.replaceState(null, '', '#' + (i + 1));
  }
  function next() {
    if (hooks[slides[cur].id]?.next?.()) return;
    const hidden = $$('.step:not(.shown)', slides[cur]);
    if (hidden.length) { hidden[0].classList.add('shown'); return; }
    go(cur + 1);
  }
  function prev() { go(cur - 1); }

  $('#dots').innerHTML = slides.map(() => '<i></i>').join('');
  $$('#dots i').forEach((d, k) => d.addEventListener('click', () => go(k, true)));
  $('#prevBtn').onclick = prev; $('#nextBtn').onclick = next;
  $('#s-intro').addEventListener('click', next);

  // Sound on/off: the corner toggle and the nav button stay in sync; the choice is remembered.
  function setMuted(m) {
    Voice.muted = m;
    if (m) Voice.stop();
    $('#muteBtn').textContent = m ? '🔇' : '🔊';
    const sb = $('#soundBtn');
    sb.classList.toggle('off', m);
    sb.innerHTML = m ? '🔇 <span>Sound off</span>' : '🔊 <span>Sound on</span>';
    sb.setAttribute('aria-pressed', String(!m));
    try { localStorage.setItem('kokoro-muted', m ? '1' : '0'); } catch (e) {}
  }
  function toggleMute() { setMuted(!Voice.muted); }
  $('#muteBtn').onclick = toggleMute;
  $('#soundBtn').onclick = toggleMute;
  let savedMute = false;
  try { savedMute = localStorage.getItem('kokoro-muted') === '1'; } catch (e) {}
  setMuted(savedMute);
  function toggleFs() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
  $('#fsBtn').onclick = toggleFs;

  // speaker notes + pitch timer
  const notes = $('#notes');
  let t0 = Date.now();
  function renderNotes() {
    const s = slides[cur];
    const k = $('.kicker', s);
    $('#nTitle').textContent = `${cur + 1}/${slides.length} · ${k ? k.textContent : s.dataset.title}`;
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

  /* ================= 0 · Intro: dark questions → agents spell KOKORO ================= */
  const IQ = [
    'When was the last time you said <b>“I’m fine”</b>… and didn’t mean it?',
    'Who would you tell, if you couldn’t tell anyone?',
    'What if the words just… won’t come out?',
    'Would anyone even <b>notice</b>?',
    '…What if something already did?',
  ];
  // The crowd: everyday things a child carries, each a little agent.
  const sv = body => `<svg viewBox="0 0 100 100">${body}</svg>`;
  const CAST = {
    bottle: SVG['mini-bottle'], glasses: SVG['mini-glasses'], bag: SVG['mini-bag'], pencil: SVG['mini-pencil'],
    eraser: () => sv(`<rect x="12" y="30" width="76" height="46" rx="12" fill="#ffc1d4"/><rect x="60" y="27" width="28" height="52" rx="7" fill="#7cc4ff"/><path d="M66 40 h16 M66 48 h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>${face(36, 50, 8, 0.85)}`),
    notebook: () => sv(`<rect x="20" y="12" width="62" height="78" rx="9" fill="#7fb8ff"/><rect x="20" y="12" width="13" height="78" rx="6" fill="#5a98e6"/>${[22, 34, 46, 58, 70, 82].map(y => `<circle cx="20" cy="${y}" r="3.5" fill="none" stroke="#3d3a5c" stroke-width="2.5"/>`).join('')}<rect x="42" y="22" width="30" height="10" rx="3" fill="#fff"/>${face(56, 56, 9, 0.9)}`),
    bento: () => sv(`<rect x="10" y="38" width="80" height="50" rx="13" fill="#ff9f68"/><rect x="10" y="38" width="80" height="11" rx="5" fill="#f2864d"/><path d="M50 36 L32 20 Q30 34 42 38 Z M50 36 L68 20 Q70 34 58 38 Z" fill="#ff6f91"/><circle cx="50" cy="35" r="6" fill="#ff6f91"/>${face(50, 64, 11)}`),
    onigiri: () => sv(`<path d="M50 12 C62 12 92 62 90 76 C88 92 12 92 10 76 C8 62 38 12 50 12 Z" fill="#fff" stroke="#e6dff0" stroke-width="3"/><rect x="35" y="66" width="30" height="26" rx="4" fill="#35584a"/>${face(50, 50, 9, 0.9)}`),
    umbrella: () => sv(`<path d="M50 54 V82 Q50 92 40 88" stroke="#6a5a8e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M8 56 Q50 2 92 56 Q81 47 71 56 Q61 47 50 56 Q39 47 29 56 Q19 47 8 56 Z" fill="#8fd9c8"/><circle cx="50" cy="10" r="4" fill="#6a5a8e"/>${face(50, 38, 9, 0.85)}`),
    headphones: () => sv(`<circle cx="50" cy="60" r="27" fill="#fff0c9"/><path d="M18 60 Q18 16 50 16 Q82 16 82 60" stroke="#b78cff" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="8" y="50" width="22" height="34" rx="10" fill="#ff8fab"/><rect x="70" y="50" width="22" height="34" rx="10" fill="#ff8fab"/>${face(50, 62, 8, 0.8)}`),
    phone: () => sv(`<rect x="25" y="10" width="50" height="82" rx="13" fill="#3d3a5c"/><rect x="30" y="18" width="40" height="66" rx="8" fill="#bfe8ff"/><path d="M44 80 h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>${face(50, 48, 8, 0.8)}`),
    sneaker: () => sv(`<path d="M10 72 Q8 38 28 38 L44 38 Q52 52 68 54 L82 56 Q94 60 92 74 Z" fill="#fff" stroke="#e6dff0" stroke-width="2"/><rect x="8" y="70" width="86" height="13" rx="6.5" fill="#ff6f91"/><path d="M46 44 l8 -4 M50 50 l8 -4" stroke="#7cc4ff" stroke-width="3" stroke-linecap="round"/>${face(30, 56, 7, 0.75)}`),
    teddy: () => sv(`<circle cx="50" cy="12" r="6" fill="none" stroke="#c9b98a" stroke-width="3"/><circle cx="26" cy="30" r="13" fill="#d9a27a"/><circle cx="74" cy="30" r="13" fill="#d9a27a"/><circle cx="26" cy="30" r="6" fill="#ffc9a8"/><circle cx="74" cy="30" r="6" fill="#ffc9a8"/><circle cx="50" cy="56" r="34" fill="#e8b48c"/><ellipse cx="50" cy="66" rx="13" ry="10" fill="#fbe3cc"/>${face(50, 54, 12)}<ellipse cx="50" cy="60" rx="3.5" ry="2.5" fill="#2b2140"/>`),
    clock: () => sv(`<path d="M30 84 L24 94 M70 84 L76 94" stroke="#6a5a8e" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="24" r="11" fill="#ffd36e"/><circle cx="78" cy="24" r="11" fill="#ffd36e"/><circle cx="50" cy="56" r="35" fill="#ff8a80"/><circle cx="50" cy="56" r="27" fill="#fff"/><circle cx="50" cy="15" r="5" fill="#ffd36e"/>${face(50, 58, 9, 0.85)}`),
    milk: () => sv(`<path d="M27 34 L50 12 L73 34 Z" fill="#7cc4ff"/><rect x="27" y="34" width="46" height="58" rx="5" fill="#fff" stroke="#dbe9f7" stroke-width="2"/><rect x="27" y="72" width="46" height="20" rx="4" fill="#7cc4ff"/>${face(50, 52, 8, 0.8)}`),
    plant: () => sv(`<ellipse cx="36" cy="26" rx="10" ry="18" fill="#6fd6a0" transform="rotate(-32 36 26)"/><ellipse cx="64" cy="26" rx="10" ry="18" fill="#6fd6a0" transform="rotate(32 64 26)"/><ellipse cx="50" cy="20" rx="9" ry="17" fill="#4fbf87"/><path d="M22 46 H78 L70 92 H30 Z" fill="#ff9f68"/><rect x="18" y="40" width="64" height="13" rx="6" fill="#f2864d"/>${face(50, 68, 9, 0.85)}`),
    game: () => sv(`<path d="M12 52 Q12 30 32 32 H68 Q88 30 88 52 Q92 82 74 82 Q65 82 60 68 H40 Q35 82 26 82 Q8 82 12 52 Z" fill="#c9b6ff"/><path d="M20 50 h14 M27 43 v14" stroke="#4a3b7a" stroke-width="4.5" stroke-linecap="round"/><circle cx="72" cy="45" r="4.5" fill="#ff8fab"/><circle cx="80" cy="53" r="4.5" fill="#ffd36e"/>${face(50, 50, 6, 0.75)}`),
    book: () => sv(`<rect x="14" y="16" width="72" height="70" rx="9" fill="#ff8fab"/><rect x="14" y="16" width="12" height="70" rx="5" fill="#e0567a"/><path d="M80 24 v54" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M56 22 l2.4 5 5.4 .6 -4 3.6 1.2 5.3 -5-2.8 -5 2.8 1.2 -5.3 -4 -3.6 5.4 -.6 Z" fill="#ffd36e"/>${face(54, 58, 9, 0.9)}`),
    star: () => sv(`<path d="M50 14 L61.2 38.6 L88 41.6 L68.1 59.9 L73.5 86.4 L50 73 L26.5 86.4 L31.9 59.9 L12 41.6 L38.8 38.6 Z" fill="#ffd36e" stroke="#ffd36e" stroke-width="7" stroke-linejoin="round"/>${face(50, 53, 8, 0.8)}`),
  };
  const CAST_IDS = Object.keys(CAST);
  const I = { built: false, agents: [], anims: [], phase: 'idle', skipBeat: false, wake: null, idle: null, rainOn: false };
  const introEl = $('#s-intro');

  // A wait that a presenter's → can cut short.
  function iWait(ms) {
    return new Promise(res => {
      if (I.skipBeat) return res();
      const fin = () => { clearTimeout(t); if (I.wake === fin) I.wake = null; res(); };
      const t = setTimeout(fin, ms);
      I.wake = fin;
    });
  }
  function charify(el) {
    const out = [];
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType !== 3) return walk(c);
      const frag = document.createDocumentFragment();
      for (const ch of c.textContent) {
        if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
        const s = document.createElement('span'); s.className = 'c'; s.textContent = ch;
        frag.appendChild(s); out.push(s);
      }
      c.replaceWith(frag);
    });
    walk(el);
    return out;
  }

  // Letter strokes as lines/arcs, sampled into evenly spaced agent seats.
  function letterSegs(ch, x, y, w, h) {
    const L = (x1, y1, x2, y2) => ({ a: [x1, y1], b: [x2, y2] });
    if (ch === 'O') return [{ cx: x + w / 2, cy: y + h / 2, rx: w / 2 - 8, ry: h / 2 - 4, a0: 0, a1: Math.PI * 2 }];
    if (ch === 'K') return [L(x + 12, y, x + 12, y + h), L(x + w - 6, y, x + 42, y + h * 0.52), L(x + 74, y + h * 0.43, x + w, y + h)];
    return [ // R
      L(x + 12, y, x + 12, y + h), L(x + 12, y, x + w * 0.55, y),
      { cx: x + w * 0.55, cy: y + h * 0.26, rx: w * 0.4, ry: h * 0.26, a0: -Math.PI / 2, a1: Math.PI / 2 },
      L(x + w * 0.55, y + h * 0.52, x + 12, y + h * 0.52), L(x + w * 0.45, y + h * 0.52, x + w, y + h),
    ];
  }
  function sampleSegs(segs, sp) {
    const pts = [];
    const push = (px, py) => { if (!pts.some(([qx, qy]) => Math.hypot(qx - px, qy - py) < sp * 0.72)) pts.push([px, py]); };
    segs.forEach(s => {
      if (s.a) {
        const n = Math.max(1, Math.round(Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) / sp));
        for (let i = 0; i <= n; i++) push(s.a[0] + (s.b[0] - s.a[0]) * i / n, s.a[1] + (s.b[1] - s.a[1]) * i / n);
      } else {
        const closed = s.a1 - s.a0 >= Math.PI * 2 - 1e-6;
        let len = 0;
        for (let i = 0; i < 64; i++) {
          const t0 = s.a0 + (s.a1 - s.a0) * i / 64, t1 = s.a0 + (s.a1 - s.a0) * (i + 1) / 64;
          len += Math.hypot(s.rx * (Math.cos(t1) - Math.cos(t0)), s.ry * (Math.sin(t1) - Math.sin(t0)));
        }
        const n = Math.max(2, Math.round(len / sp));
        for (let i = 0; i < (closed ? n : n + 1); i++) {
          const t = s.a0 + (s.a1 - s.a0) * i / n;
          push(s.cx + s.rx * Math.cos(t), s.cy + s.ry * Math.sin(t));
        }
      }
    });
    return pts;
  }
  function buildAgents() {
    const WORD = 'KOKORO', W = { K: 165, O: 200, R: 165 }, H = 240, GAP = 48, TOP = 300, SP = 33;
    let x = (1600 - [...WORD].reduce((s, c) => s + W[c], 0) - GAP * (WORD.length - 1)) / 2;
    const seats = [];
    for (const ch of WORD) { seats.push(...sampleSegs(letterSegs(ch, x, TOP, W[ch], H), SP)); x += W[ch] + GAP; }
    const box = $('#iWord');
    I.agents = seats.map(([tx, ty], i) => {
      const el = document.createElement('div');
      el.className = 'ag';
      el.style.setProperty('--d', (tx / 1600 * 1.3).toFixed(2) + 's');
      el.innerHTML = `<div class="ag-h"><div class="ag-i">${CAST[CAST_IDS[(i * 5) % CAST_IDS.length]]()}</div></div>`;
      el.addEventListener('mouseenter', () => hop(el));
      el.addEventListener('click', e => { e.stopPropagation(); hop(el); heart(el); });
      box.appendChild(el);
      return { el, tx, ty, rot: Math.random() * 24 - 12 };
    });
    I.built = true;
  }
  function formWord() {
    I.anims = I.agents.map(a => {
      const ang = Math.random() * Math.PI * 2;
      const sx = 800 + Math.cos(ang) * 1150, sy = 450 + Math.sin(ang) * 820;
      const mx = sx + (a.tx - sx) * 0.62, my = sy + (a.ty - sy) * 0.62 - 170;
      const delay = (a.tx - 130) / 1340 * 1100 + Math.random() * 260;
      const anim = a.el.animate([
        { transform: `translate(${sx}px,${sy}px) rotate(${a.rot * 6}deg) scale(.6)`, opacity: 1 },
        { transform: `translate(${mx}px,${my}px) rotate(${a.rot * 2}deg) scale(1.15)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${a.tx}px,${a.ty}px) rotate(${a.rot}deg) scale(1)`, opacity: 1 },
      ], { duration: 950 + Math.random() * 300, delay, easing: 'cubic-bezier(.25,.7,.35,1)', fill: 'both' });
      anim.onfinish = () => a.el.classList.add('landed');
      return anim;
    });
  }
  function hop(el) {
    if (!el.classList.contains('landed')) return;
    el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop');
  }
  function heart(el) {
    const a = I.agents.find(g => g.el === el), h = document.createElement('div');
    h.className = 'iheart'; h.textContent = '💗';
    h.style.left = a.tx + 'px'; h.style.top = (a.ty - 46) + 'px';
    $('#iWord').appendChild(h);
    setTimeout(() => h.remove(), 1400);
  }
  function startIdle() {
    clearInterval(I.idle);
    I.idle = setInterval(() => {
      const a = I.agents[(Math.random() * I.agents.length) | 0];
      hop(a.el);
      if (Math.random() < 0.35) heart(a.el);
    }, 600);
  }

  const rainCtx = $('#iRain').getContext('2d');
  const drops = Array.from({ length: 170 }, () => ({ x: Math.random() * 1700, y: Math.random() * 900, l: 12 + Math.random() * 26, v: 9 + Math.random() * 10, a: 0.04 + Math.random() * 0.14 }));
  function rain() {
    if (!I.rainOn) return;
    rainCtx.clearRect(0, 0, 1600, 900);
    rainCtx.lineWidth = 1.2;
    drops.forEach(d => {
      d.y += d.v; d.x -= d.v * 0.18;
      if (d.y > 920) { d.y = -40; d.x = Math.random() * 1700; }
      rainCtx.strokeStyle = `rgba(170,180,230,${d.a})`;
      rainCtx.beginPath(); rainCtx.moveTo(d.x, d.y); rainCtx.lineTo(d.x - d.l * 0.18, d.y + d.l); rainCtx.stroke();
    });
    I.raf = requestAnimationFrame(rain);
  }

  function resetIntro() {
    introEl.classList.add('instant'); introEl.classList.remove('lit');
    I.anims.forEach(a => a.cancel()); I.anims = [];
    clearInterval(I.idle);
    I.agents.forEach(a => a.el.classList.remove('landed', 'hop'));
    $$('#iWord .iheart').forEach(h => h.remove());
    introEl.classList.remove('final');
    $('#iMeet').classList.remove('in'); $('#iTag').classList.remove('in'); $('#iNight').classList.remove('on', 'swell');
    const q = $('#iq'); q.className = 'iq'; q.innerHTML = '';
    I.skipBeat = false; I.phase = 'idle';
    void introEl.offsetWidth; introEl.classList.remove('instant');
  }
  function introFinal() {
    resetIntro();
    introEl.classList.add('instant', 'lit', 'final');
    $('#iMeet').classList.add('in'); $('#iTag').classList.add('in');
    formWord(); I.anims.forEach(a => a.finish());
    void introEl.offsetWidth; introEl.classList.remove('instant');
    I.phase = 'done'; startIdle();
  }
  async function playIntro(tok) {
    resetIntro();
    I.phase = 'dark';
    cancelAnimationFrame(I.raf); I.rainOn = true; rain();
    await iWait(900);
    const q = $('#iq');
    for (let i = 0; i < IQ.length; i++) {
      if (!alive(tok)) return;
      const last = i === IQ.length - 1;
      I.skipBeat = false;
      q.className = 'iq' + (last ? ' soft' : '');
      q.innerHTML = IQ[i];
      const chars = charify(q);
      for (const c of chars) {
        if (I.skipBeat || !alive(tok)) break;
        c.classList.add('on');
        await iWait(c.textContent === '…' ? 420 : c.textContent === ',' ? 260 : 45);
      }
      chars.forEach(c => c.classList.add('on'));
      if (last) $('#iNight').classList.add('on');
      await iWait(last ? 650 : 1800);
      if (!alive(tok)) return;
      if (!last) { q.classList.add('out'); await sleep(700); }
    }
    // the nightlight swells, then bursts into daylight
    I.skipBeat = false; I.phase = 'light';
    $('#iNight').classList.add('swell');
    await iWait(700);
    if (!alive(tok)) return;
    introEl.classList.add('lit'); q.classList.add('out');
    await iWait(600);
    if (!alive(tok)) return;
    $('#iMeet').classList.add('in');
    await iWait(200);
    if (!alive(tok)) return;
    formWord();
    if (I.skipBeat) I.anims.forEach(a => a.finish());
    await Promise.all(I.anims.map(a => a.finished.catch(() => {})));
    if (!alive(tok)) return;
    I.rainOn = false;
    $('#iTag').classList.add('in');
    I.phase = 'done'; startIdle();
  }
  hooks['s-intro'] = {
    enter(skip) {
      if (!I.built) buildAgents();
      if (skip || matchMedia('(prefers-reduced-motion: reduce)').matches) introFinal();
      else playIntro(SEQ);
    },
    next() {
      if (I.phase !== 'dark' && I.phase !== 'light') return false;
      I.skipBeat = true; I.wake?.();
      if (I.phase === 'light') I.anims.forEach(a => a.finish());
      return true;
    },
    leave() { I.rainOn = false; clearInterval(I.idle); I.anims.forEach(a => a.cancel()); I.anims = []; I.phase = 'idle'; },
  };

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
  // Plays by itself once all four companions are awake.
  const SUMMON_CHAT = [
    ['mizuki', "Wait… you've all been with me this whole time?"],
    ['bottle', 'Every single day! We just couldn’t say hi until now.'],
    ['mizuki', 'My bag feels… really heavy today.'],
    ['bag', "Heavy, huh? Want to tell me what's inside? I'm listening."],
    ['pencil', "You're not alone anymore!"],
  ];
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
    $('#objChips').insertAdjacentHTML('beforeend', '<button class="chip more" id="moreChip">➕ Anything she carries · no limit</button>');
    $$('#objChips .chip[data-id]').forEach(c => c.addEventListener('click', () => selectObj(c.dataset.id)));
    $('#moreChip').addEventListener('click', () => { $('#scanStatus').textContent = 'Umbrella, headphones, keychain… anything ✨'; });
    $('#shutter').addEventListener('click', capture);
    selectObj('bottle');
  }
  function selectObj(id) {
    S.sel = id;
    $('#photoObj').src = `photos/${id}.jpg`;
    $('#photoObj').classList.toggle('gone', S.captured.includes(id));
    $$('#objChips .chip').forEach(c => { c.classList.toggle('sel', c.dataset.id === id); c.classList.toggle('done', S.captured.includes(c.dataset.id)); });
    $('#scanStatus').textContent = S.captured.includes(id) ? `${DEFS[id].name} is already awake ✨` : `Point at Mizuki's ${DEFS[id].object.toLowerCase()}`;
  }
  function showCard(av) {
    const d = av.def;
    $('#compCard').innerHTML = `<div class="cc-name">${d.name}<span class="jp">${d.jp}</span></div>
      <span class="cc-dom" style="background:${d.color}">Looks after: ${d.domain}</span>
      <div class="cc-row">📦 Object: ${d.object}</div><div class="cc-row">👀 Notices: ${d.looks}</div><div class="cc-row">🤖 Agent #${ORDER.indexOf(d.id) + 1} · no limit, add more anytime</div>`;
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
      if (nxt) selectObj(nxt);
      else { $('#scanStatus').textContent = 'All awake! Snap anything else ✨'; if (alive(tok)) summonChat(tok); }
    } finally { phone.classList.remove('scanning', 'flashing'); S.busy = false; }
  }
  async function summonChat(tok) {
    if (S.talking) return;
    S.talking = true;
    try {
      await sleep(600);
      for (const [who, line] of SUMMON_CHAT) {
        if (!alive(tok)) return;
        if (who === 'mizuki') await mizukiSay($('#summonMz'), line, tok);
        else { S.av[who].poke(0.6); await avSay(S.stage, S.av[who], line, tok); }
        await sleep(250);
      }
      if (alive(tok)) ORDER.forEach((id, i) => setTimeout(() => S.av[id].celebrate(), i * 150));
    } finally { S.talking = false; }
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
  // The nightly meeting plays by itself: notice → share → see the pattern → ask, with consent.
  // [speaker, line, signal that turns worried after the line]
  const MEETING = [
    ['glasses', "Okay everyone, it's ten o'clock. Tonight's council is open!"],
    ['pencil', 'Yay, meeting time!'],
    ['bottle', "I'll start. Mizuki drank a lot less at lunch this week.", 'bottle'],
    ['bag', 'Hm… maybe it was just a hot day?'],
    ['glasses', "But she hasn't opened a book in four days. That's not like her.", 'glasses'],
    ['bag', '…Okay. We left home late three days in a row.', 'bag'],
    ['pencil', "And she hasn't talked about a single friend since Monday.", 'pencil'],
    ['glasses', "One of us worried is just a bad day. All four of us? That's a pattern."],
    ['bottle', "But we can't tell anyone without asking her first."],
    ['bag', "Right. We don't report her. We ask her."],
    ['morning'],
    ['bag', "Mizuki, we're all a bit worried. Want us to come with you to see Ms. Sato?"],
    ['mizuki', '…Okay. Will you come with me?'],
    ['all', 'Always!'],
  ];
  const C = { stage: null, av: {}, worried: {}, lines: [], running: false, consented: false, skip: false, wake: null };
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
    $$('#signals .sig').forEach(b => b.addEventListener('click', () => {
      if (C.running) return;
      C.consented = false; setWorried(b.dataset.id, !C.worried[b.dataset.id]);
    }));
    $('#councilReplay').addEventListener('click', () => { cancelSeq(); runMeeting(SEQ); });
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
    else if (n === 2) { cls = 'y'; title = '🟡 Early pattern'; body = `${n} companions agree. Suggest a small step or a VR practice.`; }
    else { cls = 'r'; title = '🔴 Strong pattern'; body = `${n} companions agree. Ask Mizuki if she'd like help reaching an adult.`; }
    if (C.consented && n >= 2) { cls = 'g'; title = '🟢 Getting help, together'; body = '<span class="consent">✅ Mizuki said yes → school counselor contacted, with her consent.</span>'; }
    v.className = 'verdict ' + cls;
    v.innerHTML = `<span class="vt">${title}</span>${body}`;
  }
  // A wait that → can cut short.
  const cWait = p => C.skip ? Promise.resolve() : Promise.race([p, new Promise(r => { C.wake = r; })]);
  function minute(who, text) {
    const name = who === 'mizuki' ? 'Mizuki' : who === 'all' ? 'Everyone' : DEFS[who].name;
    const color = DEFS[who] ? DEFS[who].color : '#ff8fab';
    $('#minutes').insertAdjacentHTML('beforeend', `<div class="m-line"><b style="color:${color}">${name}</b>${text}</div>`);
  }
  // listeners turn partway toward whoever is talking
  function faceToward(id) {
    ORDER.forEach((o, i) => {
      const av = C.av[o];
      if (!id || id === o) { av.baseRot = CPOS[i][2]; return; }
      const [sx, sz] = CPOS[ORDER.indexOf(id)], [x, z] = CPOS[i];
      av.baseRot = Math.max(-1, Math.min(1, Math.atan2(sx - x, sz - z) * 0.55));
    });
  }
  function setMorning(m) {
    $('#councilWrap').classList.toggle('morning', m);
    $('#meetClock').textContent = m ? '☀️ Next morning · 07:30' : "🌙 Tonight's council · 22:00";
  }
  function resetMeeting() {
    C.skip = false; C.consented = false;
    ORDER.forEach(id => setWorried(id, false));
    $('#minutes').innerHTML = '';
    setMorning(false); faceToward(null);
    $('.meet-head').classList.remove('done');
    $('#councilMz').classList.remove('show');
    C.stage.hideBubbles();
    renderVerdict('🌙 Council in session');
  }
  function consentAll() {
    C.consented = true;
    ORDER.forEach(id => { C.av[id].celebrate(); C.stage.bubble(C.av[id], 'Always! 💗', 2600); setWorried(id, true); });
  }
  function finishMeeting(instant) {
    if (instant) {
      Voice.stop(); C.stage.hideBubbles(); $('#councilMz').classList.remove('show');
      $('#minutes').innerHTML = '';
      MEETING.forEach(([w, t]) => { if (w !== 'morning') minute(w, t); });
      consentAll();
    }
    setMorning(true); faceToward(null);
    $('.meet-head').classList.add('done');
  }
  async function runMeeting(tok) {
    resetMeeting();
    C.running = true;
    try {
      await cWait(sleep(1000));
      for (const [who, text, flag] of MEETING) {
        if (!alive(tok) || C.skip) break;
        if (who === 'morning') { setMorning(true); await cWait(sleep(1300)); continue; }
        minute(who, text);
        if (who === 'mizuki') { faceToward(null); await cWait(mizukiSay($('#councilMz'), text, tok)); }
        else if (who === 'all') { consentAll(); await cWait(Voice.say(text, DEFS.pencil)); }
        else { faceToward(who); C.av[who].poke(0.5); await cWait(avSay(C.stage, C.av[who], text, tok, flag ? 'signal' : '', 900)); }
        if (flag && !C.skip) setWorried(flag, true);
        await cWait(sleep(350));
      }
      if (alive(tok)) finishMeeting(C.skip);
    } finally { C.running = false; }
  }
  hooks['s-council'] = {
    enter(skip) {
      if (!C.stage) initCouncil();
      C.stage.resize(); C.stage.active = true;
      if (skip) { resetMeeting(); finishMeeting(true); } else runMeeting(SEQ);
    },
    next() {
      if (!C.running) return false;
      C.skip = true; C.wake?.();
      return true;
    },
    leave() { if (C.stage) { C.stage.active = false; C.stage.hideBubbles(); Object.values(C.av).forEach(a => a.setTalking(false)); } $('#councilMz').classList.remove('show'); },
  };

  /* ================= 5 · Respond / Rehearse / Watch / Build ================= */
  $$('#respTabs .tab').forEach(t => t.addEventListener('click', () => {
    cancelSeq();
    $$('#respTabs .tab').forEach(x => x.classList.toggle('on', x === t));
    $$('#s-respond .pane').forEach(p => p.classList.toggle('on', p.id === t.dataset.tab));
    if (t.dataset.tab === 't-rehearse') startVR(); else stopVR();
  }));
  const CLASSES = [
    ['1-A', '☀️', 'Sunny'], ['1-B', '☀️', 'Sunny'], ['1-C', '🌤️', 'Mostly sunny'], ['1-D', '☀️', 'Sunny'],
    ['2-A', '🌤️', 'Mostly sunny'], ['2-B', '☁️', 'Cloudy · worry signals ↑', 'cloudy'], ['2-C', '☀️', 'Sunny'], ['2-D', '🌤️', 'Mostly sunny'],
    ['3-A', '⛅', 'Exam stress ↑'], ['3-B', '🌤️', 'Mostly sunny'], ['3-C', '☀️', 'Sunny'], ['3-D', '🌤️', 'Mostly sunny'],
  ];
  $('#dashGrid').innerHTML = CLASSES.map(([n, w, d, c]) => `<div class="cls ${c || ''}"><div class="w">${w}</div><div><div class="cn">${n}</div><div class="cd">${d}</div></div></div>`).join('');

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

  /* ----- Rehearse in VR: first-person headset view, choose what to say ----- */
  const VR_CHOICES = [
    { id: 'quiet', label: '😶 (say nothing)', say: '…', courage: 20, reply: ['glasses', "That's okay. Let's try a smaller step."] },
    { id: 'fine', label: '🙂 “I’m fine.”', say: "Um… I'm fine.", courage: 35,
      teacher: 'Okay… let me know if you ever need anything.', reply: ['pencil', "That's okay! Let's try again. You can do it!"] },
    { id: 'ask', label: '💬 “Can I talk to you? I’m not okay.”', say: "Ms. Sato… can I talk to you? I'm not okay.", courage: 100,
      teacher: "Thank you for telling me, Mizuki. Let's talk. You're not alone.", win: true },
  ];
  // companions float beside Mizuki: [x, z, facing]
  const VPOS = { glasses: [-3.5, 0.3, 0.6], bottle: [-2.4, 1.4, 0.4], bag: [2.4, 1.4, -0.4], pencil: [3.5, 0.3, -0.6] };
  const VR = { stage: null, sato: null, av: {}, running: false, closeT: 0, close: 0, pickR: null };

  function buildRoom(scene) {
    const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.9 }, o));
    const box = (w, h, d, c, x, y, z, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, o)); m.position.set(x, y, z); scene.add(m); return m; };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), M(0xc99a74));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    box(16, 8, 0.2, 0xf1d2bd, 0, 4, -3.4);                      // back wall
    box(0.2, 8, 16, 0xe6c3ad, -5.6, 4, 0);                       // side walls
    box(0.2, 8, 16, 0xe6c3ad, 5.6, 4, 0);
    box(16, 0.3, 0.1, 0xa87a58, 0, 0.15, -3.25);                 // skirting
    box(1.9, 3.5, 0.12, 0xc79a74, 1.9, 1.75, -3.25);             // door
    box(1.5, 3.1, 0.06, 0xe0b48c, 1.9, 1.65, -3.17);
    box(0.12, 0.12, 0.2, 0xe2b24a, 1.3, 1.7, -3.1);              // handle
    box(2.4, 1.8, 0.06, 0xbfe4ff, -2.6, 3.2, -3.27, { emissive: 0x9fd2ff, emissiveIntensity: 0.55 });  // window
    box(2.6, 0.12, 0.2, 0xffffff, -2.6, 2.25, -3.2); box(0.08, 1.8, 0.1, 0xffffff, -2.6, 3.2, -3.2);
    box(2.4, 1.0, 1.1, 0xb98a63, -2.6, 0.5, -2.3);               // desk + books
    box(0.5, 0.3, 0.7, 0x9ad8ff, -3.2, 1.15, -2.3); box(0.5, 0.22, 0.7, 0xff8fab, -3.2, 1.41, -2.3);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.25, 0.6, 20), M(0xff9f68)); pot.position.set(4.4, 0.3, -2.6); scene.add(pot);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 14), M(0x6fd6a0)); leaves.position.set(4.4, 1.05, -2.6); scene.add(leaves);
    // door sign
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
    const g = cv.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 128);
    g.fillStyle = '#2b2140'; g.font = '800 54px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText("Counselor's room", 256, 66);
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.42), new THREE.MeshBasicMaterial({ map: tex }));
    sign.position.set(1.9, 3.85, -3.15); scene.add(sign);
    const sun = new THREE.PointLight(0xfff1d6, 0.6, 14); sun.position.set(-2.6, 3.4, -1.5); scene.add(sun);
  }
  function initVR() {
    const st = VR.stage = new Stage3D($('#vrCanvas'), $('#vrOverlay'), {
      r: 7.4, phi: 1.52, theta: 0.04, target: [0.4, 2.45, -1.6], fov: 52, ground: false,
      onPoke: av => {
        if (av !== VR.sato) return pokeReact(st, av);
        st.bubble(av, 'Hello, Mizuki. Take your time.', 1800);
        if (!Voice.speaking) { av.setTalking(true); Voice.say('Hello, Mizuki. Take your time.', 'teacher').then(() => av.setTalking(false)); }
      },
    });
    st.hemi.intensity = 0.6; st.key.intensity = 0.55;
    buildRoom(st.scene);
    VR.sato = st.add(new Avatar('sato'), 0.5, -1.7, -0.1);
    ORDER.forEach(id => {
      const [x, z, r] = VPOS[id], av = VR.av[id] = st.add(new Avatar(id), x, z, r);
      av.root.position.y = 0.5; av.shadow.visible = false; av.root.scale.setScalar(0.75);
    });
    // gentle head sway; step closer to the door once she asks
    const base = { ...st.orbit };
    st.onTick = (dt, t) => {
      VR.close += (VR.closeT - VR.close) * Math.min(1, dt * 1.1);
      st.orbit.r = base.r - VR.close * 1.7;
      st.orbit.theta = base.theta + Math.sin(t * 0.5) * 0.03;
      st.orbit.phi = base.phi + Math.sin(t * 0.37) * 0.012;
    };
    $('#vrChoices').innerHTML = VR_CHOICES.map(c => `<button class="vr-choice" data-id="${c.id}">${c.label}</button>`).join('');
    $$('#vrChoices .vr-choice').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); pickChoice(b.dataset.id); }));
    $('#vrPlay').addEventListener('click', startVR);
  }
  function setCourage(v) { $('#vrCourage').style.width = v + '%'; }
  function showChoices(on = true) {
    $('#vrChoices').classList.toggle('show', on);
    if (on) $$('#vrChoices .vr-choice').forEach(b => b.classList.remove('picked', 'gaze'));
  }
  async function youSay(text, tok) {
    const sub = $('#vrSub');
    $('span', sub).textContent = text; sub.classList.add('show');
    await Voice.say(text, 'mizuki');
    if (alive(tok)) await sleep(500);
    sub.classList.remove('show');
  }
  async function satoSay(text, tok) {
    const b = VR.stage.bubble(VR.sato, text);
    VR.sato.setTalking(true);
    await Voice.say(text, 'teacher');
    VR.sato.setTalking(false);
    clearTimeout(b._t);
    b._t = setTimeout(() => b.classList.remove('show'), alive(tok) ? 2200 : 0);
  }
  // In the auto demo the "gaze" settles on a choice; a click picks immediately.
  function waitChoice(autoId, ms) {
    showChoices();
    return new Promise(res => {
      const gaze = setTimeout(() => $(`#vrChoices .vr-choice[data-id="${autoId}"]`).classList.add('gaze'), ms - 1000);
      const auto = setTimeout(() => done(autoId), ms);
      const done = id => { clearTimeout(gaze); clearTimeout(auto); VR.pickR = null; res(id); };
      VR.pickR = done;
    });
  }
  function pickChoice(id) {
    if (VR.pickR) return VR.pickR(id);
    if (VR.running) return;
    cancelSeq();
    const tok = SEQ;
    VR.running = true;
    playBranch(id, tok).finally(() => { VR.running = false; if (alive(tok)) showChoices(); });
  }
  async function playBranch(id, tok) {
    const c = VR_CHOICES.find(x => x.id === id);
    $$('#vrChoices .vr-choice').forEach(b => b.classList.toggle('picked', b.dataset.id === id));
    await sleep(350);
    showChoices(false);
    $('#vrMsg').classList.remove('show');
    VR.closeT = 0;
    await youSay(c.say, tok);
    if (!alive(tok)) return false;
    setCourage(c.courage);
    if (c.win) VR.closeT = 1;
    if (c.teacher) { VR.sato.poke(0.4); await satoSay(c.teacher, tok); }
    if (!alive(tok)) return false;
    if (c.win) {
      ORDER.forEach((oid, i) => setTimeout(() => { VR.av[oid].celebrate(); VR.stage.bubble(VR.av[oid], i % 2 ? 'You did it! 🎉' : 'Yay! 💗', 2400); }, i * 120));
      confetti();
      $('#vrStep3').className = 'st done'; $('#vrStep3').textContent = '⭐⭐⭐ Counselor ✓';
      $('#vrMsg').classList.add('show');
      Voice.say('You did it!', DEFS.pencil);
    } else {
      const [who, line] = c.reply;
      VR.av[who].poke(0.6);
      await avSay(VR.stage, VR.av[who], line, tok);
    }
    return !!c.win;
  }
  async function headsetOn(tok) {
    const sc = $('#vrScene');
    sc.classList.add('stereo'); VR.stage.stereo = true;
    $('#vrHeadset').classList.add('show');
    await sleep(1700);
    if (!alive(tok)) return;
    sc.classList.add('blink'); await sleep(260);
    VR.stage.stereo = false; sc.classList.remove('stereo'); $('#vrHeadset').classList.remove('show');
    await sleep(60); sc.classList.remove('blink');
  }
  function resetVR() {
    VR.pickR = null; VR.closeT = 0; setCourage(0); showChoices(false);
    $('#vrMsg').classList.remove('show'); $('#vrSub').classList.remove('show'); $('#confetti').innerHTML = '';
    $('#vrStep3').className = 'st now'; $('#vrStep3').textContent = '⭐⭐⭐ Counselor';
    VR.stage.hideBubbles();
  }
  async function runVR(tok) {
    resetVR();
    VR.running = true;
    try {
      await headsetOn(tok);
      await sleep(300);
      if (!alive(tok)) return;
      VR.av.glasses.poke(0.6);
      await avSay(VR.stage, VR.av.glasses, 'Ready? Ms. Sato is right there. Just one sentence.', tok);
      // most kids say "I'm fine" first; then she tries again
      for (const auto of ['fine', 'ask']) {
        if (!alive(tok)) return;
        const id = await waitChoice(auto, 3200);
        if (!alive(tok)) return;
        if (await playBranch(id, tok)) break;
        await sleep(400);
      }
    } finally {
      if (alive(tok)) { VR.running = false; showChoices(); }
    }
  }
  function startVR() {
    if (!VR.stage) initVR();
    VR.stage.resize(); VR.stage.active = true;
    cancelSeq(); VR.running = false;
    runVR(SEQ);
  }
  function stopVR() {
    if (!VR.stage) return;
    VR.stage.active = false; VR.stage.stereo = false; VR.pickR = null; VR.running = false;
    $('#vrScene').classList.remove('stereo', 'blink'); $('#vrHeadset').classList.remove('show');
    VR.stage.hideBubbles(); Object.values(VR.av).forEach(a => a.setTalking(false)); VR.sato.setTalking(false);
  }
  hooks['s-respond'] = {
    enter() { if ($('#t-rehearse').classList.contains('on')) startVR(); },
    leave() { stopVR(); },
  };

  /* ================= 6 · Compare: research figure popover ================= */
  const pop = $('#figPop');
  $$('#cmpTable tbody td.res').forEach(cell => {
    const tr = cell.closest('tr');
    cell.addEventListener('mouseenter', () => {
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
    cell.addEventListener('mouseleave', () => pop.classList.remove('show'));
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

  /* ================= 8 · Social impact: one child, then zoom out ================= */
  const IMP = { phase: 1, timers: [] };
  function setImpact(phase, instant) {
    const sl = $('#s-impact'), nodes = $$('#s-impact .gnode'), walker = $('#impWalker');
    IMP.phase = phase;
    IMP.timers.forEach(clearTimeout); IMP.timers = [];
    const at = i => { walker.style.left = `calc((100% - 70px) * ${(i + 0.5) / 6} + ${14 * i}px)`; };
    sl.classList.toggle('instant', !!instant);
    nodes.forEach(n => n.classList.remove('in'));
    at(0);
    sl.classList.toggle('phase2', phase === 2);
    if (phase !== 2) return;
    // Mizuki walks the path as each step of the growth appears
    nodes.forEach((n, i) => IMP.timers.push(setTimeout(() => { n.classList.add('in'); at(i); }, instant ? 0 : 450 + i * 560)));
    if (instant) requestAnimationFrame(() => sl.classList.remove('instant'));
  }
  hooks['s-impact'] = {
    enter(skip) { setImpact(skip ? 2 : 1, skip); },
    next() { if (IMP.phase === 1) { setImpact(2); return true; } return false; },
    leave() { IMP.timers.forEach(clearTimeout); },
  };

  /* ================= 9 · Finale: the companions cheer Mizuki to the counselor's door ================= */
  const E = { stage: null, mz: null, av: {}, door: null, timers: [], idle: null, walking: false, arrived: false, open: 0, flare: 0 };
  const DOOR = { x: 4.6, z: -2 }, MZ_FROM = [-6.2, 0.3], MZ_TO = [3.6, -0.7];
  const CHEER_POS = { pencil: [-4.6, -2.3], bottle: [-2.6, -2.5], glasses: [-0.6, -2.5], bag: [1.5, -2.3] };
  const CHEERS = [['pencil', 'Go, Mizuki!'], ['bottle', "You've got this!"], ['glasses', 'Just one sentence. You can do it!'], ['bag', "We're right behind you!"]];

  function canvasTex(w, h, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    draw(cv.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
  }
  function buildDoor(scene) {
    const g = new THREE.Group(), M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7 }, o));
    const W = 1.6, H = 3.0;
    // light bursting out: soft rays + glow behind the doorway
    const rays = new THREE.Sprite(new THREE.SpriteMaterial({ depthWrite: false, transparent: true, opacity: 0, map: canvasTex(512, 512, (c, w) => {
      c.translate(w / 2, w / 2);
      for (let i = 0; i < 18; i++) {
        c.rotate(Math.PI * 2 / 18 + (i % 3) * 0.03);
        const gr = c.createLinearGradient(0, 0, 0, -w / 2);
        gr.addColorStop(0, 'rgba(255,236,170,.95)'); gr.addColorStop(1, 'rgba(255,236,170,0)');
        c.fillStyle = gr; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-22 - (i % 2) * 14, -w / 2); c.lineTo(22 + (i % 2) * 14, -w / 2); c.lineTo(6, 0); c.fill();
      }
    }) }));
    rays.position.set(0, H / 2, -0.3); rays.scale.setScalar(9); g.add(rays);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ depthWrite: false, transparent: true, opacity: 0, map: canvasTex(256, 256, (c, w) => {
      const gr = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,252,236,1)'); gr.addColorStop(0.35, 'rgba(255,232,170,.75)'); gr.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = gr; c.fillRect(0, 0, w, w);
    }) }));
    glow.position.set(0, H / 2, -0.2); glow.scale.setScalar(5); g.add(glow);
    const opening = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: 0xfff4d2 }));
    opening.position.set(0, H / 2, 0); g.add(opening);
    const wood = M(0x9a6a4a);
    const post = (x) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, H + 0.2, 0.3), wood); b.position.set(x, H / 2 + 0.1, 0); g.add(b); };
    post(-W / 2 - 0.1); post(W / 2 + 0.1);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.24, 0.34), wood); lintel.position.set(0, H + 0.2, 0); g.add(lintel);
    // the door swings open toward us, hinged on the right
    const hinge = new THREE.Group(); hinge.position.set(W / 2, 0, 0.05);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.1), M(0xe2b48a));
    panel.position.set(-W / 2, H / 2, 0); hinge.add(panel);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), M(0xffd36e, { metalness: 0.4, roughness: 0.3 }));
    knob.position.set(-W + 0.2, H / 2, 0.09); hinge.add(knob);
    g.add(hinge);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.46), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(512, 124, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 26); c.fill();
      c.fillStyle = '#2b2140'; c.font = '800 52px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("Counselor's room", w / 2, h / 2 + 3);
    }) }));
    sign.position.set(0, H + 0.62, 0.1); g.add(sign);
    // light spilling across the floor toward Mizuki
    const spill = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0, map: canvasTex(256, 256, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(255,236,170,.95)'); gr.addColorStop(1, 'rgba(255,236,170,0)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(w * 0.32, 0); c.lineTo(w * 0.68, 0); c.lineTo(w, h); c.lineTo(0, h); c.fill();
    }) }));
    spill.rotation.x = -Math.PI / 2; spill.position.set(-0.3, 0.02, 2.75); g.add(spill);
    const light = new THREE.PointLight(0xffd9a0, 0, 10); light.position.set(0, 1.6, 0.8); g.add(light);
    // sparkles drifting out of the doorway
    const N = 46, P = new Float32Array(N * 3), seeds = [];
    for (let i = 0; i < N; i++) seeds.push([(Math.random() - 0.5) * 2.4, Math.random() * 3.4, Math.random() * 1.5, 0.3 + Math.random() * 0.5]);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(P, 3));
    const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffd36e, size: 0.09, transparent: true, opacity: 0, depthWrite: false }));
    g.add(sparks);
    g.position.set(DOOR.x, 0, DOOR.z); g.rotation.y = -0.35;
    scene.add(g);
    return { rays, glow, hinge, spill, light, sparks, P, seeds, sg };
  }
  function finaleTick(dt, t) {
    const d = E.door, mz = E.mz;
    E.open += ((E.doorOpen ? 1 : 0) - E.open) * Math.min(1, dt * 1.6);
    E.flare = Math.max(0, E.flare - dt * 0.8);
    const o = E.open, pulse = 1 + Math.sin(t * 2.2) * 0.04;
    d.hinge.rotation.y = o * 1.2;
    d.rays.material.opacity = o * 0.75; d.rays.material.rotation = t * 0.06; d.rays.scale.setScalar((8 + E.flare * 4) * pulse);
    d.glow.material.opacity = o; d.glow.scale.setScalar((4.6 + E.flare * 3) * pulse);
    d.spill.material.opacity = o * 0.8; d.light.intensity = o * (1.6 + E.flare * 2); d.sparks.material.opacity = o;
    d.seeds.forEach((s, i) => {
      const y = (s[1] + t * s[3]) % 3.6;
      d.P[i * 3] = s[0] + Math.sin(t + i) * 0.15; d.P[i * 3 + 1] = y; d.P[i * 3 + 2] = s[2] + y * 0.25;
    });
    d.sg.attributes.position.needsUpdate = true;
    // Mizuki walks with a bouncy, confident step, angled so we see her face
    if (E.walking) {
      const [x0, z0] = MZ_FROM, [x1, z1] = MZ_TO, len = Math.hypot(x1 - x0, z1 - z0);
      E.k = Math.min(1, E.k + dt * 2.0 / len);
      mz.root.position.set(x0 + (x1 - x0) * E.k, 0, z0 + (z1 - z0) * E.k);
      E.step = (E.step || 0) + dt;
      if (E.step > 0.36) { E.step = 0; mz.poke(0.32); }
      if (E.k >= 1) arrive();
    }
    // the companions keep turning to watch her
    const mx = mz.root.position.x, mzz = mz.root.position.z;
    ORDER.forEach(id => { const a = E.av[id], [x, z] = CHEER_POS[id]; a.baseRot = Math.max(-1.1, Math.min(1.1, Math.atan2(mx - x, mzz - z) * 0.45)); });
  }
  function arrive() {
    E.walking = false; E.arrived = true; E.flare = 1;
    E.mz.baseRot = -0.15; E.mz.celebrate();
    E.stage.bubble(E.mz, "I'm ready. 💪", 3200);
    ORDER.forEach((id, i) => setTimeout(() => { E.av[id].celebrate(); E.stage.bubble(E.av[id], i % 2 ? 'Yay! 💗' : 'We’re so proud of you!', 2600); }, 250 + i * 140));
    E.idle = setInterval(() => { const a = E.stage.avatars[(Math.random() * E.stage.avatars.length) | 0]; a.poke(0.7); }, 1500);
  }
  function startFinale() {
    E.timers.forEach(clearTimeout); clearInterval(E.idle);
    E.stage.hideBubbles();
    E.walking = false; E.arrived = false; E.k = 0; E.flare = 0; E.doorOpen = false; E.open = 0;
    E.mz.root.position.set(...[MZ_FROM[0], 0, MZ_FROM[1]]); E.mz.baseRot = 0.5; E.mz.root.rotation.y = 0.5;
    E.timers = [
      setTimeout(() => { E.doorOpen = true; }, 300),
      setTimeout(() => { E.walking = true; }, 900),
      ...CHEERS.map(([id, line], i) => setTimeout(() => { E.av[id].celebrate(); E.stage.bubble(E.av[id], line, 1900); }, 1200 + i * 1150)),
    ];
  }
  hooks['s-end'] = {
    enter() {
      if (!E.stage) {
        E.stage = new Stage3D($('#endCanvas'), $('#endOverlay'), {
          r: 12, phi: 1.43, theta: -0.05, target: [0.2, 1.35, -0.8], fov: 30, ground: true, groundR: 16,
          onPoke: av => pokeReact(E.stage, av, av === E.mz ? 'Thank you, everyone! 💗' : 'Thank you for listening! 💗'),
        });
        E.door = buildDoor(E.stage.scene);
        ORDER.forEach(id => { const [x, z] = CHEER_POS[id]; const a = E.av[id] = E.stage.add(new Avatar(id), x, z, 0); a.root.scale.setScalar(0.85); });
        E.mz = E.stage.add(new Avatar('mizuki'), MZ_FROM[0], MZ_FROM[1], 0.5);
        E.stage.onTick = finaleTick;
      }
      E.stage.resize(); E.stage.active = true;
      startFinale();
    },
    leave() { if (E.stage) { E.stage.active = false; E.stage.hideBubbles(); } E.timers.forEach(clearTimeout); E.timers = []; clearInterval(E.idle); E.walking = false; E.doorOpen = false; },
  };

  /* ================= boot ================= */
  fillSvgs();
  const start = Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1);
  go(start);
  addEventListener('hashchange', () => { const n = parseInt(location.hash.slice(1), 10); if (n) go(n - 1, true); });
})();
