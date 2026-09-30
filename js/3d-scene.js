/* ============================================================================
   3D SCENE v2 — "Neural Nexus"
   ----------------------------------------------------------------------------
   A drop-in upgrade for the WebGL hero background (Three.js r128).
   No extra libraries required — bloom post-processing is implemented from
   scratch with raw render targets + shaders.

   WHAT'S NEW vs v1
   ────────────────
   • Custom bloom post-processing (bright-pass → separable gaussian →
     composite with chromatic aberration, vignette & film grain)
   • GPU-animated particle nebula (drift, twinkle, mouse repulsion and a
     click "shockwave" that ripples through the whole field)
   • Living neural mesh: particles are connected by energy lines whose
     pulses travel along them — and the lines follow the exact same GPU
     drift, so they never detach from the particles
   • Rebuilt AI core: simplex-noise plasma core (vertex-displaced),
     fresnel aura, reactive halo sprite, energy wireframe shell with
     flowing light, two gyroscopic energy rings + orbiting data nodes
   • Multi-layer starfield + procedural FBM nebula backdrop
   • Frame-rate independent motion (delta-time + exponential damping) —
     identical speed on 60 / 120 / 144 Hz displays
   • Adaptive quality manager (auto steps bloom / pixel-ratio / counts up
     or down based on measured frame time)
   • Pauses when the tab is hidden, handles context loss, resize is
     debounced, honours prefers-reduced-motion (renders a static frame)
   • Theme aware: adapts colours when <body class="light-mode"> is set

   INTEGRATION (unchanged)
   ───────────────────────
   Keep your markup exactly as-is:
       <canvas id="webgl-canvas"></canvas>
       <script src="js/3d-scene.js" defer> (loaded after Three.js r128)
   Just replace the old file — no other changes needed.
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     Bootstrap
     ========================================================================== */
  function boot() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') {
      console.warn('[3d-scene] WebGL canvas or Three.js not found.');
      return;
    }

    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile =
      window.matchMedia('(max-width: 768px)').matches ||
      window.matchMedia('(pointer: coarse)').matches;

    /* ------------------------------------------------------------------
       Palette (matches the site CSS variables)
       ------------------------------------------------------------------ */
    const PALETTE = {
      cyan:   0x00f3ff,
      pink:   0xff003c,
      purple: 0xbc13fe,
      // Slightly darker set used in light-mode so glows stay visible
      cyanL:   0x0087b8,
      pinkL:   0xc4004e,
      purpleL: 0x6d16c9
    };

    /* ------------------------------------------------------------------
       Quality tiers — index 0 = low, 2 = high
       ------------------------------------------------------------------ */
    const TIERS = [
      { bloom: false, prCap: 1.0,  particles: 0.40, stars: 0.50, lines: 0.45, oct: 2 },
      { bloom: true,  prCap: 1.35, particles: 0.65, stars: 0.75, lines: 0.70, oct: 3 },
      { bloom: true,  prCap: 2.0,  particles: 1.00, stars: 1.00, lines: 1.00, oct: 4 }
    ];
    let tier = isMobile ? 1 : 2;
    const MAX_TIER = 2;

    /* ------------------------------------------------------------------
       Renderer / scene / camera
       ------------------------------------------------------------------ */
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance',
        stencil: false
      });
    } catch (e) {
      canvas.style.display = 'none';
      console.warn('[3d-scene] WebGL unavailable — background disabled.');
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIERS[tier].prCap));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65, window.innerWidth / window.innerHeight, 0.1, 2000
    );
    camera.position.set(0, 0, 50);
    scene.add(camera);

    // Handle context loss gracefully
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      stop();
    }, false);

    const isLightMode = () =>
      !!(document.body && document.body.classList.contains('light-mode'));

    /* ==========================================================================
       Shared GLSL
       ========================================================================== */

    // Ashima / Stefan Gustavson simplex noise (3D) — compact form
    const NOISE_GLSL = `
      vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
    `;

    // GPU drift applied identically to particles and connection lines so the
    // neural mesh always stays attached. Runs in WORLD space.
    const DRIFT_GLSL = `
      vec3 drift(vec3 base, vec3 seed, float t){
        vec3 p = base;
        float s1 = seed.x * 6.28318;
        float s2 = seed.y * 6.28318;
        float s3 = seed.z * 6.28318;
        p.x += sin(t * 0.32 + s1 + base.y * 0.045) * 2.2;
        p.y += cos(t * 0.27 + s2 + base.z * 0.050) * 2.0;
        p.z += sin(t * 0.22 + s3 + base.x * 0.040) * 2.6;
        return p;
      }
      // Mouse repulsion + click shockwave (world space)
      vec3 interact(vec3 world, vec3 mouse, float mouseOn, float pulseTime, vec3 pulseCenter, float t, out float wave){
        wave = 0.0;
        vec3 dm = world - mouse;
        dm.z *= 0.35;
        float md = length(dm);
        float rep = mouseOn * smoothstep(16.0, 2.0, md);
        world += (dm / max(md, 0.001)) * rep * 5.5;

        float pt = t - pulseTime;
        if (pt > 0.0 && pt < 2.5) {
          vec3 dc = world - pulseCenter;
          dc.z *= 0.45;
          float dist = length(dc);
          float r = pt * 55.0;
          wave = exp(-pow((dist - r) / 9.0, 2.0)) * (1.0 - pt / 2.5);
          world += (dc / max(dist, 0.001)) * wave * 4.0;
        }
        return world;
      }
    `;

    const QUAD_VERT = `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    /* ==========================================================================
       Post-processing (custom bloom pipeline)
       ========================================================================== */
    const rtParams = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      stencilBuffer: false
    };
    const size0 = renderer.getDrawingBufferSize(new THREE.Vector2());
    let rtScene  = new THREE.WebGLRenderTarget(size0.x, size0.y, rtParams);
    const rtBloomParams = Object.assign({}, rtParams, { depthBuffer: false });
    let rtBloomA = new THREE.WebGLRenderTarget(size0.x >> 1, size0.y >> 1, rtBloomParams);
    let rtBloomB = new THREE.WebGLRenderTarget(size0.x >> 1, size0.y >> 1, rtBloomParams);

    const brightMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse:   { value: null },
        uThreshold: { value: 0.55 }
      },
      vertexShader: QUAD_VERT,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uThreshold;
        varying vec2 vUv;
        void main(){
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          float w = smoothstep(uThreshold, uThreshold + 0.5, l);
          gl_FragColor = vec4(c * w, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false
    });

    const blurMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uDir:     { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: QUAD_VERT,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uDir;
        varying vec2 vUv;
        void main(){
          vec4 sum = texture2D(tDiffuse, vUv) * 0.22702703;
          sum += texture2D(tDiffuse, vUv + uDir * 1.38461538) * 0.31621622;
          sum += texture2D(tDiffuse, vUv - uDir * 1.38461538) * 0.31621622;
          sum += texture2D(tDiffuse, vUv + uDir * 3.23076923) * 0.07027027;
          sum += texture2D(tDiffuse, vUv - uDir * 3.23076923) * 0.07027027;
          gl_FragColor = sum;
        }
      `,
      depthTest: false,
      depthWrite: false
    });

    const compositeMat = new THREE.ShaderMaterial({
      uniforms: {
        tScene:       { value: null },
        tBloom:       { value: null },
        uTime:        { value: 0 },
        uBloom:       { value: 0.9 },
        uVignette:    { value: 0.85 },
        uGrain:       { value: 0.016 },
        uResolution:  { value: new THREE.Vector2(size0.x, size0.y) }
      },
      vertexShader: QUAD_VERT,
      fragmentShader: `
        uniform sampler2D tScene;
        uniform sampler2D tBloom;
        uniform float uTime;
        uniform float uBloom;
        uniform float uVignette;
        uniform float uGrain;
        uniform vec2  uResolution;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec4 sc = texture2D(tScene, vUv);
          vec3 col = sc.rgb;
          float alpha = sc.a;

          // Bloom with a touch of chromatic aberration
          vec2 ca = (vUv - 0.5) * 0.0032;
          vec3 bl;
          bl.r = texture2D(tBloom, vUv + ca).r;
          bl.g = texture2D(tBloom, vUv).g;
          bl.b = texture2D(tBloom, vUv - ca).b;
          col += bl * uBloom;
          alpha = max(alpha, clamp(dot(bl, vec3(0.45)) * uBloom * 1.4, 0.0, 1.0));

          // Vignette (subtle, focuses the core)
          float v = smoothstep(1.28, 0.38, length(vUv - 0.5));
          col *= mix(1.0, v, uVignette);

          // Very light film grain for a cinematic feel
          col += (hash(vUv * uResolution + vec2(mod(uTime, 10.0) * 37.0)) - 0.5) * uGrain;

          gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
        }
      `,
      depthTest: false,
      depthWrite: false
    });

    const quadScene = new THREE.Scene();
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compositeMat);
    quad.frustumCulled = false;
    quadScene.add(quad);

    /* ==========================================================================
       Procedural textures
       ========================================================================== */
    function makeGlowTexture() {
      const s = 256;
      const cv = document.createElement('canvas');
      cv.width = cv.height = s;
      const ctx = cv.getContext('2d');
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0.00, 'rgba(255,255,255,1)');
      g.addColorStop(0.12, 'rgba(190,250,255,0.85)');
      g.addColorStop(0.30, 'rgba(0,243,255,0.38)');
      g.addColorStop(0.60, 'rgba(188,19,254,0.10)');
      g.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      const tex = new THREE.CanvasTexture(cv);
      tex.needsUpdate = true;
      return tex;
    }
    const glowTex = makeGlowTexture();

    /* ==========================================================================
       Nebula backdrop (procedural FBM gradient)
       ========================================================================== */
    const nebulaMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:  { value: 0 },
        uOct:   { value: TIERS[tier].oct },
        uTintA: { value: new THREE.Color(PALETTE.cyan) },
        uTintB: { value: new THREE.Color(PALETTE.purple) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOct;
        uniform vec3 uTintA;
        uniform vec3 uTintB;
        varying vec2 vUv;
        ${NOISE_GLSL}
        float fbm(vec3 p){
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++){
            if (float(i) >= uOct) break;
            v += a * snoise(p);
            p *= 2.03;
            a *= 0.5;
          }
          return v;
        }
        void main(){
          vec2 p = (vUv - 0.5) * 2.0;
          float t = uTime;
          float n1 = fbm(vec3(p * 1.1 + vec2(0.006 * t, 0.0), 3.7));
          float n2 = fbm(vec3(p * 1.7 + vec2(-0.004 * t, 0.003 * t), 11.2));
          vec3 col = vec3(0.016, 0.012, 0.045);
          col += uTintA * smoothstep(0.08, 1.05, n1) * 0.125;
          col += uTintB * smoothstep(0.14, 1.10, n2) * 0.105;
          // gentle darkening toward the edges (depth)
          col *= smoothstep(1.6, 0.30, length(p));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false
    });
    const nebula = new THREE.Mesh(new THREE.PlaneGeometry(4600, 2800), nebulaMat);
    nebula.position.z = -700;
    nebula.renderOrder = -10;
    nebula.frustumCulled = false;
    scene.add(nebula);

    /* ==========================================================================
       Starfield (multi-layer, twinkling)
       ========================================================================== */
    const STAR_MAX = isMobile ? 700 : 1500;
    const starGeo = new THREE.BufferGeometry();
    {
      const pos = new Float32Array(STAR_MAX * 3);
      const seed = new Float32Array(STAR_MAX * 3);
      const size = new Float32Array(STAR_MAX);
      for (let i = 0; i < STAR_MAX; i++) {
        // Spherical shell distribution
        const r = 260 + Math.pow(Math.random(), 0.7) * 520;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph) - 60;
        seed[i * 3]     = Math.random();
        seed[i * 3 + 1] = Math.random();
        seed[i * 3 + 2] = Math.random();
        size[i] = 0.8 + Math.random() * 1.7;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      starGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
      starGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    }
    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uDim:        { value: 1.0 }
      },
      vertexShader: `
        attribute vec3 aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vTw;
        varying vec3 vColor;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed.x * 1.9) + aSeed.y * 6.28318);
          vTw = tw;
          vColor = mix(vec3(0.72, 0.84, 1.0), vec3(1.0, 0.82, 0.66), step(0.93, aSeed.z));
          gl_PointSize = aSize * uPixelRatio * (0.75 + 0.5 * tw) * (900.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uDim;
        varying float vTw;
        varying vec3 vColor;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.06, d);
          gl_FragColor = vec4(vColor * uDim, a * vTw * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeo, starMat);
    stars.renderOrder = -5;
    scene.add(stars);

    /* ==========================================================================
       Neural network — particles + connection lines (shared GPU drift)
       ========================================================================== */
    const PART_MAX = isMobile ? 1600 : 2800;
    const partGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PART_MAX * 3);
    const pSeed = new Float32Array(PART_MAX * 3);
    for (let i = 0; i < PART_MAX; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 200;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 110 - 20;
      pSeed[i * 3]     = Math.random();
      pSeed[i * 3 + 1] = Math.random();
      pSeed[i * 3 + 2] = Math.random();
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    partGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 3));

    const partMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:        { value: 0 },
        uPixelRatio:  { value: renderer.getPixelRatio() },
        uSize:        { value: 3.0 },
        uMouse:       { value: new THREE.Vector3(9999, 9999, 0) },
        uMouseOn:     { value: 0 },
        uPulseTime:   { value: -100 },
        uPulseCenter: { value: new THREE.Vector3(20, 0, 0) },
        uColorA:      { value: new THREE.Color(PALETTE.cyan) },
        uColorB:      { value: new THREE.Color(PALETTE.pink) },
        uColorC:      { value: new THREE.Color(PALETTE.purple) }
      },
      vertexShader: `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uSize;
        uniform vec3  uMouse;
        uniform float uMouseOn;
        uniform float uPulseTime;
        uniform vec3  uPulseCenter;
        uniform vec3  uColorA;
        uniform vec3  uColorB;
        uniform vec3  uColorC;
        varying vec3 vColor;
        varying float vGlow;
        ${DRIFT_GLSL}
        void main(){
          vec3 world = (modelMatrix * vec4(drift(position, aSeed, uTime), 1.0)).xyz;
          float wave;
          world = interact(world, uMouse, uMouseOn, uPulseTime, uPulseCenter, uTime, wave);

          vec3 col = mix(uColorA, uColorB, smoothstep(0.15, 0.85, aSeed.z));
          col = mix(col, uColorC, smoothstep(0.78, 1.0, aSeed.x) * 0.85);
          col += vec3(0.55, 0.6, 0.6) * wave * 1.5;
          vColor = col;
          vGlow = wave;

          float tw = 0.72 + 0.28 * sin(uTime * (1.5 + aSeed.y * 2.0) + aSeed.y * 43.7);
          vec4 mv = viewMatrix * vec4(world, 1.0);
          gl_PointSize = uSize * (0.55 + aSeed.x * 0.95) * tw * uPixelRatio * (140.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vGlow;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);
          glow *= glow;
          float core = smoothstep(0.16, 0.0, d);
          vec3 col = vColor * glow * (1.35 + vGlow * 1.6) + vec3(0.9, 1.0, 1.0) * core * 0.85;
          gl_FragColor = vec4(col, glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(partGeo, partMat);
    particles.frustumCulled = false;
    const networkGroup = new THREE.Group();
    networkGroup.add(particles);

    // --- Connection lines: precomputed neighbours, same drift in the shader ---
    const LINK_MAX = isMobile ? 900 : 1700;
    const degree = new Uint8Array(PART_MAX);
    const linkPos = [];
    const linkSeed = [];
    const linkT = [];
    const linkRand = [];
    let linkCount = 0;
    {
      const maxDist2 = (isMobile ? 15 : 17) * (isMobile ? 15 : 17);
      outer:
      for (let i = 0; i < PART_MAX; i++) {
        for (let j = i + 1; j < PART_MAX; j++) {
          if (degree[i] > 1 || linkCount >= LINK_MAX) break;
          if (degree[j] > 1) continue;
          const dx = pPos[i*3] - pPos[j*3];
          const dy = pPos[i*3+1] - pPos[j*3+1];
          const dz = pPos[i*3+2] - pPos[j*3+2];
          if (dx*dx + dy*dy + dz*dz < maxDist2) {
            degree[i]++; degree[j]++;
            const r = Math.random();
            for (let k = 0; k < 2; k++) {
              const idx = k ? j : i;
              linkPos.push(pPos[idx*3], pPos[idx*3+1], pPos[idx*3+2]);
              linkSeed.push(pSeed[idx*3], pSeed[idx*3+1], pSeed[idx*3+2]);
              linkT.push(k);
              linkRand.push(r);
            }
            linkCount++;
            if (linkCount >= LINK_MAX) break outer;
          }
        }
      }
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPos), 3));
    linkGeo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(linkSeed), 3));
    linkGeo.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(linkT), 1));
    linkGeo.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(linkRand), 1));

    const linkMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:        { value: 0 },
        uMouse:       partMat.uniforms.uMouse,
        uMouseOn:     partMat.uniforms.uMouseOn,
        uPulseTime:   partMat.uniforms.uPulseTime,
        uPulseCenter: partMat.uniforms.uPulseCenter,
        uColorA:      partMat.uniforms.uColorA,
        uColorB:      partMat.uniforms.uColorB
      },
      vertexShader: `
        attribute vec3 aSeed;
        attribute float aT;
        attribute float aRand;
        uniform float uTime;
        uniform vec3  uMouse;
        uniform float uMouseOn;
        uniform float uPulseTime;
        uniform vec3  uPulseCenter;
        varying float vT;
        varying float vRand;
        varying float vWave;
        ${DRIFT_GLSL}
        void main(){
          vec3 world = (modelMatrix * vec4(drift(position, aSeed, uTime), 1.0)).xyz;
          float wave;
          world = interact(world, uMouse, uMouseOn, uPulseTime, uPulseCenter, uTime, wave);
          vWave = wave;
          vT = aT;
          vRand = aRand;
          gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying float vT;
        varying float vRand;
        varying float vWave;
        void main(){
          // Pulse travelling along each segment
          float pulse = pow(0.5 + 0.5 * sin((vT * 6.28318 + vRand * 6.28318) - uTime * 2.2), 7.0);
          vec3 col = mix(uColorA, uColorB, vRand);
          col += vec3(0.6) * vWave;
          float a = 0.06 + pulse * 0.38 + vWave * 0.45;
          gl_FragColor = vec4(col * (0.45 + pulse * 1.5 + vWave), a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const links = new THREE.LineSegments(linkGeo, linkMat);
    links.frustumCulled = false;
    networkGroup.add(links);
    scene.add(networkGroup);

    /* ==========================================================================
       The AI Core — plasma heart + aura + halo + wire shell + rings + nodes
       ========================================================================== */
    const coreGroup = new THREE.Group();

    // --- Plasma core (vertex-displaced simplex noise, emissive) --------------
    const plasmaMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:      { value: 0 },
        uFlash:     { value: 0 },
        uIntensity: { value: 1.15 }
      },
      vertexShader: `
        uniform float uTime;
        varying float vNoise;
        varying vec3  vNormal;
        varying vec3  vView;
        ${NOISE_GLSL}
        void main(){
          float n  = snoise(normal * 1.7 + vec3(0.0, uTime * 0.25, uTime * 0.18));
          float n2 = snoise(normal * 4.5 - vec3(uTime * 0.42, 0.0, 0.0));
          float d = n * 0.75 + n2 * 0.30;
          vNoise = d;
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position + normal * d * 1.15, 1.0);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uFlash;
        uniform float uIntensity;
        varying float vNoise;
        varying vec3  vNormal;
        varying vec3  vView;
        void main(){
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vView);
          float fres = pow(1.0 - max(dot(N, V), 0.0), 2.1);
          float m = vNoise * 0.5 + 0.5;

          vec3 deep = vec3(0.16, 0.0, 0.09);
          vec3 mid  = vec3(1.0, 0.0, 0.24);
          vec3 hot  = vec3(0.45, 1.0, 1.0);

          vec3 col = mix(deep, mid, smoothstep(0.08, 0.78, m));
          col += hot * pow(max(m - 0.52, 0.0) / 0.48, 2.0) * 0.95;   // cyan energy cracks
          col += mid * fres * 0.9;
          col += vec3(1.0, 0.92, 0.96) * uFlash;
          // slow inner shimmer
          col *= 1.0 + 0.12 * sin(uTime * 2.1);
          gl_FragColor = vec4(col * uIntensity, 1.0);
        }
      `
    });
    const plasma = new THREE.Mesh(
      new THREE.IcosahedronGeometry(7, isMobile ? 3 : 4),
      plasmaMat
    );
    coreGroup.add(plasma);

    // --- Fresnel aura hugging the core ---------------------------------------
    const auraMat = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(PALETTE.cyan) },
        uColorB: { value: new THREE.Color(PALETTE.pink) },
        uOpacity: { value: 0.9 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uOpacity;
        varying vec3 vNormal;
        varying vec3 vView;
        void main(){
          float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
          vec3 col = mix(uColorA, uColorB, 0.35) * fres * 1.7;
          gl_FragColor = vec4(col, fres * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide
    });
    const aura = new THREE.Mesh(new THREE.SphereGeometry(9.3, 48, 48), auraMat);
    coreGroup.add(aura);

    // --- Big soft halo sprite --------------------------------------------------
    const haloMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x88e8ff,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(52, 52, 1);
    coreGroup.add(halo);

    // --- Energy wireframe shell -----------------------------------------------
    const shellGeoW = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(12.5, 1));
    {
      const cnt = shellGeoW.attributes.position.count;
      const rnd = new Float32Array(cnt);
      for (let i = 0; i < cnt; i++) rnd[i] = Math.random();
      shellGeoW.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    }
    const shellMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 1.0 },
        uColorA:  { value: new THREE.Color(PALETTE.cyan) },
        uColorB:  { value: new THREE.Color(PALETTE.pink) }
      },
      vertexShader: `
        attribute float aRand;
        varying float vRand;
        varying float vY;
        void main(){
          vRand = aRand;
          vY = normalize(position).y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying float vRand;
        varying float vY;
        void main(){
          float flow = pow(0.5 + 0.5 * sin(uTime * 1.6 + vRand * 12.566), 4.0);
          float band = 0.5 + 0.5 * sin(vY * 2.4 + uTime * 0.7);
          vec3 col = mix(uColorA, uColorB, vY * 0.5 + 0.5);
          float a = (0.10 + flow * 0.80) * (0.55 + 0.45 * band) * uOpacity;
          gl_FragColor = vec4(col * (0.55 + flow * 1.4), a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const shell = new THREE.LineSegments(shellGeoW, shellMat);
    coreGroup.add(shell);

    // --- Gyroscopic energy rings ----------------------------------------------
    function makeRing(radius, tube, packets, speed, colorMixA) {
      const geo = new THREE.TorusGeometry(radius, tube, 6, 180);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:    { value: 0 },
          uSpeed:   { value: speed },
          uPackets: { value: packets },
          uOpacity: { value: 1.0 },
          uColorA:  { value: new THREE.Color(PALETTE.cyan) },
          uColorB:  { value: new THREE.Color(colorMixA) }
        },
        vertexShader: `
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uSpeed;
          uniform float uPackets;
          uniform float uOpacity;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec2 vUv;
          void main(){
            float f = fract(vUv.x * uPackets - uTime * uSpeed);
            float packet = pow(f, 8.0) * 2.4;
            float base = 0.16;
            vec3 col = mix(uColorA, uColorB, 0.5 + 0.5 * sin(vUv.x * 12.566 + uTime * 0.3));
            col += vec3(0.7, 1.0, 1.0) * packet * 0.4;
            gl_FragColor = vec4(col * (base + packet), (base + packet) * uOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      return new THREE.Mesh(geo, mat);
    }
    const ring1 = makeRing(17, 0.10, 3, 0.24, PALETTE.pink);
    const ring2 = makeRing(20.5, 0.07, 2, -0.17, PALETTE.purple);
    const ring1Pivot = new THREE.Group();
    const ring2Pivot = new THREE.Group();
    ring1Pivot.rotation.set(1.15, 0.0, 0.25);
    ring2Pivot.rotation.set(-0.95, 0.4, -0.2);
    ring1Pivot.add(ring1);
    ring2Pivot.add(ring2);
    coreGroup.add(ring1Pivot, ring2Pivot);

    // --- Orbiting data nodes ---------------------------------------------------
    const NODE_COUNT = isMobile ? 26 : 44;
    const nodeGeo = new THREE.BufferGeometry();
    {
      const uArr = new Float32Array(NODE_COUNT * 3);
      const vArr = new Float32Array(NODE_COUNT * 3);
      const radArr = new Float32Array(NODE_COUNT);
      const spdArr = new Float32Array(NODE_COUNT);
      const phArr = new Float32Array(NODE_COUNT);
      const mixArr = new Float32Array(NODE_COUNT);
      const szArr = new Float32Array(NODE_COUNT);
      for (let i = 0; i < NODE_COUNT; i++) {
        // Random orbit plane basis (orthonormal u, v)
        const ax = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        const tmp = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        const u = new THREE.Vector3().crossVectors(ax, tmp).normalize();
        const v = new THREE.Vector3().crossVectors(ax, u).normalize();
        uArr[i*3] = u.x; uArr[i*3+1] = u.y; uArr[i*3+2] = u.z;
        vArr[i*3] = v.x; vArr[i*3+1] = v.y; vArr[i*3+2] = v.z;
        radArr[i] = 14 + Math.random() * 11;
        spdArr[i] = (0.22 + Math.random() * 0.55) * (Math.random() < 0.5 ? -1 : 1);
        phArr[i] = Math.random() * Math.PI * 2;
        mixArr[i] = Math.random();
        szArr[i] = 2.0 + Math.random() * 2.4;
      }
      nodeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NODE_COUNT * 3), 3));
      nodeGeo.setAttribute('aU', new THREE.BufferAttribute(uArr, 3));
      nodeGeo.setAttribute('aV', new THREE.BufferAttribute(vArr, 3));
      nodeGeo.setAttribute('aRadius', new THREE.BufferAttribute(radArr, 1));
      nodeGeo.setAttribute('aSpeed', new THREE.BufferAttribute(spdArr, 1));
      nodeGeo.setAttribute('aPhase', new THREE.BufferAttribute(phArr, 1));
      nodeGeo.setAttribute('aMix', new THREE.BufferAttribute(mixArr, 1));
      nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(szArr, 1));
    }
    const nodeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uColorA:     { value: new THREE.Color(PALETTE.cyan) },
        uColorB:     { value: new THREE.Color(PALETTE.pink) },
        uColorC:     { value: new THREE.Color(PALETTE.purple) }
      },
      vertexShader: `
        attribute vec3 aU;
        attribute vec3 aV;
        attribute float aRadius;
        attribute float aSpeed;
        attribute float aPhase;
        attribute float aMix;
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        varying vec3 vColor;
        void main(){
          float ang = uTime * aSpeed + aPhase;
          vec3 p = aU * (cos(ang) * aRadius) + aV * (sin(ang) * aRadius);
          vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.8, aMix));
          col = mix(col, uColorC, smoothstep(0.82, 1.0, aMix));
          vColor = col;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float s = aSize * (0.85 + 0.15 * sin(uTime * 3.0 + aPhase));
          gl_PointSize = s * uPixelRatio * (160.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float glow = pow(smoothstep(0.5, 0.0, d), 1.5);
          vec3 col = vColor * glow * 1.4 + vec3(1.0) * smoothstep(0.18, 0.0, d);
          gl_FragColor = vec4(col, glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    nodes.frustumCulled = false;
    coreGroup.add(nodes);

    // Core placement (same layout intent as v1)
    function coreBase() {
      return window.innerWidth > 1024
        ? { x: 20, y: 0 }
        : { x: 0, y: 15 };
    }
    const base = coreBase();
    coreGroup.position.set(base.x, base.y, 0);
    scene.add(coreGroup);

    /* ==========================================================================
       Interaction state
       ========================================================================== */
    const state = {
      // pointer
      pxNDC: 0, pyNDC: 0,
      tRotX: 0, tRotY: 0,
      rotX: 0, rotY: 0,
      camTX: 0, camTY: 0,
      camX: 0, camY: 0,
      mouseWorld: new THREE.Vector3(9999, 9999, 0),
      mouseOnT: 0, mouseOn: 0, lastMove: -1e4,
      // scroll
      scrollT: 0, scroll: 0,
      // fx
      flash: 0,
      // time
      time: 0
    };

    const _v = new THREE.Vector3();
    const _dir = new THREE.Vector3();

    function updateMouseWorld() {
      _v.set(state.pxNDC, state.pyNDC, 0.5).unproject(camera);
      _dir.copy(_v).sub(camera.position).normalize();
      const t = (0 - camera.position.z) / _dir.z;
      if (t > 0) {
        state.mouseWorld.copy(camera.position).addScaledVector(_dir, t);
      }
    }

    window.addEventListener('pointermove', (e) => {
      state.pxNDC = (e.clientX / window.innerWidth) * 2 - 1;
      state.pyNDC = -(e.clientY / window.innerHeight) * 2 + 1;
      state.tRotY = state.pxNDC * 0.12;
      state.tRotX = state.pyNDC * 0.08;
      state.camTX = state.pxNDC * 3.0;
      state.camTY = state.pyNDC * 2.0;
      state.mouseOnT = 1;
      state.lastMove = state.time;
      updateMouseWorld();
    }, { passive: true });

    // Click / tap → shockwave from the core
    window.addEventListener('pointerdown', (e) => {
      if (e.target && e.target.closest && e.target.closest('a, button, input, textarea, select, .leaflet-container')) return;
      partMat.uniforms.uPulseTime.value = state.time;
      partMat.uniforms.uPulseCenter.value.copy(coreGroup.position);
      state.flash = 1;
    }, { passive: true });

    let scrollTarget = window.scrollY || 0;
    window.addEventListener('scroll', () => {
      scrollTarget = window.scrollY || 0;
    }, { passive: true });

    /* ==========================================================================
       Theme awareness (light-mode support)
       ========================================================================== */
    function applyTheme() {
      const light = isLightMode();
      const P = PALETTE;
      const setCol = (u, hex) => u.value.setHex(hex);
      const swap = (mat, darkBlend) => {
        mat.blending = light ? THREE.NormalBlending : darkBlend;
        mat.needsUpdate = true;
      };

      // Particles + neural lines (lines share colour uniform objects)
      setCol(partMat.uniforms.uColorA, light ? P.cyanL : P.cyan);
      setCol(partMat.uniforms.uColorB, light ? P.pinkL : P.pink);
      setCol(partMat.uniforms.uColorC, light ? P.purpleL : P.purple);
      swap(partMat, THREE.AdditiveBlending);
      swap(linkMat, THREE.AdditiveBlending);

      // Stars / nebula
      starMat.uniforms.uDim.value = light ? 0.22 : 1.0;
      swap(starMat, THREE.AdditiveBlending);
      nebula.visible = !light;

      // Core elements — aura hidden in light mode (fresnel rim reads grey on white)
      setCol(auraMat.uniforms.uColorA, light ? P.cyanL : P.cyan);
      setCol(auraMat.uniforms.uColorB, light ? P.pinkL : P.pink);
      auraMat.uniforms.uOpacity.value = light ? 0.0 : 0.9;
      swap(auraMat, THREE.AdditiveBlending);

      shellMat.uniforms.uOpacity.value = light ? 0.45 : 1.0;
      setCol(shellMat.uniforms.uColorA, light ? P.cyanL : P.cyan);
      setCol(shellMat.uniforms.uColorB, light ? P.pinkL : P.pink);
      swap(shellMat, THREE.AdditiveBlending);

      for (const ring of [ring1, ring2]) {
        ring.material.uniforms.uOpacity.value = light ? 0.5 : 1.0;
        setCol(ring.material.uniforms.uColorA, light ? P.cyanL : P.cyan);
        setCol(ring.material.uniforms.uColorB,
          ring === ring1 ? (light ? P.pinkL : P.pink) : (light ? P.purpleL : P.purple));
        swap(ring.material, THREE.AdditiveBlending);
      }

      setCol(nodeMat.uniforms.uColorA, light ? P.cyanL : P.cyan);
      setCol(nodeMat.uniforms.uColorB, light ? P.pinkL : P.pink);
      setCol(nodeMat.uniforms.uColorC, light ? P.purpleL : P.purple);
      swap(nodeMat, THREE.AdditiveBlending);

      haloMat.opacity = light ? 0.12 : 0.5;
      haloMat.color.setHex(light ? 0x86cfe3 : 0x88e8ff);
      haloMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      haloMat.needsUpdate = true;
      plasmaMat.uniforms.uIntensity.value = light ? 0.95 : 1.15;
      compositeMat.uniforms.uVignette.value = light ? 0.4 : 0.85;
      compositeMat.uniforms.uGrain.value = light ? 0.008 : 0.016;
    }
    applyTheme();
    if (window.MutationObserver && document.body) {
      new MutationObserver(applyTheme)
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    /* ==========================================================================
       Quality management / resize
       ========================================================================== */
    function applyTier() {
      const T = TIERS[tier];
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, T.prCap));
      const pr = renderer.getPixelRatio();
      partMat.uniforms.uPixelRatio.value = pr;
      starMat.uniforms.uPixelRatio.value = pr;
      nodeMat.uniforms.uPixelRatio.value = pr;
      partGeo.setDrawRange(0, Math.floor(PART_MAX * T.particles));
      starGeo.setDrawRange(0, Math.floor(STAR_MAX * T.stars));
      linkGeo.setDrawRange(0, Math.floor(linkCount * 2 * T.lines) & ~1); // even count
      nebulaMat.uniforms.uOct.value = T.oct;
      bloomOn = T.bloom;
      onResize();
    }

    let resizeTimer = null;
    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      const db = renderer.getDrawingBufferSize(new THREE.Vector2());
      rtScene.setSize(db.x, db.y);
      const hw = Math.max(2, db.x >> 1);
      const hh = Math.max(2, db.y >> 1);
      rtBloomA.setSize(hw, hh);
      rtBloomB.setSize(hw, hh);
      compositeMat.uniforms.uResolution.value.set(db.x, db.y);

      const b = coreBase();
      coreGroup.position.x = b.x;
      nebula.scale.setScalar(Math.max(1, w / 1440));
    }
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 120);
    });

    /* ==========================================================================
       Render loop
       ========================================================================== */
    let bloomOn = TIERS[tier].bloom;
    applyTier();

    const clock = new THREE.Clock();
    let rafId = null;
    let running = false;

    // Adaptive performance monitor
    let emaMs = 16;
    let frames = 0;
    let lastChange = 0;

    function damp(current, target, lambda, dt) {
      return current + (target - current) * (1 - Math.exp(-lambda * dt));
    }

    function renderFrame() {
      if (bloomOn) {
        // 1. scene
        renderer.setRenderTarget(rtScene);
        renderer.clear();
        renderer.render(scene, camera);
        // 2. bright pass
        quad.material = brightMat;
        brightMat.uniforms.tDiffuse.value = rtScene.texture;
        renderer.setRenderTarget(rtBloomA);
        renderer.render(quadScene, quadCam);
        // 3. separable blur, two radii for a wide soft falloff
        const bw = rtBloomA.width, bh = rtBloomA.height;
        quad.material = blurMat;
        const passes = [
          [rtBloomA, rtBloomB, 1, 0, 1.0],
          [rtBloomB, rtBloomA, 0, 1, 1.0],
          [rtBloomA, rtBloomB, 1, 0, 2.0],
          [rtBloomB, rtBloomA, 0, 1, 2.0]
        ];
        for (const [src, dst, dx, dy, rad] of passes) {
          blurMat.uniforms.tDiffuse.value = src.texture;
          blurMat.uniforms.uDir.value.set(dx / bw * rad, dy / bh * rad);
          renderer.setRenderTarget(dst);
          renderer.render(quadScene, quadCam);
        }
        // 4. composite
        quad.material = compositeMat;
        compositeMat.uniforms.tScene.value = rtScene.texture;
        compositeMat.uniforms.tBloom.value = rtBloomA.texture;
        renderer.setRenderTarget(null);
        renderer.render(quadScene, quadCam);
      } else {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
      }
    }

    function tick() {
      rafId = requestAnimationFrame(tick);

      let dt = clock.getDelta();
      if (dt > 0.05) dt = 0.05;      // clamp after tab switches / hiccups
      if (dt < 0.0001) dt = 0.0001;
      state.time += dt;

      // --- performance governor ------------------------------------------
      const ms = dt * 1000;
      emaMs = emaMs * 0.95 + ms * 0.05;
      frames++;
      if (frames >= 90) {
        if (emaMs > 26 && tier > 0 && state.time - lastChange > 2.5) {
          tier--; lastChange = state.time; applyTier();
        } else if (emaMs < 13.5 && tier < MAX_TIER && state.time - lastChange > 8) {
          tier++; lastChange = state.time; applyTier();
        }
        frames = 0;
      }

      // --- smoothed inputs -------------------------------------------------
      const idle = state.time - state.lastMove > 2.0;
      state.mouseOnT = idle ? 0 : 1;
      state.mouseOn = damp(state.mouseOn, state.mouseOnT, 4, dt);
      partMat.uniforms.uMouseOn.value = state.mouseOn;
      partMat.uniforms.uMouse.value.copy(state.mouseWorld);

      state.scroll = damp(state.scroll, scrollTarget, 6, dt);
      state.camX = damp(state.camX, state.camTX, 3.2, dt);
      state.camY = damp(state.camY, state.camTY, 3.2, dt);
      state.rotY = damp(state.rotY, state.tRotY, 3.0, dt);
      state.rotX = damp(state.rotX, state.tRotX, 3.0, dt);

      state.flash = damp(state.flash, 0, 3.2, dt);

      // --- camera & world ---------------------------------------------------
      camera.position.x = state.camX;
      camera.position.y = state.camY - state.scroll * 0.014;
      camera.rotation.z = state.rotY * -0.02;

      networkGroup.rotation.y = state.rotY + state.scroll * 0.00025 + state.time * 0.008;
      networkGroup.rotation.x = state.rotX;

      // --- core -------------------------------------------------------------
      const b = coreBase();
      coreGroup.position.y = b.y + state.scroll * 0.02;
      coreGroup.rotation.y = state.time * 0.05 + state.rotY * 0.6;
      coreGroup.rotation.x = Math.sin(state.time * 0.11) * 0.08 + state.rotX * 0.5;

      plasma.rotation.y = state.time * 0.12;
      plasma.rotation.x = -state.time * 0.07;
      shell.rotation.y = -state.time * 0.10;
      shell.rotation.x = state.time * 0.06;

      ring1Pivot.rotation.y += dt * 0.42;
      ring1Pivot.rotation.x = 1.15 + Math.sin(state.time * 0.31) * 0.22;
      ring2Pivot.rotation.y -= dt * 0.30;
      ring2Pivot.rotation.z = -0.2 + Math.sin(state.time * 0.24) * 0.25;

      halo.scale.setScalar(52 * (1 + state.flash * 0.28));
      haloMat.opacity = (isLightMode() ? 0.12 : 0.5) * (1 + state.flash * 0.9);

      // --- uniforms -----------------------------------------------------------
      const T = state.time;
      partMat.uniforms.uTime.value = T;
      linkMat.uniforms.uTime.value = T;
      starMat.uniforms.uTime.value = T * 0.6;
      nebulaMat.uniforms.uTime.value = T;
      plasmaMat.uniforms.uTime.value = T;
      plasmaMat.uniforms.uFlash.value = state.flash * 0.85;
      shellMat.uniforms.uTime.value = T;
      ring1.material.uniforms.uTime.value = T;
      ring2.material.uniforms.uTime.value = T;
      nodeMat.uniforms.uTime.value = T;
      compositeMat.uniforms.uTime.value = T;
      compositeMat.uniforms.uBloom.value = (isLightMode() ? 0.55 : 0.9) * (1 + state.flash * 0.35);
      stars.rotation.y = T * 0.004 + state.scroll * 0.00008;

      renderFrame();
    }

    function start() {
      if (running || prefersReducedMotion) return;
      running = true;
      clock.getDelta(); // flush stale delta
      rafId = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    // Reduced motion: render one beautiful static frame, re-render on resize
    if (prefersReducedMotion) {
      state.time = 8; // pick a pleasant pose
      partMat.uniforms.uTime.value = state.time;
      linkMat.uniforms.uTime.value = state.time;
      nebulaMat.uniforms.uTime.value = state.time;
      plasmaMat.uniforms.uTime.value = state.time;
      shellMat.uniforms.uTime.value = state.time;
      renderFrame();
      window.addEventListener('resize', () => renderFrame());
    } else {
      start();
    }

    /* Expose a tiny debug handle (optional) */
    window.__nexusScene = { scene, camera, renderer, core: coreGroup, setTier: (t) => { tier = Math.max(0, Math.min(MAX_TIER, t)); applyTier(); } };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
