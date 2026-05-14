/**
 * Premium Background Effects
 * Animated mesh, orbs, gradients for luxury SaaS aesthetic
 */

import React from "react";
import { motion } from "framer-motion";

/**
 * Animated gradient mesh background
 * Creates smooth, flowing gradient animation
 */
export function AnimatedMeshBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]" />

      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, -100, 0],
            y: [0, 100, -100, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern" />
    </div>
  );
}

/**
 * Floating particles background
 * Creates ambient particle effect
 */
export function FloatingParticles() {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 5,
    size: 2 + Math.random() * 4,
    left: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10 backdrop-blur"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
          }}
          animate={{
            y: [0, -window.innerHeight],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Radial gradient orbs
 * Creates layered depth and light effects
 */
export function RadialGradientOrbs() {
  return (
    <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none">
      {/* Top-left cyan orb */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(0, 217, 255, 0.5), transparent)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Top-right purple orb */}
      <motion.div
        className="absolute -top-20 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.5), transparent)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Bottom-right pink orb */}
      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/**
 * Blur gradient background
 * Combines multiple effects for premium look
 */
export function PremiumBackground() {
  return (
    <>
      <AnimatedMeshBackground />
      <RadialGradientOrbs />
      <FloatingParticles />
    </>
  );
}

/**
 * Hero section background with animation
 */
export function HeroBackground() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated mesh */}
      <svg
        className="absolute w-full h-full opacity-30"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 217, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(124, 58, 237, 0.1)" />
          </linearGradient>
        </defs>

        <motion.g
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle
            cx={200}
            cy={200}
            r={150}
            fill="url(#grad1)"
            filter="url(#blur)"
          />
        </motion.g>

        <motion.g
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle
            cx={1000}
            cy={400}
            r={200}
            fill="url(#grad1)"
            filter="url(#blur)"
          />
        </motion.g>
      </svg>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern" />
    </motion.div>
  );
}
