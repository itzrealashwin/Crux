import React, { useRef, useId } from 'react';
import { 
  motion, 
  useMotionValue, 
  useMotionTemplate, 
  useAnimationFrame 
} from "framer-motion";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Internal Grid Pattern Component
const GridPattern = ({ offsetX, offsetY, size, className }) => {
  const id = useId(); // Unique ID to prevent conflicts if used multiple times

  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={id}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            strokeWidth="1"
            // stroke-current allows the parent div's text color to tint the lines
            className={cn("stroke-current", className)} 
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

export default function InfiniteGridHero({ children, className }) {
  const containerRef = useRef(null);
  const gridSize = 40; 

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  // Animation logic
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);
  const speedX = 0.5;
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX) % gridSize);
    gridOffsetY.set((currentY + speedY) % gridSize);
  });

  // Flashlight mask
  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full overflow-hidden border-b bg-background",
        className
      )}
    >
      {/* --- Background Layers --- */}
      
      {/* 1. Base Grid (Visible but subtle) */}
      <div className="absolute inset-0 z-0">
        <GridPattern 
            offsetX={gridOffsetX} 
            offsetY={gridOffsetY} 
            size={gridSize} 
            className="text-muted-foreground/30" // Increased visibility
        />
      </div>

      {/* 2. Active Grid (Bright flashlight effect) */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern 
            offsetX={gridOffsetX} 
            offsetY={gridOffsetY} 
            size={gridSize} 
            className="text-primary/80" // High contrast for the hover effect
        />
      </motion.div>

      {/* 3. Gradient Orbs (Decorations) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* --- Content --- */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}