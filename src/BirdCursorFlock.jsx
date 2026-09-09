import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * BirdCursorFlock
 * ----------------
 * A small flock of pixel-art birds that trail the mouse cursor,
 * each with its own lag/spring settings so they read as a loose
 * flock rather than a single duplicated sprite.
 *
 * - Renders nothing on touch/mobile devices (checks for a coarse
 *   pointer + touch support before mounting anything).
 * - pointer-events: none on every layer, so it never blocks
 *   clicks, hovers, or text selection underneath.
 * - Wing-flap animation is a simple 3-frame sprite drawn as
 *   inline SVG, no external assets needed.
 *
 * Usage:
 *   Drop <BirdCursorFlock /> once, near the root of your app
 *   (e.g. in App.jsx / layout.jsx), after your normal content.
 *
 * Requires `framer-motion` to already be a dependency.
 */

// ---- Per-bird flight personality -------------------------------------
// Each bird gets its own spring stiffness/damping (how "eager" it is to
// catch up to the leader), a fixed offset from the cursor, a flap speed,
// and a size, so the flock doesn't look like clones.
const BIRD_CONFIG = [
  { offsetX: 0, offsetY: 0, stiffness: 220, damping: 22, flapMs: 90, size: 34 },
  { offsetX: -34, offsetY: -14, stiffness: 140, damping: 20, flapMs: 110, size: 27 },
  { offsetX: 30, offsetY: -20, stiffness: 130, damping: 18, flapMs: 130, size: 25 },
  { offsetX: -22, offsetY: 18, stiffness: 100, damping: 16, flapMs: 150, size: 20 },
  { offsetX: 24, offsetY: 22, stiffness: 90, damping: 15, flapMs: 170, size: 18 },
];

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(true); // default true = hidden until checked
  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const noHover = window.matchMedia?.("(hover: none)")?.matches;
    setIsTouch(Boolean(coarse || noHover));
  }, []);
  return isTouch;
}

/**
 * Gradient bird sprite matching the native91 logo palette:
 * sky-blue/violet head, purple-into-orange-red body, deep blue tail.
 * `uid` namespaces the gradient ids so multiple birds rendering at
 * once never collide (SVG gradient ids must be unique per document).
 * `flapFrame` is 0, 1, or 2 (wing position).
 */
