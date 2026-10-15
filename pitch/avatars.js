/* Kokoro companions: procedural, clay-style 3D avatars (three.js r149, global THREE).
   Each companion = one agent: its own body, face, voice and part of the child's life. */
(function () {
  const T = THREE;
  const INK = 0x2b2140;
  const mat = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0 }, o));

  const DEFS = {
    bottle:  { id: 'bottle',  name: 'Mizu',     jp: 'みず',   object: 'Water bottle', domain: 'Body',    looks: 'energy · sleep · appetite',   color: '#3f8fe8', pitch: 1.75, rate: 1.06 },
    glasses: { id: 'glasses', name: 'Megane',   jp: 'めがね', object: 'Glasses',      domain: 'Study',   looks: 'focus · pressure',            color: '#7d7591', pitch: 1.35, rate: 1.0 },
    bag:     { id: 'bag',     name: 'Kaban',    jp: 'かばん', object: 'School bag',   domain: 'School',  looks: 'getting there · attendance',  color: '#d8394a', pitch: 1.1,  rate: 0.98 },
    pencil:  { id: 'pencil',  name: 'Fude-pon', jp: 'ふでぽん', object: 'Pencil case', domain: 'Friends', looks: 'class · belonging',          color: '#4f7be0', pitch: 1.95, rate: 1.12 },
    // not a companion: the school counselor in the VR rehearsal
    mizuki:  { id: 'mizuki',  name: 'Mizuki',   jp: 'みずき', color: '#e0567a', pitch: 1.2, rate: 0.95 },
    sato:    { id: 'sato',    name: 'Ms. Sato', jp: 'さとう先生', color: '#5b7fd6', pitch: 0.95, rate: 0.95 },
  };

  /* ---------- shared parts ---------- */
  function addFace(parent, o) {
    const s = o.s || 1, gap = o.gap;
    const res = { eyes: [], blush: [], brows: [] };
    const eyeGeo = new T.SphereGeometry(0.1 * s, 20, 16);
    const hlGeo = new T.SphereGeometry(0.03 * s, 10, 8);
    for (const sx of [-1, 1]) {
      const x = sx * gap, y = o.y, z = o.zAt(x, y);
      const eg = new T.Group();
      eg.position.set(x, y, z);
      eg.rotation.y = Math.atan2(x, Math.max(z, 0.01)) * 0.6;
      const e = new T.Mesh(eyeGeo, mat(INK, { roughness: 0.25 }));
      e.scale.set(1, 1.25, 0.55);
      const hl = new T.Mesh(hlGeo, new T.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.set(0.035 * s, 0.055 * s, 0.055 * s);
      const hl2 = new T.Mesh(hlGeo, new T.MeshBasicMaterial({ color: 0xffffff }));
      hl2.scale.setScalar(0.5); hl2.position.set(-0.03 * s, -0.04 * s, 0.05 * s);
      eg.add(e, hl, hl2);
      parent.add(eg); res.eyes.push(eg);

      const bx = sx * (gap + 0.15 * s), by = y - 0.12 * s;
      const b = new T.Mesh(new T.CircleGeometry(0.075 * s, 24),
        new T.MeshBasicMaterial({ color: 0xff7f9f, transparent: true, opacity: 0.55, depthWrite: false }));
      b.position.set(bx, by, o.zAt(bx, by) + 0.012);
      b.rotation.y = Math.atan2(bx, Math.max(o.zAt(bx, by), 0.01));
      b.scale.set(1.25, 0.8, 1);
      parent.add(b); res.blush.push(b);

      const brow = new T.Mesh(new T.CapsuleGeometry(0.018 * s, 0.09 * s, 4, 8), mat(INK));
      brow.position.set(x, y + 0.2 * s, o.zAt(x, y + 0.2 * s) + 0.01);
      brow.rotation.z = Math.PI / 2 + sx * 0.45;
      brow.visible = false;
      parent.add(brow); res.brows.push(brow);
    }
    const my = o.y - 0.15 * s, mz = o.zAt(0, my) + 0.008;
    const smile = new T.Mesh(new T.TorusGeometry(0.05 * s, 0.016 * s, 8, 20, Math.PI), mat(INK));
    smile.position.set(0, my, mz); smile.rotation.z = Math.PI;
    const mouth = new T.Mesh(new T.SphereGeometry(0.06 * s, 16, 12), mat(0x8a2f52, { roughness: 0.4 }));
    mouth.position.set(0, my - 0.01, mz - 0.01); mouth.scale.set(1, 0.01, 0.4); mouth.visible = false;
    parent.add(smile, mouth);
    res.smile = smile; res.mouth = mouth; res.mouthY = my;

    const sweat = new T.Group();
    const drop = new T.Mesh(new T.SphereGeometry(0.06, 14, 10), mat(0x8fd0ff, { roughness: 0.1, transparent: true, opacity: 0.9 }));
    const tip = new T.Mesh(new T.ConeGeometry(0.058, 0.1, 14), drop.material);
    tip.position.y = 0.07;
    sweat.add(drop, tip);
    sweat.position.set(gap + 0.28 * s, o.y + 0.22 * s, o.zAt(gap, o.y) - 0.05);
    sweat.visible = false;
    parent.add(sweat); res.sweat = sweat;
    return res;
  }

  function addFeet(parent, y, gap, color) {
    for (const sx of [-1, 1]) {
      const f = new T.Mesh(new T.SphereGeometry(0.16, 18, 12), mat(color));
      f.scale.set(1, 0.6, 1.3); f.position.set(sx * gap, y, 0.08);
      parent.add(f);
    }
  }

  function addArms(parent, y, x, color) {
    const arms = [];
    for (const sx of [-1, 1]) {
      const pivot = new T.Group();
      pivot.position.set(sx * x, y, 0.05);
      const a = new T.Mesh(new T.CapsuleGeometry(0.075, 0.16, 6, 12), mat(color));
      a.position.y = -0.12;
      pivot.add(a);
      pivot.rotation.z = sx * 0.55;
      pivot.userData.base = sx * 0.55; pivot.userData.sx = sx;
      parent.add(pivot); arms.push(pivot);
    }
    return arms;
  }

  function roundedRectShape(w, h, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  /* ---------- the four companions (colors match the real objects in the phone photos) ---------- */
  function buildBottle(m) {
    // glossy blue metal bottle with a black loop cap
    const R = 0.55, BLUE = 0x3f8fe8;
    m.add(new T.Mesh(new T.CapsuleGeometry(R, 0.9, 10, 32), mat(BLUE, { roughness: 0.22, metalness: 0.15 })));
    const shine = new T.Mesh(new T.CapsuleGeometry(0.06, 0.62, 6, 12), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }));
    shine.position.set(-0.3, 0.05, 0.45); shine.rotation.y = -0.6; m.add(shine);
    const ring = new T.Mesh(new T.CylinderGeometry(0.4, 0.42, 0.1, 32), mat(0xd9dde4, { roughness: 0.2, metalness: 0.7 }));
    ring.position.y = 0.95; m.add(ring);
    const cap = new T.Mesh(new T.CylinderGeometry(0.3, 0.4, 0.34, 32), mat(0x2b2833, { roughness: 0.45 }));
    cap.position.y = 1.15; m.add(cap);
    const loop = new T.Mesh(new T.TorusGeometry(0.15, 0.055, 12, 24), mat(0x2b2833, { roughness: 0.45 }));
    loop.position.y = 1.42; m.add(loop);
    const face = addFace(m, { y: 0.28, gap: 0.2, zAt: (x) => Math.sqrt(Math.max(R * R - x * x, 0)) });
    addFeet(m, -1.02, 0.24, 0x2f74c8);
    const arms = addArms(m, 0.0, 0.56, BLUE);
    return { face, arms, lift: 1.12, head: 1.65 };
  }

  function buildGlasses(m) {
    // soft round buddy wearing big black round frames, temples poking out like ears
    const R = 0.85, SY = 0.95;
    const body = new T.Mesh(new T.SphereGeometry(R, 40, 30), mat(0xf4ebe1));
    body.scale.set(1, SY, 0.95); m.add(body);
    const zAt = (x, y) => R * 0.95 * Math.sqrt(Math.max(1 - (x / R) ** 2 - (y / (R * SY)) ** 2, 0));
    const face = addFace(m, { y: 0.06, gap: 0.3, zAt });
    const frameMat = mat(0x23212a, { roughness: 0.35 });
    for (const sx of [-1, 1]) {
      const x = sx * 0.32, z = zAt(x, 0.06) + 0.06;
      const ring = new T.Mesh(new T.TorusGeometry(0.27, 0.05, 14, 40), frameMat);
      ring.position.set(x, 0.06, z); ring.rotation.y = Math.atan2(x, z) * 0.6;
      m.add(ring);
      const lens = new T.Mesh(new T.CircleGeometry(0.25, 30), new T.MeshBasicMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.22, depthWrite: false }));
      lens.position.copy(ring.position); lens.rotation.copy(ring.rotation); m.add(lens);
      const temple = new T.Mesh(new T.CapsuleGeometry(0.04, 0.42, 6, 10), frameMat);
      temple.rotation.x = Math.PI / 2; temple.position.set(sx * 0.82, 0.1, 0.1); m.add(temple);
    }
    const bridge = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.16, 8), frameMat);
    bridge.rotation.z = Math.PI / 2; bridge.position.set(0, 0.14, zAt(0, 0.14) + 0.06); m.add(bridge);
    const book = new T.Mesh(new T.BoxGeometry(0.34, 0.44, 0.08), mat(0x5b8fe0));
    book.position.set(-0.86, -0.38, 0.3); book.rotation.set(0.1, 0.5, 0.2); m.add(book);
    addFeet(m, -0.78, 0.3, 0x3a3644);
    const arms = addArms(m, -0.15, 0.8, 0xf4ebe1);
    return { face, arms, lift: 0.86, head: 1.25 };
  }

  function buildBag(m) {
    // red leather satchel: darker flap, two strap buckles, thin shoulder strap
    const D = 0.7, BT = 0.12, RED = 0xd8394a, DARK = 0xb32a3a;
    const g = new T.ExtrudeGeometry(roundedRectShape(1.5, 1.4, 0.32), { depth: D, bevelEnabled: true, bevelThickness: BT, bevelSize: 0.1, bevelSegments: 6, curveSegments: 18 });
    g.center();
    m.add(new T.Mesh(g, mat(RED, { roughness: 0.4 })));
    const front = D / 2 + BT;
    const fg = new T.ExtrudeGeometry(roundedRectShape(1.46, 0.78, 0.22), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 14 });
    fg.center();
    const flap = new T.Mesh(fg, mat(DARK, { roughness: 0.4 }));
    flap.position.set(0, 0.38, front + 0.02); m.add(flap);
    const metal = mat(0xdfe2e8, { roughness: 0.2, metalness: 0.7 });
    for (const sx of [-1, 1]) {
      const strap = new T.Mesh(new T.BoxGeometry(0.14, 0.62, 0.04), mat(DARK, { roughness: 0.4 }));
      strap.position.set(sx * 0.42, 0.12, front + 0.09); m.add(strap);
      const buckle = new T.Mesh(new T.TorusGeometry(0.08, 0.022, 8, 4), metal);
      buckle.rotation.z = Math.PI / 4; buckle.position.set(sx * 0.42, 0.06, front + 0.12); m.add(buckle);
    }
    const strapG = new T.Mesh(new T.TorusGeometry(0.72, 0.04, 10, 40, Math.PI), mat(DARK, { roughness: 0.4 }));
    strapG.position.set(0, 0.6, -0.1); strapG.rotation.x = -0.25; m.add(strapG);
    const face = addFace(m, { y: -0.36, gap: 0.24, zAt: () => front });
    addFeet(m, -0.86, 0.38, DARK);
    const arms = addArms(m, -0.1, 0.86, RED);
    return { face, arms, lift: 0.96, head: 1.4 };
  }

  function buildPencil(m) {
    // navy pouch with a colourful school print, red zip, pencils poking out of one end
    const R = 0.5, NAVY = 0x2f5cc8;
    const body = new T.Mesh(new T.CapsuleGeometry(R, 1.1, 10, 32), mat(NAVY, { roughness: 0.7 }));
    body.rotation.z = Math.PI / 2; m.add(body);
    // tiny print: little dots and squares in school colours on the back and sides
    const prints = [0xffd36e, 0xff6f7f, 0xffffff, 0x6fd6a0];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.3, x = -0.72 + (i % 7) * 0.24;
      const y = Math.sin(a) * R * 0.98, z = Math.cos(a) * R * 0.98;
      if (z > 0.2 && Math.abs(y) < 0.3 && Math.abs(x) < 0.45) continue;   // keep the face area clean
      const dot = new T.Mesh(i % 2 ? new T.SphereGeometry(0.045, 8, 6) : new T.BoxGeometry(0.07, 0.07, 0.02), mat(prints[i % 4]));
      dot.position.set(x, y, z); dot.lookAt(x, y * 2, z * 2); m.add(dot);
    }
    const zip = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 1.5, 8), mat(0xe0353f));
    zip.rotation.z = Math.PI / 2; zip.position.set(0, R - 0.01, 0); m.add(zip);
    const pull = new T.Mesh(new T.TorusGeometry(0.075, 0.025, 8, 16), mat(0xe0353f));
    pull.position.set(0.78, R + 0.02, 0.05); m.add(pull);
    [[0xe94b4b, -0.55, 0.78], [0x3fb36b, -0.35, 0.62], [0xa86a3c, -0.75, 0.66]].forEach(([c, rot, len], i) => {
      const pencil = new T.Group();
      const shaft = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, len, 6), mat(c));
      const wood = new T.Mesh(new T.ConeGeometry(0.06, 0.14, 6), mat(0xf5d9b0));
      wood.position.y = len / 2 + 0.07;
      const lead = new T.Mesh(new T.ConeGeometry(0.022, 0.05, 6), mat(c));
      lead.position.y = len / 2 + 0.15;
      pencil.add(shaft, wood, lead);
      pencil.position.set(-0.55 - i * 0.12, 0.6, -0.12 + i * 0.1); pencil.rotation.z = -rot;
      m.add(pencil);
    });
    const face = addFace(m, { y: 0.02, gap: 0.24, zAt: (x, y) => Math.sqrt(Math.max(R * R - y * y, 0)) });
    addFeet(m, -0.5, 0.42, 0x23468f);
    const arms = addArms(m, -0.05, 1.08, NAVY);
    return { face, arms, lift: 0.6, head: 1.35 };
  }

  // Ms. Sato: a soft, chibi-style adult in the same clay look as the companions
  function buildSato(m) {
    const HY = 1.65, HR = 0.6;
    const body = new T.Mesh(new T.CapsuleGeometry(0.6, 0.85, 10, 32), mat(0x8fa9e8));
    m.add(body);
    const shirt = new T.Mesh(new T.SphereGeometry(0.2, 16, 12), mat(0xffffff));
    shirt.scale.set(1.3, 0.8, 0.5); shirt.position.set(0, 0.82, 0.5); m.add(shirt);
    const badge = new T.Mesh(new T.BoxGeometry(0.26, 0.14, 0.04), mat(0xffd36e));
    badge.position.set(0.3, 0.42, 0.58); badge.rotation.y = 0.45; m.add(badge);
    const head = new T.Mesh(new T.SphereGeometry(HR, 40, 30), mat(0xffe2cf));
    head.position.y = HY; m.add(head);
    const hair = new T.Mesh(new T.SphereGeometry(HR + 0.05, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.56), mat(0x4a3640));
    hair.position.set(0, HY + 0.02, -0.04); hair.rotation.x = -0.42; m.add(hair);
    const bun = new T.Mesh(new T.SphereGeometry(0.24, 24, 18), mat(0x4a3640));
    bun.position.set(0, HY + 0.5, -0.36); m.add(bun);
    const face = addFace(m, { y: HY - 0.02, gap: 0.21, zAt: (x, y) => Math.sqrt(Math.max(HR * HR - x * x - (y - HY) * (y - HY), 0)) });
    addFeet(m, -1.02, 0.26, 0x5b4a5e);
    const arms = addArms(m, 0.62, 0.62, 0x8fa9e8);
    return { face, arms, lift: 1.12, head: 3.15 };
  }

  // Mizuki in 3D: sailor uniform, bob haircut, yellow hair clip, a determined (confident) face
  function buildMizuki(m) {
    const HY = 1.25, HR = 0.56, NAVY = 0x2f3f73, SKIN = 0xfde3d3, HAIR = 0x221a2e;
    const top = new T.Mesh(new T.CapsuleGeometry(0.4, 0.35, 10, 28), mat(NAVY));
    top.position.y = 0.2; m.add(top);
    const skirt = new T.Mesh(new T.CylinderGeometry(0.42, 0.62, 0.42, 24), mat(NAVY));
    skirt.position.y = -0.22; m.add(skirt);
    const collar = new T.Mesh(new T.TorusGeometry(0.3, 0.07, 10, 28), mat(0xffffff));
    collar.rotation.x = Math.PI / 2 - 0.25; collar.position.set(0, 0.6, 0.05); m.add(collar);
    const ribbon = new T.Mesh(new T.ConeGeometry(0.11, 0.2, 4), mat(0xe0567a));
    ribbon.rotation.z = Math.PI; ribbon.position.set(0, 0.42, 0.4); m.add(ribbon);
    for (const sx of [-1, 1]) {
      const leg = new T.Mesh(new T.CapsuleGeometry(0.09, 0.32, 6, 10), mat(SKIN));
      leg.position.set(sx * 0.2, -0.62, 0); m.add(leg);
    }
    const head = new T.Mesh(new T.SphereGeometry(HR, 40, 30), mat(SKIN));
    head.position.y = HY; m.add(head);
    const hair = new T.Mesh(new T.SphereGeometry(HR + 0.05, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(HAIR));
    hair.position.set(0, HY + 0.02, -0.03); hair.rotation.x = -0.38; m.add(hair);
    // bob around the sides and back, open at the front so her face shows
    const bob = new T.Mesh(new T.CylinderGeometry(0.6, 0.66, 0.62, 32, 1, true, Math.PI * 0.3, Math.PI * 1.4), mat(HAIR, { side: T.DoubleSide }));
    bob.position.set(0, HY - 0.16, -0.04); m.add(bob);
    const clip = new T.Mesh(new T.BoxGeometry(0.22, 0.07, 0.06), mat(0xffd36e));
    clip.position.set(0.3, HY + 0.38, 0.33); clip.rotation.set(-0.5, 0.4, -0.4); m.add(clip);
    const face = addFace(m, { y: HY - 0.04, gap: 0.19, zAt: (x, y) => Math.sqrt(Math.max(HR * HR - x * x - (y - HY) * (y - HY), 0)) });
    face.brows.forEach((b, i) => { b.visible = true; b.rotation.z = Math.PI / 2 - (i ? 1 : -1) * 0.3; });
    face.smile.scale.set(1.35, 1.35, 1);
    addFeet(m, -0.86, 0.2, 0x3a2a35);
    const arms = addArms(m, 0.42, 0.44, NAVY);
    return { face, arms, lift: 1.02, head: 2.05 };
  }

  const BUILDERS = { mizuki: buildMizuki, bottle: buildBottle, glasses: buildGlasses, bag: buildBag, pencil: buildPencil, sato: buildSato };

  /* ---------- Avatar (one agent) ---------- */
  class Avatar {
    constructor(id) {
      this.def = DEFS[id];
      this.root = new T.Group();
      this.body = new T.Group();
      this.model = new T.Group();
      this.root.add(this.body); this.body.add(this.model);
      const p = BUILDERS[id](this.model);
      Object.assign(this, p);
      this.model.position.y = p.lift;
      this.model.traverse(o => { if (o.isMesh) o.userData.avatar = this; });

      const shadow = new T.Mesh(new T.CircleGeometry(0.85, 32), new T.MeshBasicMaterial({ color: 0x2b2140, transparent: true, opacity: 0.13, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.005; shadow.userData.noSample = true;
      this.root.add(shadow); this.shadow = shadow;
      const halo = new T.Mesh(new T.RingGeometry(0.95, 1.12, 48), new T.MeshBasicMaterial({ color: 0x6fd6b0, transparent: true, opacity: 0.0, depthWrite: false, side: T.DoubleSide }));
      halo.rotation.x = -Math.PI / 2; halo.position.y = 0.01; halo.userData.noSample = true;
      this.root.add(halo); this.halo = halo;

      this.ph = Math.random() * 6;
      this.squish = 0; this.squishV = 0; this.hop = 0; this.hopV = 0;
      this.spinV = 0; this.dragging = false; this.baseRot = 0;
      this.talking = false; this.mood = 'ok'; this.haloTarget = 0; this.haloColor = new T.Color(0x6fd6b0);
      this.nextBlink = 1 + Math.random() * 3; this.blinkT = 0; this.cheer = 0;
    }
    headWorld() { const v = new T.Vector3(0, this.head, 0); return this.root.localToWorld(v); }
    poke(strength = 1) { this.squishV += 5 * strength; this.hopV = 2.6 * strength; }
    celebrate() { this.cheer = 1.6; this.poke(1.1); }
    setTalking(b) { this.talking = b; }
    setMood(m) {
      this.mood = m;
      const w = m === 'worried';
      this.face.brows.forEach(b => b.visible = w);
      this.face.sweat.visible = w;
      this.face.smile.rotation.z = w ? 0 : Math.PI;
      this.face.smile.position.y = this.face.mouthY + (w ? -0.05 : 0);
    }
    setHalo(color) {
      if (color == null) { this.haloTarget = 0; return; }
      this.haloColor.set(color); this.haloTarget = 0.85;
    }
    update(t, dt) {
      // squish spring + hop
      this.squishV += (-this.squish * 140 - this.squishV * 9) * dt;
      this.squish += this.squishV * dt;
      this.hopV -= 14 * dt; this.hop += this.hopV * dt;
      if (this.hop < 0) { this.hop = 0; this.hopV = this.cheer > 0 ? 3.2 : 0; if (this.cheer > 0) this.squishV -= 2; }
      this.cheer = Math.max(0, this.cheer - dt);
      const bob = this.talking ? Math.abs(Math.sin(t * 7)) * 0.05 : Math.abs(Math.sin(t * 2.1 + this.ph)) * 0.05;
      this.body.position.y = bob + this.hop;
      const sq = this.squish * 0.18;
      this.body.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
      this.body.rotation.z = Math.sin(t * 1.6 + this.ph) * 0.03;

      // spin from dragging, ease back to facing front
      if (!this.dragging) {
        this.root.rotation.y += this.spinV * dt;
        this.spinV *= Math.exp(-2.2 * dt);
        if (Math.abs(this.spinV) < 0.6) {
          const r = this.root.rotation.y - this.baseRot;
          const target = this.baseRot + Math.round(r / (Math.PI * 2)) * Math.PI * 2;
          this.root.rotation.y += (target - this.root.rotation.y) * Math.min(1, dt * 2.5);
        }
      }
      const dizzy = Math.abs(this.spinV) > 7;

      // blink
      this.nextBlink -= dt;
      if (this.nextBlink < 0) { this.blinkT = 0.13; this.nextBlink = 2 + Math.random() * 3.5; }
      this.blinkT -= dt;
      const eyeY = dizzy || this.cheer > 0 ? 0.28 : (this.blinkT > 0 ? 0.1 : 1);
      this.face.eyes.forEach(e => { e.scale.y += (eyeY - e.scale.y) * Math.min(1, dt * 30); });

      // talking mouth + arms
      const amp = this.talking ? 0.35 + 0.65 * Math.abs(Math.sin(t * 17 + Math.sin(t * 5) * 2)) : 0;
      this.face.mouth.visible = this.talking || this.cheer > 0;
      this.face.smile.visible = !this.face.mouth.visible;
      this.face.mouth.scale.y = this.cheer > 0 ? 0.9 : amp;
      this.arms.forEach(a => {
        const s = a.userData.sx;
        const wave = this.talking || this.cheer > 0 ? Math.sin(t * 9 + s) * 0.5 + s * 0.9 : Math.sin(t * 2 + this.ph) * 0.08;
        a.rotation.z = a.userData.base + wave;
      });

      // halo
      const m = this.halo.material;
      m.color.lerp(this.haloColor, Math.min(1, dt * 4));
      m.opacity += ((this.haloTarget * (0.75 + 0.25 * Math.sin(t * 4))) - m.opacity) * Math.min(1, dt * 5);
      this.face.sweat.position.y += Math.sin(t * 3) * 0.0008;
    }
  }

  /* ---------- 3D stage: renderer, drag/poke, bubbles, particle "splat" summon ---------- */
  class Stage3D {
    constructor(canvas, overlay, opts = {}) {
      this.canvas = canvas; this.overlay = overlay; this.opts = opts;
      this.renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputEncoding = T.sRGBEncoding;
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(opts.fov || 32, 1, 0.1, 100);
      this.target = new T.Vector3(...(opts.target || [0, 0.9, 0]));
      this.orbit = { theta: opts.theta || 0, phi: opts.phi || 1.32, r: opts.r || 8 };
      this.orbitBase = Object.assign({}, this.orbit);
      this.avatars = []; this.effects = []; this.bubbles = new Map();
      this.active = false; this.t = 0;

      const hemi = new T.HemisphereLight(0xfff4ea, 0xc7b8e8, opts.night ? 0.55 : 0.95);
      this.scene.add(hemi);
      const key = new T.DirectionalLight(0xffffff, opts.night ? 0.35 : 0.85);
      key.position.set(3, 6, 5); this.scene.add(key);
      const rim = new T.DirectionalLight(opts.night ? 0x9fb4ff : 0xffd6e4, 0.5);
      rim.position.set(-4, 3, -4); this.scene.add(rim);
      this.hemi = hemi; this.key = key;

      if (opts.ground !== false) {
        const ground = new T.Mesh(new T.CircleGeometry(opts.groundR || 6, 64),
          new T.MeshStandardMaterial({ color: opts.night ? 0x2a2752 : 0xfbe9df, roughness: 1 }));
        ground.rotation.x = -Math.PI / 2; this.scene.add(ground); this.ground = ground;
      }
      this.ray = new T.Raycaster();
      this._bindPointer();
      this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas);
      this._last = performance.now();
      const loop = (now) => {
        requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - this._last) / 1000); this._last = now;
        if (!this.active) return;
        this.t += dt; this.tick(dt);
      };
      requestAnimationFrame(loop);
    }
    resize() {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      if (!w || !h) return;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    }
    add(av, x = 0, z = 0, rotY = 0) {
      av.root.position.set(x, 0, z); av.root.rotation.y = rotY; av.baseRot = rotY;
      this.scene.add(av.root); this.avatars.push(av); return av;
    }
    _ndc(e) {
      const r = this.canvas.getBoundingClientRect();
      return new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    }
    pick(e) {
      this.ray.setFromCamera(this._ndc(e), this.camera);
      const meshes = [];
      this.avatars.forEach(a => a.root.visible && a.model.traverse(o => o.isMesh && meshes.push(o)));
      const hit = this.ray.intersectObjects(meshes, false)[0];
      return hit ? hit.object.userData.avatar : null;
    }
    _bindPointer() {
      const c = this.canvas;
      let drag = null;
      c.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const av = this.pick(e);
        drag = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: performance.now(), av, moved: 0, v: 0 };
        if (av) { av.dragging = true; av.spinV = 0; }
        c.setPointerCapture(e.pointerId);
        c.style.cursor = 'grabbing';
      });
      c.addEventListener('pointermove', (e) => {
        if (!drag) { c.style.cursor = this.pick(e) ? 'grab' : (this.opts.orbit ? 'move' : 'default'); return; }
        const dx = e.clientX - drag.lx, now = performance.now();
        drag.moved += Math.abs(dx) + Math.abs(e.clientY - drag.y) * 0.1;
        const dts = Math.max(1, now - drag.lt) / 1000;
        if (drag.av) {
          drag.av.root.rotation.y += dx * 0.012;
          drag.v = dx * 0.012 / dts;
          if (drag.moved > 30 && !drag.reacted) { drag.reacted = true; this.opts.onDrag && this.opts.onDrag(drag.av); }
        } else if (this.opts.orbit) {
          this.orbit.theta -= dx * 0.006;
          this.orbit.phi = Math.min(1.5, Math.max(0.75, this.orbit.phi - (e.movementY || 0) * 0.004));
        }
        drag.lx = e.clientX; drag.lt = now;
      });
      const end = (e) => {
        if (!drag) return;
        c.style.cursor = '';
        if (drag.av) {
          drag.av.dragging = false;
          drag.av.spinV = Math.max(-25, Math.min(25, drag.v));
          if (Math.abs(drag.av.spinV) > 9) this.opts.onSpin && this.opts.onSpin(drag.av);
        }
        if (drag.moved < 6 && drag.av) { drag.av.poke(); this.opts.onPoke && this.opts.onPoke(drag.av); }
        drag = null;
      };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
    }
    bubble(av, text, ms, cls = '') {
      let b = this.bubbles.get(av);
      if (!b) {
        b = document.createElement('div'); b.className = 'bubble3d';
        this.overlay.appendChild(b); this.bubbles.set(av, b);
      }
      b.className = 'bubble3d show ' + cls;
      b.innerHTML = `<b style="color:${av.def.color}">${av.def.name}</b>${text}`;
      clearTimeout(b._t);
      if (ms) b._t = setTimeout(() => b.classList.remove('show'), ms);
      return b;
    }
    hideBubbles() { this.bubbles.forEach(b => b.classList.remove('show')); }
    _placeBubbles() {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      this.bubbles.forEach((b, av) => {
        if (!b.classList.contains('show')) return;
        const p = av.headWorld().project(this.camera);
        b.style.left = ((p.x + 1) / 2 * w) + 'px';
        b.style.top = ((1 - p.y) / 2 * h) + 'px';
      });
    }
    /* "Gaussian splat" summon: points fly from the phone and settle into the avatar's surface */
    summon(av, from = [-4, 1.5, 1]) {
      av.root.visible = true; av.root.updateMatrixWorld(true);
      const src = [];
      av.root.traverse(o => {
        if (!o.isMesh || o.userData.noSample || !o.visible) return;
        const pos = o.geometry.attributes.position, col = o.material.color || new T.Color(0xffffff);
        for (let i = 0; i < pos.count; i += 2) src.push([new T.Vector3().fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld), col]);
      });
      const N = 2600, P = new Float32Array(N * 3), C = new Float32Array(N * 3);
      const start = [], end = [], delay = [];
      for (let i = 0; i < N; i++) {
        const [v, c] = src[(Math.random() * src.length) | 0];
        end.push(v.clone().add(new T.Vector3((Math.random() - .5) * .04, (Math.random() - .5) * .04, (Math.random() - .5) * .04)));
        start.push(new T.Vector3(from[0] + (Math.random() - .5) * 1.4, from[1] + (Math.random() - .5) * 2.2, from[2] + (Math.random() - .5) * 0.2));
        delay.push(Math.random() * 0.55);
        C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b;
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(P, 3));
      g.setAttribute('color', new T.BufferAttribute(C, 3));
      const m = new T.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 1, depthWrite: false });
      const pts = new T.Points(g, m); this.scene.add(pts);
      av.root.visible = false;
      let t = 0; const D = 1.7;
      return new Promise(res => {
        this.effects.push((dt) => {
          t += dt;
          for (let i = 0; i < N; i++) {
            const k = Math.min(1, Math.max(0, (t - delay[i]) / (D - 0.55)));
            const e = 1 - Math.pow(1 - k, 3);
            const s = start[i], d = end[i], sw = Math.sin(k * Math.PI) * 0.9;
            P[i * 3] = s.x + (d.x - s.x) * e + Math.cos(i + t * 6) * sw * 0.3;
            P[i * 3 + 1] = s.y + (d.y - s.y) * e + sw * 0.8;
            P[i * 3 + 2] = s.z + (d.z - s.z) * e + Math.sin(i + t * 6) * sw * 0.3;
          }
          g.attributes.position.needsUpdate = true;
          if (t > D && !av.root.visible) { av.root.visible = true; av.body.scale.setScalar(0.7); av.poke(1.3); res(); }
          if (t > D) m.opacity = Math.max(0, 1 - (t - D) / 0.45);
          if (t > D + 0.5) { this.scene.remove(pts); g.dispose(); m.dispose(); return true; }
          return false;
        });
      });
    }
    tick(dt) {
      const o = this.orbit;
      if (this.opts.autoSway) o.theta = this.orbitBase.theta + Math.sin(this.t * 0.3) * 0.12;
      this.camera.position.set(
        this.target.x + o.r * Math.sin(o.phi) * Math.sin(o.theta),
        this.target.y + o.r * Math.cos(o.phi),
        this.target.z + o.r * Math.sin(o.phi) * Math.cos(o.theta));
      this.camera.lookAt(this.target);
      this.avatars.forEach(a => a.update(this.t, dt));
      this.effects = this.effects.filter(f => !f(dt));
      this.onTick && this.onTick(dt, this.t);
      if (this.stereo) this._renderStereo();
      else { this.renderer.render(this.scene, this.camera); this._placeBubbles(); }
    }
    // headset view: one image per eye, side by side, each from a slightly shifted camera
    _renderStereo() {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight, r = this.renderer, cam = this.camera;
      cam.updateMatrixWorld();
      const right = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), base = cam.position.clone();
      cam.aspect = w / 2 / h; cam.updateProjectionMatrix();
      r.setScissorTest(true);
      [-1, 1].forEach((sx, i) => {
        cam.position.copy(base).addScaledVector(right, sx * 0.1);
        r.setViewport(i * w / 2, 0, w / 2, h); r.setScissor(i * w / 2, 0, w / 2, h);
        r.render(this.scene, cam);
      });
      r.setScissorTest(false); r.setViewport(0, 0, w, h);
      cam.position.copy(base); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
  }

  window.Kokoro3D = { DEFS, Avatar, Stage3D };
})();
