// Framer Motion animation variants and configurations for reusable animations

const SPRING_CONFIG = {
  tight: { type: "spring", stiffness: 380, damping: 30 },
  smooth: { type: "spring", stiffness: 260, damping: 20 },
  standard: { type: "spring", stiffness: 100, damping: 15 },
  relaxed: { type: "spring", stiffness: 50, damping: 15 },
};

const EASE_CONFIG = {
  easeOut: { duration: 0.3, ease: "easeOut" },
  easeInOut: { duration: 0.4, ease: "easeInOut" },
  smooth: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  bounce: { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] },
};

// Base animation variants
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0 },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0 },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0 },
};

// Stagger container configuration
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Hover effects
export const hoverLift = {
  whileHover: { y: -4 },
  transition: SPRING_CONFIG.smooth,
};

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: SPRING_CONFIG.tight,
};

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 20px 48px -24px rgba(59, 130, 246, 0.5)",
  },
  transition: EASE_CONFIG.smooth,
};

// Button interactions
export const buttonTap = {
  whileTap: { scale: 0.96, y: 1 },
  transition: SPRING_CONFIG.tight,
};

export const buttonHover = {
  whileHover: { y: -2 },
  transition: SPRING_CONFIG.smooth,
};

// Card animations
export const cardEnter = {
  hidden: { opacity: 0, y: 12 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      ...EASE_CONFIG.easeOut,
    },
  }),
};

// Success celebration animation
export const successBounce = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: { ...SPRING_CONFIG.bounce },
};

// Input focus animation
export const inputFocus = {
  whileFocus: { scaleY: 1.02 },
  transition: EASE_CONFIG.smooth,
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.24, ease: "easeOut" },
};

// Counting animation (for number counters)
export const countVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// Modal backdrop
export const backdropVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

// Modal content
export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_CONFIG.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Tab animation
export const tabContent = {
  hidden: { opacity: 0, x: 10 },
  show: {
    opacity: 1,
    x: 0,
    transition: EASE_CONFIG.smooth,
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2 },
  },
};

// List item stagger
export const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const listItem = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: EASE_CONFIG.easeOut,
  },
};

// Image zoom on hover
export const imageHoverZoom = {
  whileHover: { scale: 1.08 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Checkmark animation
export const checkmarkAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { ...SPRING_CONFIG.bounce },
};

// Error shake
export const errorShake = {
  animate: { x: [0, -5, 5, -5, 0] },
  transition: { duration: 0.4 },
};

export default {
  SPRING_CONFIG,
  EASE_CONFIG,
  fadeUp,
  fadeDown,
  fadeLeft,
  fadeRight,
  scaleIn,
  slideInRight,
  slideInLeft,
  staggerContainer,
  hoverLift,
  hoverScale,
  hoverGlow,
  buttonTap,
  buttonHover,
  cardEnter,
  successBounce,
  inputFocus,
  pageTransition,
  countVariant,
  backdropVariant,
  modalContent,
  tabContent,
  listContainer,
  listItem,
  imageHoverZoom,
  checkmarkAnimation,
  errorShake,
};
