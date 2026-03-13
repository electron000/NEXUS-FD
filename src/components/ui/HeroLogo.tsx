"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export function HeroLogo() {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springCfg = { stiffness: 120, damping: 18, mass: 0.6 };
  const x = useSpring(rawX, springCfg);
  const y = useSpring(rawY, springCfg);

  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);
  const translateX = useTransform(x, [-0.5, 0.5], [-10, 10]);
  const translateY = useTransform(y, [-0.5, 0.5], [-10, 10]);

  const scale = useSpring(1, { stiffness: 160, damping: 20 });
  const glowOpacity = useSpring(0.35, springCfg);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    scale.set(1.1);
    glowOpacity.set(0.8);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    scale.set(1);
    glowOpacity.set(0.35);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-40 w-72 cursor-pointer select-none flex items-center justify-center"
      style={{
        rotateX,
        rotateY,
        translateX,
        translateY,
        scale,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      initial={{ opacity: 0, scale: 0.88, y: 14 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {/* REMOVED Specular layer (the card container) 
          REFINED Ambient Glow: Increased size and blur so it bleeds onto the Hero BG 
      */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute -inset-20 rounded-full bg-blue-600/20 blur-[80px] -z-10 pointer-events-none"
      />

      {/* Base: grayscale layer */}
      <div className="absolute inset-0 flex items-center justify-center grayscale filter opacity-40">
        <Image
          src="/nexus.webp"
          alt="Nexus Base Logo"
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Color layer */}
      <motion.div
        initial={{ clipPath: "circle(0% at 10% 90%)" }}
        animate={{
          clipPath: "circle(150% at 10% 90%)",
          transition: {
            duration: 2.2,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.3,
          },
        }}
        className="absolute inset-0 flex items-center justify-center drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
      >
        <Image
          src="/nexus.webp"
          alt="Nexus Color Logo"
          fill
          priority
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
