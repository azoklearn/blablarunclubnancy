// ==========================================
// PRISMATIC BURST - Effet de fond WebGL
// Version vanilla JavaScript adaptée de React
// ==========================================

const vertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;

uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;

float hash21(vec2 p){
    p = floor(p);
    float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
    return fract(f);
}

mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx){
    vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    vec2 q = rot30() * p;
    float n = 0.0;
    n += 0.40 * hash21(q);
    n += 0.25 * hash21(q * 2.0 + 17.0);
    n += 0.20 * hash21(q * 4.0 + 47.0);
    n += 0.10 * hash21(q * 8.0 + 113.0);
    n += 0.05 * hash21(q * 16.0 + 191.0);
    return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
    float focal = res.y * max(dist, 1e-3);
    return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
    vec2 toC = frag - 0.5 * res - offset;
    float r = length(toC) / (0.5 * min(res.x, res.y));
    float x = clamp(r, 0.0, 1.0);
    float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
    float s = q * 0.5;
    s = pow(s, 1.5);
    float tail = 1.0 - pow(1.0 - s, 2.0);
    s = mix(s, tail, 0.2);
    float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
    return clamp(s + dn, 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
    t = clamp(t, 0.0, 1.0);
    return texture(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t){
    float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
            + 0.7 * sin(q.y * 0.50 - t * 0.5)
            + 0.6 * sin(q.z * 0.60 + t * 0.7);
    return a;
}

void main(){
    vec2 frag = gl_FragCoord.xy;
    float t = uTime * uSpeed;
    float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
    vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
    float marchT = 0.0;
    vec3 col = vec3(0.0);
    float n = layeredNoise(frag);
    vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
    mat2 M2 = mat2(c.x, c.y, c.z, c.w);
    float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

    mat3 rot3dMat = mat3(1.0);
    if(uAnimType == 1){
      vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
      rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
    }
    mat3 hoverMat = mat3(1.0);
    if(uAnimType == 2){
      vec2 m = uMouse * 2.0 - 1.0;
      vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
      hoverMat = rotY(ang.y) * rotX(ang.x);
    }

    for (int i = 0; i < 44; ++i) {
        vec3 P = marchT * dir;
        P.z -= 2.0;
        float rad = length(P);
        vec3 Pl = P * (10.0 / max(rad, 1e-6));

        if(uAnimType == 0){
            Pl.xz *= M2;
        } else if(uAnimType == 1){
      Pl = rot3dMat * Pl;
        } else {
      Pl = hoverMat * Pl;
        }

        float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

        float grow = smoothstep(0.35, 3.0, marchT);
        float a1 = amp * grow * bendAngle(Pl * 0.6, t);
        float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
        vec3 Pb = Pl;
        Pb.xz = rot2(Pb.xz, a1);
        Pb.xy = rot2(Pb.xy, a2);

        float rayPattern = smoothstep(
            0.5, 0.7,
            sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
            sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
        );

        if (uRayCount > 0) {
            float ang = atan(Pb.y, Pb.x);
            float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
            comb = pow(comb, 3.0);
            rayPattern *= smoothstep(0.15, 0.95, comb);
        }

        vec3 spectralDefault = 1.0 + vec3(
            cos(marchT * 3.0 + 0.0),
            cos(marchT * 3.0 + 1.0),
            cos(marchT * 3.0 + 2.0)
        );

        float saw = fract(marchT * 0.25);
        float tRay = saw * saw * (3.0 - 2.0 * saw);
        vec3 userGradient = 2.0 * sampleGradient(tRay);
        vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
        vec3 base = (0.05 / (0.4 + stepLen))
                  * smoothstep(5.0, 0.0, rad)
                  * spectral;

        col += base * rayPattern;
        marchT += stepLen;
    }

    col *= edgeFade(frag, uResolution, uOffset);
    col *= uIntensity;

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function hexToRgb01(hex) {
    let h = hex.trim();
    if (h.startsWith('#')) h = h.slice(1);
    if (h.length === 3) {
        const r = h[0], g = h[1], b = h[2];
        h = r + r + g + g + b + b;
    }
    const intVal = parseInt(h, 16);
    if (isNaN(intVal) || (h.length !== 6 && h.length !== 8)) return [1, 1, 1];
    const r = ((intVal >> 16) & 255) / 255;
    const g = ((intVal >> 8) & 255) / 255;
    const b = (intVal & 255) / 255;
    return [r, g, b];
}

function toPx(v) {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    const s = String(v).trim();
    const num = parseFloat(s.replace('px', ''));
    return isNaN(num) ? 0 : num;
}

async function initPrismaticBurst(options = {}) {
    const {
        intensity = 2,
        speed = 0.5,
        animationType = 'rotate3d',
        colors = ['#3b82f6', '#60a5fa', '#ffffff'],
        distort = 1.0,
        paused = false,
        offset = { x: 0, y: 0 },
        hoverDampness = 0.25,
        rayCount = 24,
        mixBlendMode = 'lighten'
    } = options;

    const container = document.getElementById('prismatic-burst-container');
    if (!container) {
        console.warn('PrismaticBurst: Container not found');
        return null;
    }

    // Charger OGL dynamiquement depuis skypack CDN (qui supporte ES modules)
    let OGL;
    try {
        // Essayer d'importer OGL depuis skypack
        const module = await import('https://cdn.skypack.dev/ogl@0.0.70');
        OGL = module;
        
        // Si les exports sont dans default
        if (OGL.default) {
            OGL = OGL.default;
        }
    } catch (e) {
        console.warn('PrismaticBurst: OGL library could not be loaded, using CSS fallback', e);
        // Fallback CSS animé
        container.innerHTML = '<div class="css-burst-fallback"></div>';
        container.classList.add('fallback-active');
        return null;
    }

    if (!OGL || !OGL.Renderer) {
        console.warn('PrismaticBurst: OGL library not properly loaded, using CSS fallback');
        container.innerHTML = '<div class="css-burst-fallback"></div>';
        container.classList.add('fallback-active');
        return null;
    }

    const { Renderer, Program, Mesh, Triangle, Texture } = OGL;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new Renderer({
        dpr,
        alpha: false,
        antialias: false
    });

    const gl = renderer.gl;
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.mixBlendMode = mixBlendMode && mixBlendMode !== 'none' ? mixBlendMode : '';
    container.appendChild(gl.canvas);

    const white = new Uint8Array([255, 255, 255, 255]);
    const gradientTex = new Texture(gl, {
        image: white,
        width: 1,
        height: 1,
        generateMipmaps: false,
        flipY: false
    });

    gradientTex.minFilter = gl.LINEAR;
    gradientTex.magFilter = gl.LINEAR;
    gradientTex.wrapS = gl.CLAMP_TO_EDGE;
    gradientTex.wrapT = gl.CLAMP_TO_EDGE;

    const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
            uResolution: { value: [1, 1] },
            uTime: { value: 0 },
            uIntensity: { value: intensity },
            uSpeed: { value: speed },
            uAnimType: { value: 0 },
            uMouse: { value: [0.5, 0.5] },
            uColorCount: { value: 0 },
            uDistort: { value: distort },
            uOffset: { value: [0, 0] },
            uGradient: { value: gradientTex },
            uNoiseAmount: { value: 0.8 },
            uRayCount: { value: rayCount }
        }
    });

    const triangle = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry: triangle, program });

    const animTypeMap = {
        rotate: 0,
        rotate3d: 1,
        hover: 2
    };
    program.uniforms.uAnimType.value = animTypeMap[animationType] || 1;

    let pausedRef = paused;
    const mouseTarget = [0.5, 0.5];
    const mouseSmooth = [0.5, 0.5];
    let isVisible = true;
    let accumTime = 0;

    const resize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h);
        program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };

    let ro = null;
    if ('ResizeObserver' in window) {
        ro = new ResizeObserver(resize);
        ro.observe(container);
    } else {
        window.addEventListener('resize', resize);
    }
    resize();

    const onPointer = (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
        const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
        mouseTarget[0] = Math.min(Math.max(x, 0), 1);
        mouseTarget[1] = Math.min(Math.max(y, 0), 1);
    };
    container.addEventListener('pointermove', onPointer, { passive: true });

    let io = null;
    if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(
            entries => {
                if (entries[0]) {
                    isVisible = entries[0].isIntersecting;
                }
            },
            { root: null, threshold: 0.01 }
        );
        io.observe(container);
    }

    const onVis = () => {};
    document.addEventListener('visibilitychange', onVis);

    let raf = 0;
    let last = performance.now();

    const update = (now) => {
        const dt = Math.max(0, now - last) * 0.001;
        last = now;
        const visible = isVisible && !document.hidden;
        if (!pausedRef) accumTime += dt;

        if (!visible) {
            raf = requestAnimationFrame(update);
            return;
        }

        const tau = 0.02 + Math.max(0, Math.min(1, hoverDampness)) * 0.5;
        const alpha = 1 - Math.exp(-dt / tau);
        mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
        mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;

        program.uniforms.uMouse.value = mouseSmooth;
        program.uniforms.uTime.value = accumTime;

        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    // Update colors gradient
    if (Array.isArray(colors) && colors.length > 0) {
        const capped = colors.slice(0, 64);
        const count = capped.length;
        const data = new Uint8Array(count * 4);
        for (let i = 0; i < count; i++) {
            const [r, g, b] = hexToRgb01(capped[i]);
            data[i * 4 + 0] = Math.round(r * 255);
            data[i * 4 + 1] = Math.round(g * 255);
            data[i * 4 + 2] = Math.round(b * 255);
            data[i * 4 + 3] = 255;
        }
        gradientTex.image = data;
        gradientTex.width = count;
        gradientTex.height = 1;
        gradientTex.needsUpdate = true;
        program.uniforms.uColorCount.value = count;
    }

    const ox = toPx(offset?.x);
    const oy = toPx(offset?.y);
    program.uniforms.uOffset.value = [ox, oy];

    return {
        destroy: () => {
            cancelAnimationFrame(raf);
            container.removeEventListener('pointermove', onPointer);
            ro?.disconnect();
            if (!ro) window.removeEventListener('resize', resize);
            io?.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            try {
                container.removeChild(gl.canvas);
            } catch {
                console.warn('Canvas already removed');
            }
        }
    };
}

// Initialisation automatique au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Essayer d'initialiser avec un petit délai pour s'assurer que tout est chargé
    setTimeout(() => {
        initPrismaticBurst({
            animationType: 'rotate3d',
            intensity: 2,
            speed: 0.5,
            distort: 1.0,
            paused: false,
            offset: { x: 0, y: 0 },
            hoverDampness: 0.25,
            rayCount: 24,
            mixBlendMode: 'lighten',
            colors: ['#3b82f6', '#60a5fa', '#ffffff']
        }).catch(err => {
            console.warn('PrismaticBurst initialization failed, using CSS fallback:', err);
            const container = document.getElementById('prismatic-burst-container');
            if (container) {
                container.innerHTML = '<div class="css-burst-fallback"></div>';
                container.classList.add('fallback-active');
            }
        });
    }, 100);
});

