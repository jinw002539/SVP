import { motion, prefereMenosMovimento } from '@/lib/motion';
import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

// "Luz de vitral": ruído com domínio deformado (domain warping) em azul-noite, azul-vitral, turquesa e ouro.
// O scroll desloca o padrão e a intensidade do ouro; o ponteiro puxa a luz suavemente.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform float u_scroll;
uniform vec2 u_ptr;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

// Véu muito suave: branco com um toque de azul-céu e de creme, só na parte de cima.
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  float t = u_time * 0.04;

  vec2 q = vec2(fbm(p * 1.1 + vec2(0.0, u_scroll) + t), fbm(p * 1.1 + vec2(5.2, 1.3) - t));
  float f = fbm(p + 2.0 * q + u_ptr * 0.25);

  vec3 base = vec3(0.969, 0.973, 0.980);
  vec3 sky  = vec3(0.850, 0.915, 1.000);
  vec3 warm = vec3(1.000, 0.950, 0.860);

  vec3 col = mix(base, sky, smoothstep(0.30, 0.80, f) * 0.85);
  col = mix(col, warm, smoothstep(0.45, 0.95, q.x) * 0.60);
  col = mix(col, base, (1.0 - smoothstep(-0.10, 0.70, uv.y)) * 0.92);
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.010;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
    const s = gl.createShader(tipo);
    if (!s) return null;
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Shader:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
    }
    return s;
}

/**
 * Fundo WebGL. Pensado para telemóveis com dados limitados e bateria fraca:
 *  - renderiza a ~50% da resolução (o CSS amplia, o desfoque é desejado);
 *  - limita a ~30 fps e pára quando o separador está escondido;
 *  - respeita "reduzir movimento" (1 frame estático) e "poupar dados" (sem WebGL);
 *  - se o WebGL falhar, fica o gradiente CSS por baixo (.ig-bg).
 */
export default function ShaderBackground() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        const ligacao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (ligacao?.saveData) return;

        const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
        if (!gl) return;

        const vs = compilar(gl, gl.VERTEX_SHADER, VERT);
        const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAG);
        const prog = gl.createProgram();
        if (!vs || !fs || !prog) return;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.warn('Shader link:', gl.getProgramInfoLog(prog));
            return;
        }
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, 'u_res');
        const uTime = gl.getUniformLocation(prog, 'u_time');
        const uScroll = gl.getUniformLocation(prog, 'u_scroll');
        const uPtr = gl.getUniformLocation(prog, 'u_ptr');

        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
        let raf = 0;
        let ultimo = 0;
        let pronto = false;
        let ptrX = 0;
        let ptrY = 0;
        const inicio = performance.now();

        const redimensionar = () => {
            const escala = Math.min(window.devicePixelRatio || 1, 1.5) * 0.4;
            const w = Math.max(2, Math.round(window.innerWidth * escala));
            const h = Math.max(2, Math.round(window.innerHeight * escala));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
        };

        const desenhar = (agora: number) => {
            ptrX += (motion.px - ptrX) * 0.04;
            ptrY += (motion.py - ptrY) * 0.04;
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, prefereMenosMovimento() ? 12 : (agora - inicio) / 1000);
            gl.uniform1f(uScroll, motion.progress);
            gl.uniform2f(uPtr, ptrX, -ptrY);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            if (!pronto) {
                pronto = true;
                canvas.classList.add('is-ready');
            }
        };

        const ciclo = (agora: number) => {
            raf = requestAnimationFrame(ciclo);
            if (agora - ultimo < 33) return; // ~30 fps
            ultimo = agora;
            desenhar(agora);
        };

        const arrancar = () => {
            cancelAnimationFrame(raf);
            if (document.hidden) return;
            if (reduzido.matches) {
                redimensionar();
                desenhar(performance.now());
                return;
            }
            raf = requestAnimationFrame(ciclo);
        };

        const aoRedimensionar = () => {
            redimensionar();
            if (reduzido.matches) desenhar(performance.now());
        };
        const aoPerderContexto = (e: Event) => {
            e.preventDefault();
            cancelAnimationFrame(raf);
        };

        redimensionar();
        arrancar();
        window.addEventListener('resize', aoRedimensionar);
        document.addEventListener('visibilitychange', arrancar);
        reduzido.addEventListener('change', arrancar);
        canvas.addEventListener('webglcontextlost', aoPerderContexto);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', aoRedimensionar);
            document.removeEventListener('visibilitychange', arrancar);
            reduzido.removeEventListener('change', arrancar);
            canvas.removeEventListener('webglcontextlost', aoPerderContexto);
            gl.deleteProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buf);
        };
    }, []);

    return <canvas ref={ref} className="ig-canvas" aria-hidden="true" />;
}
