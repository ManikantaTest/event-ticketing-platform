import React from "react";
import { motion } from "framer-motion";

const TicketLoader = ({ size = "default", text = "Loading events..." }) => {
  // Size configuration
  const sizeMap = {
    small: {
      width: "3rem",
      height: "5rem",
      margin: "0 0.3rem",
      textSize: "text-sm",
    },
    default: {
      width: "4rem",
      height: "6rem",
      margin: "0 0.5rem",
      textSize: "text-base",
    },
    large: {
      width: "5rem",
      height: "8rem",
      margin: "0 0.7rem",
      textSize: "text-lg",
    },
  };

  const { width, height, margin, textSize } = sizeMap[size];

  // Perforation effect component
  const Perforations = () => (
    <div className="absolute left-0 w-full top-1/2 -translate-y-1/2 flex justify-between px-1">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-gray-800 opacity-20" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {/* Animated title */}
      {/* <motion.h2
        className="text-black text-2xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {text}
      </motion.h2> */}

      {/* Main loader container */}
      <div className="flex items-center justify-center">
        {/* Left decorative element */}
        <motion.div
          className="w-6 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-4"
          animate={{ scaleX: [1, 1.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />

        {/* Animated tickets */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="relative rounded-lg shadow-2xl overflow-hidden"
            style={{ width, height, margin }}
            initial={{ y: 0, rotate: 0 }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, i === 1 ? -5 : 5, 0],
            }}
            transition={{
              duration: 1.2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Ticket background with gradient */}
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: "linear-gradient(45deg, #ff512f, #dd2476, #8360c3)",
              }}
            />

            {/* Shine overlay effect */}
            <motion.div
              className="absolute inset-0 bg-white opacity-0"
              animate={{ opacity: [0, 0.3, 0], x: [-100, 200, -100] }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
            />

            {/* Perforations */}
            <Perforations />

            {/* Ticket content */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <div className="text-center">
                <motion.div
                  className="w-4 h-4 bg-white rounded-full mx-auto mb-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                />
                <motion.span
                  className="text-xs font-bold text-white uppercase tracking-widest"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                >
                  Event
                </motion.span>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white opacity-70"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white opacity-70"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white opacity-70"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white opacity-70"></div>
          </motion.div>
        ))}

        {/* Right decorative element */}
        <motion.div
          className="w-6 h-1 bg-gradient-to-l from-yellow-400 to-orange-500 rounded-full ml-4"
          animate={{ scaleX: [1, 1.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>

      {/* Loading dots */}
      <motion.div className="flex mt-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-gray-300 rounded-full mx-1"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {/* Subtle footer text */}
      {/* <motion.p
        className="text-gray-300 mt-6 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading...
      </motion.p> */}
    </div>
  );
};

export default TicketLoader;
