import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function FloatingPetals() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const petalArray: Petal[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      size: 8 + Math.random() * 12,
    }));
    setPetals(petalArray);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: "-20px",
          }}
          animate={{
            y: ["0vh", "120vh"],
            x: [0, Math.sin(petal.id) * 50, 0],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            className="rounded-full blur-sm"
            style={{
              width: `${petal.size}px`,
              height: `${petal.size}px`,
              background: `radial-gradient(circle, ${
                petal.id % 3 === 0
                  ? "#FFB5D8"
                  : petal.id % 3 === 1
                  ? "#E6D5FF"
                  : "#FFE5D9"
              }, transparent)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
