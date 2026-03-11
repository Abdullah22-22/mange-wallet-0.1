import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "./dashboard-animation.css";

const DashboardAnimation = ({ onComplete }) => {
  useEffect(() => {
    // The animation completes after 2.2 seconds and triggers the redirect
    const timer = setTimeout(() => onComplete(), 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="dashboard-animation-overlay">
      <motion.div
        className="chart-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <svg width="240" height="160" viewBox="0 0 240 160" fill="none">
          {/* Faint background lines (chart grid) */}
          <path d="M 20 120 L 220 120" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 6" />
          <path d="M 20 70 L 220 70" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 6" />
          
          {/* Main chart line being drawn */}
          <motion.path
            d="M 20 140 L 80 90 L 130 110 L 210 30"
            stroke="url(#chart-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0px 4px 12px rgba(74, 222, 128, 0.6))" }}
          />

          {/* Chart arrowhead */}
          <motion.path
            d="M 170 30 L 210 30 L 210 70"
            stroke="url(#chart-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          />

          {/* Color gradient definition */}
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="240" y2="0">
              <stop offset="0%" stopColor="#3b82f6" /> {/* Blue */}
              <stop offset="100%" stopColor="#4ade80" /> {/* Green */}
            </linearGradient>
          </defs>
        </svg>

        {/* Text below the chart */}
        <motion.p
          className="loading-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          Entering Dashboard...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default DashboardAnimation;