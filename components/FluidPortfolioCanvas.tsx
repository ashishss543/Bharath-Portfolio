"use client";

import React, { useEffect, useRef, memo } from "react";

interface FluidPortfolioCanvasProps {
  className?: string;
  isVisible?: boolean;
}

interface TextFlowParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  ease: number;
  friction: number;
  alpha: number;
}

const FluidPortfolioCanvas: React.FC<FluidPortfolioCanvasProps> = memo(
  ({ className = "", isVisible = true }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number>(0);
    const isVisibleRef = useRef<boolean>(isVisible);
    const renderFrameRef = useRef<() => void>(() => {});

    // Update visibility ref and trigger repaint when returning to view
    useEffect(() => {
      isVisibleRef.current = isVisible;
      if (isVisible) {
        renderFrameRef.current();
      }
    }, [isVisible]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const isMobile = window.innerWidth < 768;

      /* ════════════════════════════════════════════════════════════════════
         MODE 1: MOBILE (PHONE) — INTERACTIVE "TEXT FLOW" PARTICLE SYSTEM
         ════════════════════════════════════════════════════════════════════ */
      if (isMobile) {
        const ctx2d = canvas.getContext("2d", { alpha: true });
        if (!ctx2d) return;

        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particles: TextFlowParticle[] = [];
        let touchX = -1000;
        let touchY = -1000;
        let prevTouchX = -1000;
        let prevTouchY = -1000;
        let touchVelX = 0;
        let touchVelY = 0;
        let isTouching = false;
        let isLoopRunning = false;
        let lastTouchTime = 0;

        const startMobileLoop = () => {
          if (!isLoopRunning && isVisibleRef.current) {
            isLoopRunning = true;
            animationFrameRef.current = requestAnimationFrame(mobileLoop);
          }
        };

        const renderMobileFrame = () => {
          if (!ctx2d || !canvas || !isVisibleRef.current) return;

          ctx2d.clearRect(0, 0, canvas.width, canvas.height);

          const time = performance.now();
          const touchRadius = 80 * dpr;
          let hasMovement = false;

          // Decay touch velocity
          if (!isTouching || time - lastTouchTime > 80) {
            touchVelX *= 0.6;
            touchVelY *= 0.6;
          }

          ctx2d.fillStyle = "#0f0f0f";

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // 1. Touch repulsion / Flow physics
            if (isTouching) {
              const dx = p.x - touchX;
              const dy = p.y - touchY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < touchRadius && dist > 0.001) {
                const force = 1 - dist / touchRadius;
                const angle = Math.atan2(dy, dx);
                // Push particles outwards with flow momentum
                p.vx += Math.cos(angle) * force * 10 * dpr + touchVelX * 0.35;
                p.vy += Math.sin(angle) * force * 10 * dpr + touchVelY * 0.35;
                hasMovement = true;
              }
            }

            // 2. Spring back to origin (restoring letter structure)
            const dxOrigin = p.originX - p.x;
            const dyOrigin = p.originY - p.y;
            p.vx += dxOrigin * p.ease;
            p.vy += dyOrigin * p.ease;

            // 3. Friction damping
            p.vx *= p.friction;
            p.vy *= p.friction;

            p.x += p.vx;
            p.y += p.vy;

            // Check if still moving
            if (
              Math.abs(p.vx) > 0.08 ||
              Math.abs(p.vy) > 0.08 ||
              Math.abs(dxOrigin) > 0.5 ||
              Math.abs(dyOrigin) > 0.5
            ) {
              hasMovement = true;
            }

            // Subtle ambient shimmer/drift
            const floatX = Math.sin(time * 0.0018 + p.originY * 0.02) * (0.35 * dpr);
            const floatY = Math.cos(time * 0.0018 + p.originX * 0.02) * (0.35 * dpr);

            // Draw particle point
            ctx2d.fillRect(
              p.x + floatX - p.size * 0.5,
              p.y + floatY - p.size * 0.5,
              p.size,
              p.size
            );
          }

          if (hasMovement || isTouching) {
            startMobileLoop();
          }
        };

        const mobileLoop = () => {
          if (!isVisibleRef.current) {
            isLoopRunning = false;
            return;
          }
          renderMobileFrame();
          if (isLoopRunning) {
            animationFrameRef.current = requestAnimationFrame(mobileLoop);
          }
        };

        const initParticles = () => {
          if (!canvas || !ctx2d) return;
          dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = window.innerWidth;
          const h = window.innerHeight;
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);

          // Offscreen canvas to sample the rasterized "PORTFOLIO" typography
          const offCanvas = document.createElement("canvas");
          offCanvas.width = canvas.width;
          offCanvas.height = canvas.height;
          const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
          if (!offCtx) return;

          const targetWidth = canvas.width * 0.90;
          let fontSize = Math.round(canvas.width * 0.18);
          offCtx.font = `900 ${fontSize}px "Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif`;
          if ("letterSpacing" in offCtx) {
            (offCtx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0.02em";
          }

          const measured = offCtx.measureText("PORTFOLIO").width;
          if (measured > 0) {
            fontSize = Math.round(fontSize * (targetWidth / measured));
            offCtx.font = `900 ${fontSize}px "Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif`;
          }

          offCtx.textAlign = "center";
          offCtx.textBaseline = "middle";
          offCtx.fillStyle = "#0f0f0f";

          const textX = canvas.width / 2;
          const textY = canvas.height * 0.23;
          offCtx.fillText("PORTFOLIO", textX, textY);

          // Sample pixels within the bounding box
          const textWidth = targetWidth * 1.05;
          const textHeight = fontSize * 1.1;
          const startX = Math.max(0, Math.floor(textX - textWidth * 0.5));
          const startY = Math.max(0, Math.floor(textY - textHeight * 0.5));
          const sampleW = Math.min(canvas.width - startX, Math.ceil(textWidth));
          const sampleH = Math.min(canvas.height - startY, Math.ceil(textHeight));

          const imgData = offCtx.getImageData(startX, startY, sampleW, sampleH);
          const data = imgData.data;

          const newParticles: TextFlowParticle[] = [];
          // Adaptive sampling step for ~900-1400 particles on mobile (butter-smooth 60/120 FPS)
          const step = Math.max(3, Math.round(3.0 * dpr));

          for (let y = 0; y < sampleH; y += step) {
            for (let x = 0; x < sampleW; x += step) {
              const index = (y * sampleW + x) * 4;
              const alpha = data[index + 3];
              if (alpha > 120) {
                const posX = startX + x;
                const posY = startY + y;
                newParticles.push({
                  x: posX,
                  y: posY,
                  originX: posX,
                  originY: posY,
                  vx: 0,
                  vy: 0,
                  size: (1.2 + Math.random() * 0.8) * dpr,
                  ease: 0.055 + Math.random() * 0.035, // Spring return stiffness
                  friction: 0.89 + Math.random() * 0.03, // Velocity decay
                  alpha: 0.85 + Math.random() * 0.15,
                });
              }
            }
          }

          particles = newParticles;
          renderMobileFrame();
        };

        const handleTouchStart = (e: TouchEvent) => {
          if (!canvas || e.touches.length === 0) return;
          const rect = canvas.getBoundingClientRect();
          const clientX = e.touches[0].clientX;
          const clientY = e.touches[0].clientY;

          touchX = (clientX - rect.left) * dpr;
          touchY = (clientY - rect.top) * dpr;
          prevTouchX = touchX;
          prevTouchY = touchY;
          touchVelX = 0;
          touchVelY = 0;
          isTouching = true;
          lastTouchTime = performance.now();
          startMobileLoop();
        };

        const handleTouchMove = (e: TouchEvent) => {
          if (!canvas || e.touches.length === 0) return;
          const rect = canvas.getBoundingClientRect();
          const clientX = e.touches[0].clientX;
          const clientY = e.touches[0].clientY;

          const currentX = (clientX - rect.left) * dpr;
          const currentY = (clientY - rect.top) * dpr;

          const vx = currentX - prevTouchX;
          const vy = currentY - prevTouchY;

          // Clamp touch velocity
          const maxVel = 20 * dpr;
          touchVelX = Math.max(-maxVel, Math.min(maxVel, vx));
          touchVelY = Math.max(-maxVel, Math.min(maxVel, vy));

          prevTouchX = touchX;
          prevTouchY = touchY;
          touchX = currentX;
          touchY = currentY;
          isTouching = true;
          lastTouchTime = performance.now();

          startMobileLoop();
        };

        const handleTouchEnd = () => {
          isTouching = false;
        };

        initParticles();
        renderFrameRef.current = renderMobileFrame;

        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchend", handleTouchEnd, { passive: true });
        window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
        window.addEventListener("resize", initParticles, { passive: true });

        return () => {
          cancelAnimationFrame(animationFrameRef.current);
          isLoopRunning = false;
          window.removeEventListener("touchstart", handleTouchStart);
          window.removeEventListener("touchmove", handleTouchMove);
          window.removeEventListener("touchend", handleTouchEnd);
          window.removeEventListener("touchcancel", handleTouchEnd);
          window.removeEventListener("resize", initParticles);
        };
      }

      /* ════════════════════════════════════════════════════════════════════
         MODE 2: DESKTOP — HIGH-PERFORMANCE WEBGL FLUID SIMULATION
         ════════════════════════════════════════════════════════════════════ */
      const gl =
        canvas.getContext("webgl", {
          alpha: true,
          premultipliedAlpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }) ||
        (canvas.getContext("experimental-webgl", {
          alpha: true,
          premultipliedAlpha: true,
        }) as WebGLRenderingContext | null);

      if (!gl) {
        // Simple 2D fallback for desktop without WebGL
        const ctx2d = canvas.getContext("2d");
        if (ctx2d) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = window.innerWidth;
          const h = window.innerHeight;
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
          const targetWidth = canvas.width * 0.88;
          let fontSize = Math.round(canvas.width * 0.21);
          ctx2d.font = `900 ${fontSize}px "Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif`;
          const measured = ctx2d.measureText("PORTFOLIO").width;
          if (measured > 0) {
            fontSize = Math.round(fontSize * (targetWidth / measured));
            ctx2d.font = `900 ${fontSize}px "Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif`;
          }
          ctx2d.textAlign = "center";
          ctx2d.textBaseline = "middle";
          ctx2d.fillStyle = "#0f0f0f";
          ctx2d.fillText("PORTFOLIO", canvas.width / 2, canvas.height * 0.48);
        }
        return;
      }

      const glCtx: WebGLRenderingContext = gl;

      /* ─── Simulation Parameters ─── */
      const SIM_RES = 128; // 128x128 fluid simulation grid for 60fps GPU performance
      const DECAY = 0.94; // Balanced medium fluid dissipation speed
      const STRENGTH = 2.6; // Balanced medium push strength
      const CURL = 3.6; // Refined medium swirl/vorticity strength
      const DISPLACEMENT_SCALE = 0.13; // Refined medium liquid texture warping factor

      /* ─── State ─── */
      let mouseX = 0.5;
      let mouseY = 0.5;
      let prevMouseX = 0.5;
      let prevMouseY = 0.5;
      let mouseVelX = 0;
      let mouseVelY = 0;
      let isInteracting = false;
      let activityLevel = 0.0;
      let lastMoveTime = 0;

      // Generous normalized bounding box of the PORTFOLIO typography for fluid trigger
      const textBounds = {
        minX: 0.0,
        maxX: 1.0,
        minY: 0.05,
        maxY: 0.95,
      };

      /* ─── Shaders ─── */
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
          v_uv = (a_position + 1.0) * 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      const simFsSource = `
        precision highp float;
        varying vec2 v_uv;
        uniform sampler2D u_velocity_texture;
        uniform vec2 u_mouse;
        uniform vec2 u_mouse_vel;
        uniform float u_radius;
        uniform float u_strength;
        uniform float u_curl;
        uniform float u_decay;
        uniform vec2 u_resolution;
        uniform float u_aspect;
        uniform float u_is_interacting;

        void main() {
          // Self-Advection: velocity vectors flow along streamlines for authentic liquid swirl
          vec2 currentVel = texture2D(u_velocity_texture, v_uv).xy;
          vec2 advectedCoord = clamp(v_uv - currentVel * 0.008, 0.0, 1.0);
          vec2 vel = texture2D(u_velocity_texture, advectedCoord).xy;

          vec2 diff = v_uv - u_mouse;
          diff.x *= u_aspect;
          float dist = length(diff);

          if (u_is_interacting > 0.5 && dist < u_radius) {
            float normDist = dist / u_radius;
            float falloff = smoothstep(1.0, 0.0, normDist);
            falloff = pow(falloff, 1.6);

            vec2 push = u_mouse_vel * falloff * u_strength;

            vec2 perp = vec2(-diff.y, diff.x);
            float perpLen = length(perp);
            if (perpLen > 0.0001) {
              perp /= perpLen;
            }
            float crossVal = u_mouse_vel.x * diff.y - u_mouse_vel.y * diff.x;
            float curlSign = sign(crossVal);
            if (abs(curlSign) < 0.1) curlSign = 1.0;
            
            vec2 swirl = perp * curlSign * falloff * u_curl * length(u_mouse_vel);

            vel += push + swirl;
          }

          vel *= u_decay;
          gl_FragColor = vec4(vel, 0.0, 1.0);
        }
      `;

      const renderFsSource = `
        precision highp float;
        varying vec2 v_uv;
        uniform sampler2D u_text_texture;
        uniform sampler2D u_velocity_texture;
        uniform float u_disp_scale;
        uniform float u_activity;

        void main() {
          vec2 vel = texture2D(u_velocity_texture, v_uv).xy;
          vec2 offset = vel * u_disp_scale * u_activity;
          vec2 displacedUv = clamp(v_uv - offset, 0.0, 1.0);

          vec4 textColor = texture2D(u_text_texture, displacedUv);

          float a = textColor.a;
          gl_FragColor = vec4(textColor.rgb * a, a);
        }
      `;

      function createShader(gl: WebGLRenderingContext, type: number, src: string) {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
      }

      function createProgram(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string) {
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
        if (!vs || !fs) return null;

        const program = gl.createProgram();
        if (!program) return null;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
      }

      const simProgram = createProgram(glCtx, vsSource, simFsSource);
      const renderProgram = createProgram(glCtx, vsSource, renderFsSource);

      if (!simProgram || !renderProgram) return;

      const activeSimProgram: WebGLProgram = simProgram;
      const activeRenderProgram: WebGLProgram = renderProgram;

      const quadBuffer = glCtx.createBuffer();
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, quadBuffer);
      glCtx.bufferData(
        glCtx.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        glCtx.STATIC_DRAW
      );

      /* ─── Text Canvas & Texture ─── */
      const textCanvas = document.createElement("canvas");
      const textCtx = textCanvas.getContext("2d", { alpha: true });
      const textTexture = glCtx.createTexture();

      function updateTextTexture() {
        if (!textCtx || !canvas) return;
        const w = canvas.width || 1920;
        const h = canvas.height || 1080;
        textCanvas.width = w;
        textCanvas.height = h;

        textCtx.clearRect(0, 0, w, h);
        const targetWidth = w * 0.88;
        let fontSize = Math.round(w * 0.21);
        textCtx.font = `900 ${fontSize}px "Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif`;

        if ("letterSpacing" in textCtx) {
          (textCtx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0.02em";
        }

        const measured = textCtx.measureText("PORTFOLIO").width;
        if (measured > 0) {
          fontSize = Math.round(fontSize * (targetWidth / measured));
          textCtx.font = `900 ${fontSize}px "Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif`;
        }

        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";
        textCtx.fillStyle = "#0f0f0f";

        const textX = w / 2;
        const textY = h * 0.48;
        textCtx.fillText("PORTFOLIO", textX, textY);

        // Calculate exact normalized bounding box of the letters
        const metrics = textCtx.measureText("PORTFOLIO");
        const measuredWidth = metrics.width || w * 0.85;
        const textHeight = fontSize * 0.78;

        textBounds.minX = Math.max(0.01, (textX - measuredWidth * 0.5) / w);
        textBounds.maxX = Math.min(0.99, (textX + measuredWidth * 0.5) / w);
        textBounds.minY = Math.max(0.01, (textY - textHeight * 0.52) / h);
        textBounds.maxY = Math.min(0.99, (textY + textHeight * 0.52) / h);
        glCtx.bindTexture(glCtx.TEXTURE_2D, textTexture);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR);
        glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, true);
        glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, textCanvas);
        glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, false);
      }

      /* ─── Ping-Pong FBOs for Velocity Field ─── */
      function createFBO(res: number) {
        const tex = glCtx.createTexture();
        glCtx.bindTexture(glCtx.TEXTURE_2D, tex);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR);
        glCtx.texImage2D(
          glCtx.TEXTURE_2D,
          0,
          glCtx.RGBA,
          res,
          res,
          0,
          glCtx.RGBA,
          glCtx.UNSIGNED_BYTE,
          null
        );

        const fbo = glCtx.createFramebuffer();
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, fbo);
        glCtx.framebufferTexture2D(
          glCtx.FRAMEBUFFER,
          glCtx.COLOR_ATTACHMENT0,
          glCtx.TEXTURE_2D,
          tex,
          0
        );

        return { tex, fbo };
      }

      let fboA = createFBO(SIM_RES);
      let fboB = createFBO(SIM_RES);

      /* ─── Resize Canvas ─── */
      function resize() {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;

        const targetW = Math.round(w * dpr);
        const targetH = Math.round(h * dpr);

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        updateTextTexture();
        renderFrame();
      }

      resize();

      /* ─── Pointer Event Listeners (Desktop) ─── */
      function handlePointerMove(e: MouseEvent) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        const nx = (clientX - rect.left) / rect.width;
        const ny = (clientY - rect.top) / rect.height;

        const isTouchingLetters =
          nx >= textBounds.minX &&
          nx <= textBounds.maxX &&
          ny >= textBounds.minY &&
          ny <= textBounds.maxY;

        const vx = nx - prevMouseX;
        const vy = -(ny - prevMouseY);

        mouseVelX = mouseVelX * 0.35 + vx * 0.65;
        mouseVelY = mouseVelY * 0.35 + vy * 0.65;

        prevMouseX = nx;
        prevMouseY = ny;
        mouseX = nx;
        mouseY = 1.0 - ny;

        if (isTouchingLetters) {
          isInteracting = true;
          activityLevel = 1.0;
          lastMoveTime = performance.now();
        } else {
          isInteracting = false;
        }
      }

      function handlePointerLeave() {
        isInteracting = false;
      }

      /* ─── Animation Loop (Desktop) ─── */
      let isLoopRunning = false;

      function renderFrame() {
        if (!isVisibleRef.current) return;

        const now = performance.now();

        if (!isInteracting || now - lastMoveTime > 100) {
          mouseVelX *= 0.86;
          mouseVelY *= 0.86;
          if (Math.abs(mouseVelX) < 0.00005 && Math.abs(mouseVelY) < 0.00005) {
            isInteracting = false;
          }
        }

        if (!isInteracting) {
          activityLevel *= 0.94;
          if (activityLevel < 0.005) {
            activityLevel = 0.0;
          }
        }

        const aspect = canvas ? canvas.width / canvas.height : 16 / 9;

        /* ── Step 1: Simulation Pass (Ping-Pong) ── */
        if (activityLevel > 0.0) {
          glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, fboB.fbo);
          glCtx.viewport(0, 0, SIM_RES, SIM_RES);
          glCtx.useProgram(activeSimProgram);

          glCtx.activeTexture(glCtx.TEXTURE0);
          glCtx.bindTexture(glCtx.TEXTURE_2D, fboA.tex);
          glCtx.uniform1i(glCtx.getUniformLocation(activeSimProgram, "u_velocity_texture"), 0);

          glCtx.uniform2f(glCtx.getUniformLocation(activeSimProgram, "u_mouse"), mouseX, mouseY);
          glCtx.uniform2f(glCtx.getUniformLocation(activeSimProgram, "u_mouse_vel"), mouseVelX * 26.0, mouseVelY * 26.0);
          glCtx.uniform1f(glCtx.getUniformLocation(activeSimProgram, "u_radius"), 0.19);
          glCtx.uniform1f(glCtx.getUniformLocation(activeSimProgram, "u_strength"), STRENGTH);
          glCtx.uniform1f(glCtx.getUniformLocation(activeSimProgram, "u_curl"), CURL);
          glCtx.uniform1f(glCtx.getUniformLocation(activeSimProgram, "u_decay"), DECAY);
          glCtx.uniform2f(glCtx.getUniformLocation(activeSimProgram, "u_resolution"), SIM_RES, SIM_RES);
          glCtx.uniform1f(glCtx.getUniformLocation(activeSimProgram, "u_aspect"), aspect);
          glCtx.uniform1f(glCtx.getUniformLocation(activeSimProgram, "u_is_interacting"), isInteracting ? 1.0 : 0.0);

          const simPosLoc = glCtx.getAttribLocation(activeSimProgram, "a_position");
          glCtx.enableVertexAttribArray(simPosLoc);
          glCtx.bindBuffer(glCtx.ARRAY_BUFFER, quadBuffer);
          glCtx.vertexAttribPointer(simPosLoc, 2, glCtx.FLOAT, false, 0, 0);

          glCtx.drawArrays(glCtx.TRIANGLES, 0, 6);

          const temp = fboA;
          fboA = fboB;
          fboB = temp;
        }

        /* ── Step 2: Render Displaced Text to Screen ── */
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
        if (canvas) {
          glCtx.viewport(0, 0, canvas.width, canvas.height);
        }
        glCtx.clearColor(0, 0, 0, 0);
        glCtx.clear(glCtx.COLOR_BUFFER_BIT);

        glCtx.enable(glCtx.BLEND);
        glCtx.blendFunc(glCtx.ONE, glCtx.ONE_MINUS_SRC_ALPHA);

        glCtx.useProgram(activeRenderProgram);

        glCtx.activeTexture(glCtx.TEXTURE0);
        glCtx.bindTexture(glCtx.TEXTURE_2D, textTexture);
        glCtx.uniform1i(glCtx.getUniformLocation(activeRenderProgram, "u_text_texture"), 0);

        glCtx.activeTexture(glCtx.TEXTURE1);
        glCtx.bindTexture(glCtx.TEXTURE_2D, fboA.tex);
        glCtx.uniform1i(glCtx.getUniformLocation(activeRenderProgram, "u_velocity_texture"), 1);

        glCtx.uniform1f(glCtx.getUniformLocation(activeRenderProgram, "u_disp_scale"), DISPLACEMENT_SCALE);
        glCtx.uniform1f(glCtx.getUniformLocation(activeRenderProgram, "u_activity"), activityLevel);

        const renderPosLoc = glCtx.getAttribLocation(activeRenderProgram, "a_position");
        glCtx.enableVertexAttribArray(renderPosLoc);
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, quadBuffer);
        glCtx.vertexAttribPointer(renderPosLoc, 2, glCtx.FLOAT, false, 0, 0);

        glCtx.drawArrays(glCtx.TRIANGLES, 0, 6);
      }

      function loop() {
        if (!isVisibleRef.current) {
          isLoopRunning = false;
          return;
        }

        renderFrame();

        if (isInteracting || activityLevel > 0.001) {
          animationFrameRef.current = requestAnimationFrame(loop);
        } else {
          isLoopRunning = false;
        }
      }

      function startLoop() {
        if (!isLoopRunning && isVisibleRef.current) {
          isLoopRunning = true;
          animationFrameRef.current = requestAnimationFrame(loop);
        }
      }

      renderFrame();
      renderFrameRef.current = renderFrame;

      function handlePointerMoveOptimized(e: MouseEvent) {
        handlePointerMove(e);
        if (isInteracting) {
          startLoop();
        }
      }

      window.addEventListener("mousemove", handlePointerMoveOptimized, { passive: true });
      window.addEventListener("mouseleave", handlePointerLeave, { passive: true });

      return () => {
        cancelAnimationFrame(animationFrameRef.current);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", handlePointerMoveOptimized);
        window.removeEventListener("mouseleave", handlePointerLeave);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
        style={{
          display: "block",
          touchAction: "pan-y",
        }}
      />
    );
  }
);

FluidPortfolioCanvas.displayName = "FluidPortfolioCanvas";
export default FluidPortfolioCanvas;
