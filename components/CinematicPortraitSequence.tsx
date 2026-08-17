"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import FluidPortfolioCanvas from "./FluidPortfolioCanvas";

/* ─── Constants ─────────────────────────────────────────────── */
const FRAME_COUNT = 147;

function frameSrc(index: number, isPhone: boolean = false): string {
  const n = String(index + 1).padStart(3, "0");
  const dir = isPhone ? "/sequence-phone/" : "/sequence/";
  return `${dir}ezgif-frame-${n}.jpg`;
}

/* ─── Loading Screen ─────────────────────────────────────────── */
const LoadingScreen = memo(({ progress, isReady }: { progress: number; isReady: boolean }) => (
  <motion.div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    animate={{ opacity: isReady ? 0 : 1 }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    style={{ pointerEvents: isReady ? "none" : "all" }}
  >
    <div className="flex flex-col items-center gap-8">
      <motion.p
        className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-light"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Cinematic Experience
      </motion.p>

      <motion.p
        className="text-[11px] tracking-[0.3em] text-neutral-800 font-light uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        Loading {Math.round(progress)}%
      </motion.p>

      <div className="w-48 h-px bg-neutral-100 overflow-hidden">
        <motion.div
          className="h-full bg-neutral-800"
          style={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.1 }}
        />
      </div>
    </div>
  </motion.div>
));
LoadingScreen.displayName = "LoadingScreen";

/* ─── Text Beat ──────────────────────────────────────────────── */
interface TextBeatProps {
  label: string;
  heading: string;
  sub: string;
  startPct: number;
  endPct: number;
  side: "left" | "right";
  scrollProgress: MotionValue<number>;
}

const TextBeat = memo(
  ({
    label,
    heading,
    sub,
    startPct,
    endPct,
    side,
    scrollProgress,
  }: TextBeatProps) => {
    const fadeInStart = startPct;
    const fadeInEnd = startPct + 0.04;
    const fadeOutStart = endPct - 0.04;
    const fadeOutEnd = endPct;

    // Fully bounded & clamped opacity: strictly 0 outside [startPct, endPct]
    const opacity = useTransform(
      scrollProgress,
      [
        0,
        Math.max(0, fadeInStart - 0.001),
        fadeInStart,
        fadeInEnd,
        fadeOutStart,
        fadeOutEnd,
        Math.min(1, fadeOutEnd + 0.001),
        1,
      ],
      [0, 0, 0, 1, 1, 0, 0, 0],
      { clamp: true }
    );

    // Fully bounded & clamped Y movement
    const y = useTransform(
      scrollProgress,
      [
        0,
        Math.max(0, fadeInStart - 0.001),
        fadeInStart,
        fadeInEnd + 0.02,
        fadeOutStart - 0.02,
        fadeOutEnd,
        Math.min(1, fadeOutEnd + 0.001),
        1,
      ],
      [20, 20, 20, 0, 0, -20, -20, -20],
      { clamp: true }
    );

    return (
      <motion.div
        style={{ opacity, y }}
        className={`fixed z-30 pointer-events-none px-6 md:px-16 max-w-[260px] sm:max-w-xs md:max-w-sm mix-blend-difference text-white ${
          side === "left"
            ? "top-20 sm:top-1/2 sm:-translate-y-1/2 left-0 text-left"
            : "bottom-24 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto right-0 text-right"
        }`}
      >
        <p className="text-[9px] tracking-[0.4em] text-white/75 uppercase font-light mb-2 sm:mb-3">
          {label}
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extralight tracking-tight text-white leading-tight mb-2 sm:mb-3 whitespace-pre-line">
          {heading}
        </h2>
        <p className="text-[10px] sm:text-[11px] text-white/75 font-light leading-relaxed tracking-wide">
          {sub}
        </p>
      </motion.div>
    );
  }
);
TextBeat.displayName = "TextBeat";

