import { Transition, Variants } from "framer-motion";

export const MODAL_SLIDE_ANIMATION_VARIENT: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export const MODAL_STEP_TRANSITION: Transition = {
  layout: {
    duration: 0.15,
    ease: "easeInOut",
  },
  x: {
    type: "spring",
    stiffness: 400,
    damping: 35,
    duration: 0.05,
  },
  opacity: { duration: 0.05 },
};
