export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
}

export const staggerGrid = {
  animate: { transition: { staggerChildren: 0.045 } },
}

export const cardHover = {
  whileHover: { y: -3, transition: { duration: 0.18, ease: 'easeOut' as const } },
}

export const spring = { type: 'spring', stiffness: 340, damping: 26 }