function BirdSprite({ flapFrame, uid }) {
  const wings = [
    // wings up
    "M14 11 Q19 4 26 8 L22 12 Q18 9 14 11 Z",
    // wings mid
    "M13 12 Q19 9 27 12 L27 14 Q19 12 13 14 Z",
    // wings down
    "M14 11 Q19 16 26 14 L22 11 Q18 14 14 11 Z",
  ][flapFrame];

  const headId = `head-${uid}`;
  const bodyId = `body-${uid}`;
  const wingId = `wing-${uid}`;
  const tailId = `tail-${uid}`;

  return (
    <svg viewBox="0 0 36 26" width="170%" height="170%" style={{ display: "block" }}>
      <defs>
        <linearGradient id={headId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FA8E0" />
          <stop offset="55%" stopColor="#6C5CE7" />
          <stop offset="100%" stopColor="#8B3FA8" />
        </linearGradient>
        <linearGradient id={bodyId} x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#6C4FC9" />
          <stop offset="45%" stopColor="#B8408F" />
          <stop offset="75%" stopColor="#E8622C" />
          <stop offset="100%" stopColor="#F2A33C" />
        </linearGradient>
        <linearGradient id={wingId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B3A9E" />
          <stop offset="55%" stopColor="#9C3E86" />
          <stop offset="100%" stopColor="#E0552C" />
        </linearGradient>
        <linearGradient id={tailId} x1="0%" y1="0%" x2="30%" y2="100%">
          <stop offset="0%" stopColor="#3A7FC4" />
          <stop offset="100%" stopColor="#1F4F8F" />
        </linearGradient>
      </defs>

      {/* tail */}
      <path d="M14 13 C10 15 6 18 3 22 C6 21 8.5 19.5 10.5 18 C10 20 9 22 7.5 24 C11 22 13 19.5 14 17 Z" fill={`url(#${tailId})`} />
      {/* body */}
      <path d="M10 11 C9 7 12 4 17 3.5 C21 3 25 4.5 26 7.5 C27 10 26 13 22.5 15 C19 17 14 17 11.5 15 C10.5 14 10 12.5 10 11 Z" fill={`url(#${bodyId})`} />
      {/* wing (animated) */}
      <path d={wings} fill={`url(#${wingId})`} />
      {/* head */}
      <circle cx="25.5" cy="6.5" r="4.6" fill={`url(#${headId})`} />
      {/* beak */}
      <path d="M29.5 6.6 L33 5.8 L30 8.2 Z" fill="#F2A33C" />
      {/* eye */}
      <circle cx="27" cy="4.9" r="0.7" fill="#1A1A1A" />
    </svg>
  );
}

function Bird({ leaderX, leaderY, config, uid }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: config.stiffness, damping: config.damping });
  const springY = useSpring(y, { stiffness: config.stiffness, damping: config.damping });

  const [flapFrame, setFlapFrame] = useState(0);
  const facingLeftRef = useRef(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const lastX = useRef(0);

  // Follow the leader (mouse) position, offset per-bird, with a light
  // random jitter recomputed occasionally so the flock drifts naturally.
  useEffect(() => {
    let jitterX = 0;
    let jitterY = 0;
    const jitterInterval = setInterval(() => {
      jitterX = (Math.random() - 0.5) * 12;
      jitterY = (Math.random() - 0.5) * 12;
    }, 900 + Math.random() * 600);

    const unsubX = leaderX.on("change", (v) => {
      const target = v + config.offsetX + jitterX;
      x.set(target);
      if (Math.abs(target - lastX.current) > 0.5) {
        const goingLeft = target < lastX.current;
        if (goingLeft !== facingLeftRef.current) {
          facingLeftRef.current = goingLeft;
          setFacingLeft(goingLeft);
        }
      }
      lastX.current = target;
    });
    const unsubY = leaderY.on("change", (v) => {
      y.set(v + config.offsetY + jitterY);
    });

    return () => {
      unsubX();
      unsubY();
      clearInterval(jitterInterval);
    };
  }, [leaderX, leaderY, config, x, y]);

  // Wing flap cycle, independent per-bird speed.
  useEffect(() => {
    const id = setInterval(() => {
      setFlapFrame((f) => (f + 1) % 3);
    }, config.flapMs);
    return () => clearInterval(id);
  }, [config.flapMs]);

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: config.size,
        height: config.size * 0.75,
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        scaleX: facingLeft ? -1 : 1,
        pointerEvents: "none",
        zIndex: 2147483647,
        willChange: "transform",
      }}
    >
      <BirdSprite flapFrame={flapFrame} uid={uid} />
    </motion.div>
  );
}

export default function BirdCursorFlock({ birdCount = 5, hideNativeCursor = true }) {
  const isTouch = useIsTouchDevice();
  const mouseX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 0
  );
  const mouseY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0
  );

  useEffect(() => {
    if (isTouch) return;
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isTouch, mouseX, mouseY]);

  useEffect(() => {
    if (!hideNativeCursor || isTouch) return;
    // A plain `body { cursor: none }` gets overridden the moment the
    // pointer is over a link/button/input with its own cursor style
    // (e.g. cursor: pointer). Injecting a high-specificity stylesheet
    // rule for every element is what actually keeps the arrow hidden
    // everywhere, including on hover states.
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-bird-cursor-style", "true");
    styleEl.textContent = `* { cursor: none !important; }`;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  }, [hideNativeCursor, isTouch]);

  if (isTouch) return null;

  const birds = BIRD_CONFIG.slice(0, Math.max(1, Math.min(birdCount, BIRD_CONFIG.length)));

  return (
    <>
      {birds.map((config, i) => (
        <Bird key={i} leaderX={mouseX} leaderY={mouseY} config={config} uid={i} />
      ))}
    </>
  );
}