/* ─── Main Component ─────────────────────────────────────────── */
export default function CinematicPortraitSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const ctx2dRef = useRef<CanvasRenderingContext2D | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const textureInitializedRef = useRef<boolean>(false);
  const quadBufferRef = useRef<WebGLBuffer | null>(null);
  const framesRef = useRef<(ImageBitmap | HTMLImageElement)[]>([]);
  const isPhoneRef = useRef<boolean>(false);
  
  // High-performance animation refs (Zero React state updates during scroll)
  const targetFrameRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const rafPendingRef = useRef<boolean>(false);
  const isHeroVisibleRef = useRef<boolean>(true);

  // Cached layout dimensions to prevent layout reflow during draw
  const dimsRef = useRef<{
    width: number;
    height: number;
    drawX: number;
    drawY: number;
    drawW: number;
    drawH: number;
  }>({
    width: 0,
    height: 0,
    drawX: 0,
    drawY: 0,
    drawW: 0,
    drawH: 0,
  });

  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  /* ── Direct Scroll Tracking (Zero Spring Conflict with Lenis) ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* ── Update Cached Canvas Dimensions (Adaptive for Phone & Desktop) ── */
  const updateDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isPhone = typeof window !== "undefined" && window.innerWidth < 768;
    isPhoneRef.current = isPhone;

    // Optimized DPR cap at 1.5x for razor sharpness without high-DPI fill rate overhead
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const displayW = window.innerWidth;
    const displayH = window.innerHeight;
    const targetW = Math.round(displayW * dpr);
    const targetH = Math.round(displayH * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const firstFrame = framesRef.current[0];
    const frameW = firstFrame
      ? "width" in firstFrame
        ? firstFrame.width
        : (firstFrame as HTMLImageElement).naturalWidth
      : isPhone
      ? 879
      : 1920;
    const frameH = firstFrame
      ? "height" in firstFrame
        ? firstFrame.height
        : (firstFrame as HTMLImageElement).naturalHeight
      : isPhone
      ? 1563
      : 1080;

    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (isPhone) {
      // On phones, scale to cover height so character fills mobile screen and touches bottom
      const scale = Math.max(targetW / frameW, targetH / frameH);
      drawW = Math.round(frameW * scale);
      drawH = Math.round(frameH * scale);
      // Shift slightly rightwards for composition balance
      const rightShift = Math.round(targetW * 0.05);
      drawX = Math.round((targetW - drawW) / 2) + rightShift;
      drawY = 0; // WebGL viewport bottom = 0 (exact bottom of phone screen)
    } else {
      // On desktop, contain within viewport and anchor to bottom
      const scale = Math.min(targetW / frameW, targetH / frameH);
      drawW = Math.round(frameW * scale);
      drawH = Math.round(frameH * scale);
      drawX = Math.round((targetW - drawW) / 2);
      drawY = 0; // WebGL viewport bottom = 0
    }

    dimsRef.current = {
      width: targetW,
      height: targetH,
      drawX: Math.round(drawX),
      drawY: Math.round(drawY),
      drawW: Math.round(drawW),
      drawH: Math.round(drawH),
    };
  }, []);

  /* ── Hardware-Accelerated Draw Function (High-Speed texSubImage2D in <0.02ms) ── */
  const drawFrame = useCallback((frameIndex: number) => {
    if (!isHeroVisibleRef.current) return;

    const { width, height, drawX, drawY, drawW, drawH } = dimsRef.current;
    if (width === 0 || height === 0) return;

    const gl = glRef.current;
    const frame = framesRef.current[frameIndex];

    if (!frame) {
      if (gl) {
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      return;
    }

    if (gl && programRef.current && textureRef.current && quadBufferRef.current) {
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);

      // Fast streaming texture update: allocate once with texImage2D, then stream via texSubImage2D
      if (!textureInitializedRef.current) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame);
        textureInitializedRef.current = true;
      } else {
        try {
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, frame);
        } catch {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame);
        }
      }

      // Clear full canvas to transparent
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Render character in bottom-anchored viewport with real-time GPU chroma keying
      gl.viewport(drawX, drawY, drawW, drawH);
      gl.useProgram(programRef.current);

      const posLoc = gl.getAttribLocation(programRef.current, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBufferRef.current);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      // 2D Fallback (align to bottom: targetH - drawH)
      const ctx = ctx2dRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(frame as CanvasImageSource, drawX, height - drawH, drawW, drawH);
      }
    }
  }, []);

  /* ── Single RAF Scheduler (Prevents duplicate renders & frame dropping) ── */
  const requestRender = useCallback(() => {
    if (rafPendingRef.current) return;
    rafPendingRef.current = true;

    requestAnimationFrame(() => {
      rafPendingRef.current = false;
      const target = targetFrameRef.current;
      if (target !== lastDrawnFrameRef.current) {
        drawFrame(target);
        lastDrawnFrameRef.current = target;
      }
    });
  }, [drawFrame]);

  /* ── Preload & Pre-decode all frames with ImageBitmap (Auto-selects phone or desktop frames) ── */
  useEffect(() => {
    const isPhone = typeof window !== "undefined" && window.innerWidth < 768;
    isPhoneRef.current = isPhone;

    const frames: (ImageBitmap | HTMLImageElement)[] = new Array(FRAME_COUNT);
    let loadedCount = 0;
    let isCancelled = false;

    const loadSingleFrame = async (i: number): Promise<ImageBitmap | HTMLImageElement> => {
      const img = new Image();
      img.src = frameSrc(i, isPhone);

      await new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

      if ("createImageBitmap" in window) {
        try {
          const bmp = await createImageBitmap(img);
          return bmp;
        } catch {
          return img;
        }
      }

      if ("decode" in img) {
        try {
          await img.decode();
        } catch {}
      }
      return img;
    };

    const runPreloader = async () => {
      // 1. Immediately load frame 0 for instant initial paint
      const first = await loadSingleFrame(0);
      if (isCancelled) return;

      frames[0] = first;
      framesRef.current = frames;
      loadedCount++;
      setLoadProgress((loadedCount / FRAME_COUNT) * 100);

      targetFrameRef.current = 0;
      updateDimensions();
      requestRender();

      // 2. Concurrently load all other frames in chunks of 12 for smooth bandwidth utilization
      const CHUNK_SIZE = 12;
      for (let i = 1; i < FRAME_COUNT; i += CHUNK_SIZE) {
        if (isCancelled) return;
        const chunkIndices: number[] = [];
        for (let c = i; c < Math.min(i + CHUNK_SIZE, FRAME_COUNT); c++) {
          chunkIndices.push(c);
        }

        await Promise.all(
          chunkIndices.map(async (idx) => {
            const frame = await loadSingleFrame(idx);
            if (isCancelled) return;
            frames[idx] = frame;
            loadedCount++;
            setLoadProgress((loadedCount / FRAME_COUNT) * 100);
          })
        );
      }

      if (!isCancelled) {
        setIsReady(true);
      }
    };

    runPreloader();

    return () => {
      isCancelled = true;
      // Close any allocated ImageBitmaps to free GPU memory
      framesRef.current.forEach((f) => {
        if (f && "close" in f && typeof (f as ImageBitmap).close === "function") {
          try {
            (f as ImageBitmap).close();
          } catch {}
        }
      });
      framesRef.current = [];
    };
  }, [updateDimensions, requestRender]);

  /* ── Initialize WebGL Shader & Hardware Acceleration Context ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        powerPreference: "high-performance",
      }) ||
      (canvas.getContext("experimental-webgl", {
        alpha: true,
        premultipliedAlpha: true,
      }) as WebGLRenderingContext | null);

    if (gl) {
      glRef.current = gl;

      // Enable standard premultiplied alpha blending
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      // Vertex Shader
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
          v_uv = (a_position + 1.0) * 0.5;
          v_uv.y = 1.0 - v_uv.y;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      // Fragment Shader: Real-time GPU chroma/luminance keying with strict premultiplied alpha
      const fsSource = `
        precision mediump float;
        varying vec2 v_uv;
        uniform sampler2D u_image;

        void main() {
          vec4 color = texture2D(u_image, v_uv);
          float maxVal = max(color.r, max(color.g, color.b));
          
          // Studio background keyed out on GPU in real-time
          // maxVal >= 205/255 (0.8039) -> Transparent (background)
          // maxVal <= 130/255 (0.5098) -> Fully Opaque subject
          // Smooth transition zone for anti-aliased hair curls, glasses, and silhouette edges
          float alpha = 1.0;
          if (maxVal >= 0.80392) {
            alpha = 0.0;
          } else if (maxVal <= 0.50980) {
            alpha = 1.0;
          } else {
            alpha = (0.80392 - maxVal) / (0.80392 - 0.50980);
          }
          
          float a = color.a * alpha;
          // Strict premultiplied alpha: RGB * a, a (guarantees zero RGB on transparent pixels, eliminating black flashes)
          gl_FragColor = vec4(color.rgb * a, a);
        }
      `;

      const createShader = (type: number, src: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
      };

      const vShader = createShader(gl.VERTEX_SHADER, vsSource);
      const fShader = createShader(gl.FRAGMENT_SHADER, fsSource);

      if (vShader && fShader) {
        const program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vShader);
          gl.attachShader(program, fShader);
          gl.linkProgram(program);
          programRef.current = program;
        }
      }

      // Full-screen quad buffer
      const quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );
      quadBufferRef.current = quad;

      // Texture
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureRef.current = texture;
    } else {
      // Fallback to 2D canvas
      const ctx = canvas.getContext("2d", { alpha: true });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "medium";
        ctx2dRef.current = ctx;
      }
    }

    updateDimensions();

    const handleResize = () => {
      updateDimensions();
      if (lastDrawnFrameRef.current >= 0) {
        drawFrame(lastDrawnFrameRef.current);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [updateDimensions, drawFrame]);

  /* ── Track Hero Viewport Visibility (Pause renders when scrolled offscreen) ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        isHeroVisibleRef.current = isIntersecting;
        setIsHeroVisible(isIntersecting);
        if (isIntersecting && lastDrawnFrameRef.current >= 0) {
          drawFrame(lastDrawnFrameRef.current);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [drawFrame]);

  /* ── Draw frame 0 once ready ── */
  useEffect(() => {
    if (isReady) {
      updateDimensions();
      targetFrameRef.current = 0;
      requestRender();
    }
  }, [isReady, updateDimensions, requestRender]);

  /* ── Direct Scroll Sync → targetFrameRef (Instant 1:1 Butter Smooth Scrubbing) ── */
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const clamped = Math.min(1, Math.max(0, v));
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(clamped * (FRAME_COUNT - 1)))
      );

      if (targetFrameRef.current !== frameIndex) {
        targetFrameRef.current = frameIndex;
        requestRender();
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, requestRender]);

  return (
    <>
      {/* Loading overlay */}
      <LoadingScreen progress={loadProgress} isReady={isReady} />

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="relative bg-white h-[200vh] md:h-[320vh]"
      >
        {/* Sticky viewport */}
        <div className="sticky top-0 w-full h-screen overflow-hidden bg-white">
          {/* LAYER 1: Background */}
          <div className="absolute inset-0 bg-white z-0" />

          {/* LAYER 2: Fluid Swirling PORTFOLIO Typography (Isolated WebGL Fluid Layer) */}
          <FluidPortfolioCanvas className="z-10" isVisible={isHeroVisible} />

          {/* LAYER 3: Hardware-Accelerated Character Sequence (Zero-lag GPU Shader Keying) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            style={{ display: "block" }}
          />

          {/* LAYER 4: Text beats */}
          {isReady && (
            <>
              <TextBeat
                label="The Frame"
                heading={"SEEING FROM\nANOTHER ANGLE"}
                sub="A portrait captured through movement."
                startPct={0.0}
                endPct={0.20}
                side="left"
                scrollProgress={scrollYProgress}
              />
              <TextBeat
                label="The Camera Moves"
                heading={"NOT THE\nSUBJECT"}
                sub="A frozen moment. A moving perspective."
                startPct={0.25}
                endPct={0.45}
                side="right"
                scrollProgress={scrollYProgress}
              />
              <TextBeat
                label="The Reveal"
                heading={"FROM PROFILE\nTO PRESENCE"}
                sub="The camera completes its journey around the frame."
                startPct={0.50}
                endPct={0.70}
                side="left"
                scrollProgress={scrollYProgress}
              />
              <TextBeat
                label="The Final Frame"
                heading="LOOK CLOSER."
                sub="A different perspective changes everything."
                startPct={0.75}
                endPct={0.96}
                side="right"
                scrollProgress={scrollYProgress}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
