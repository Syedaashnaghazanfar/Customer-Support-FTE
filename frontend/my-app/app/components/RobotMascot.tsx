"use client";

export default function RobotMascot() {
  return (
    <div className="robot-scene">
      {/* Ambient glow behind the robot */}
      <div className="robot-ambient-glow" />

      {/* Orbiting Tickets */}
      <div className="orbit-ring">
        <div className="orbit-ticket ticket-1">
          <span className="ticket-id">#TK-1042</span>
        </div>
        <div className="orbit-ticket ticket-2">
          <span className="ticket-id">#AI-7781</span>
        </div>
        <div className="orbit-ticket ticket-3">
          <span className="ticket-id">#SUP-9923</span>
        </div>
        <div className="orbit-ticket ticket-4">
          <span className="ticket-id">#CS-4456</span>
        </div>
        <div className="orbit-ticket ticket-5">
          <span className="ticket-id">#HLP-3310</span>
        </div>
      </div>

      {/* Robot Body */}
      <div className="robot-body-wrapper">
        {/* Antenna */}
        <div className="robot-antenna">
          <div className="antenna-stem" />
          <div className="antenna-bulb" />
        </div>

        {/* Head */}
        <div className="robot-head">
          {/* Eyes */}
          <div className="robot-eyes">
            <div className="robot-eye left-eye">
              <div className="eye-pupil" />
            </div>
            <div className="robot-eye right-eye">
              <div className="eye-pupil" />
            </div>
          </div>
          {/* Mouth */}
          <div className="robot-mouth" />
        </div>

        {/* Neck */}
        <div className="robot-neck" />

        {/* Torso */}
        <div className="robot-torso">
          {/* Chest Screen */}
          <div className="chest-screen">
            <div className="chest-text-cycle">
              <span>24/7 Support</span>
              <span>AI Assistant</span>
              <span>Ticket Tracking</span>
              <span>Smart Routing</span>
            </div>
          </div>
          {/* Chest indicator lights */}
          <div className="chest-lights">
            <div className="chest-light light-1" />
            <div className="chest-light light-2" />
            <div className="chest-light light-3" />
          </div>
        </div>

        {/* Arms */}
        <div className="robot-arm left-arm">
          <div className="arm-segment upper-arm" />
          <div className="arm-segment lower-arm" />
          <div className="robot-hand" />
        </div>
        <div className="robot-arm right-arm">
          <div className="arm-segment upper-arm" />
          <div className="arm-segment lower-arm" />
          <div className="robot-hand" />
        </div>
      </div>

      <style>{`
        /* ===== SCENE ===== */
        .robot-scene {
          position: relative;
          width: 320px;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .robot-ambient-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18), rgba(6,182,212,0.08), transparent 70%);
          filter: blur(40px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: ambientPulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        /* ===== ROBOT WRAPPER (breathing) ===== */
        .robot-body-wrapper {
          position: relative;
          z-index: 2;
          animation: robotBreathe 4s ease-in-out infinite;
        }

        /* ===== ANTENNA ===== */
        .robot-antenna {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: -2px;
          position: relative;
          z-index: 3;
        }

        .antenna-stem {
          width: 3px;
          height: 20px;
          background: linear-gradient(to top, #94a3b8, #cbd5e1);
          border-radius: 2px;
        }

        .antenna-bulb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #818cf8, #6366f1);
          box-shadow: 0 0 10px rgba(99,102,241,0.6), 0 0 25px rgba(99,102,241,0.3);
          animation: antennaPulse 2s ease-in-out infinite;
        }

        /* ===== HEAD ===== */
        .robot-head {
          width: 120px;
          height: 90px;
          background: linear-gradient(145deg, #e2e8f0, #cbd5e1, #94a3b8);
          border-radius: 28px 28px 22px 22px;
          position: relative;
          z-index: 3;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow:
            0 4px 20px rgba(0,0,0,0.15),
            inset 0 2px 4px rgba(255,255,255,0.3),
            0 0 30px rgba(99,102,241,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          animation: headFloat 3s ease-in-out infinite;
        }

        /* ===== EYES ===== */
        .robot-eyes {
          display: flex;
          gap: 22px;
          margin-top: 4px;
        }

        .robot-eye {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #1e1b4b, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(99,102,241,0.3);
          box-shadow: inset 0 0 8px rgba(99,102,241,0.4);
        }

        .eye-pupil {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #60a5fa, #818cf8, #6366f1);
          box-shadow: 0 0 12px rgba(96,165,250,0.8), 0 0 25px rgba(99,102,241,0.4);
          animation: eyeGlow 3s ease-in-out infinite;
        }

        /* ===== MOUTH ===== */
        .robot-mouth {
          width: 30px;
          height: 4px;
          border-radius: 4px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(6,182,212,0.5), transparent);
          box-shadow: 0 0 8px rgba(99,102,241,0.3);
        }

        /* ===== NECK ===== */
        .robot-neck {
          width: 24px;
          height: 12px;
          background: linear-gradient(to bottom, #94a3b8, #64748b);
          margin: 0 auto;
          border-radius: 0 0 4px 4px;
          position: relative;
          z-index: 2;
        }

        /* ===== TORSO ===== */
        .robot-torso {
          width: 140px;
          height: 120px;
          background: linear-gradient(160deg, #e2e8f0, #cbd5e1, #94a3b8);
          border-radius: 16px 16px 20px 20px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow:
            0 6px 24px rgba(0,0,0,0.15),
            inset 0 2px 6px rgba(255,255,255,0.25),
            0 0 20px rgba(99,102,241,0.05);
          border: 1px solid rgba(255,255,255,0.15);
        }

        /* ===== CHEST SCREEN ===== */
        .chest-screen {
          width: 100px;
          height: 40px;
          background: linear-gradient(145deg, #0f172a, #1e1b4b);
          border-radius: 8px;
          border: 1px solid rgba(99,102,241,0.3);
          box-shadow: inset 0 0 12px rgba(99,102,241,0.2), 0 0 15px rgba(99,102,241,0.1);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .chest-text-cycle {
          display: flex;
          flex-direction: column;
          animation: cycleText 8s ease-in-out infinite;
          text-align: center;
        }

        .chest-text-cycle span {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }

        /* ===== CHEST INDICATOR LIGHTS ===== */
        .chest-lights {
          display: flex;
          gap: 8px;
        }

        .chest-light {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .light-1 {
          background: #10b981;
          box-shadow: 0 0 6px rgba(16,185,129,0.6);
          animation: lightBlink 2s ease-in-out infinite;
        }

        .light-2 {
          background: #818cf8;
          box-shadow: 0 0 6px rgba(129,140,248,0.6);
          animation: lightBlink 2s ease-in-out 0.5s infinite;
        }

        .light-3 {
          background: #22d3ee;
          box-shadow: 0 0 6px rgba(34,211,238,0.6);
          animation: lightBlink 2s ease-in-out 1s infinite;
        }

        /* ===== ARMS ===== */
        .robot-arm {
          position: absolute;
          top: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }

        .left-arm {
          left: -18px;
          transform-origin: top center;
          animation: armSwayLeft 5s ease-in-out infinite;
        }

        .right-arm {
          right: -18px;
          transform-origin: top center;
          animation: armSwayRight 5s ease-in-out 0.5s infinite;
        }

        .upper-arm {
          width: 16px;
          height: 40px;
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 8px;
        }

        .lower-arm {
          width: 14px;
          height: 35px;
          background: linear-gradient(to bottom, #94a3b8, #64748b);
          border-radius: 7px;
          margin-top: -4px;
        }

        .robot-hand {
          width: 20px;
          height: 18px;
          background: linear-gradient(145deg, #cbd5e1, #94a3b8);
          border-radius: 10px 10px 12px 12px;
          margin-top: -2px;
          border: 1px solid rgba(255,255,255,0.15);
        }

        /* ===== ORBITING TICKETS ===== */
        .orbit-ring {
          position: absolute;
          width: 320px;
          height: 320px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          pointer-events: none;
        }

        .orbit-ticket {
          position: absolute;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          font-family: 'Inter', monospace;
          letter-spacing: 0.04em;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 0 12px rgba(99,102,241,0.1);
          white-space: nowrap;
        }

        .ticket-id {
          display: block;
        }

        .ticket-1 {
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(129,140,248,0.15));
          color: #c7d2fe;
          animation: orbitFloat1 12s linear infinite;
        }

        .ticket-2 {
          background: linear-gradient(135deg, rgba(6,182,212,0.25), rgba(34,211,238,0.15));
          color: #a5f3fc;
          animation: orbitFloat2 14s linear infinite;
        }

        .ticket-3 {
          background: linear-gradient(135deg, rgba(168,85,247,0.25), rgba(192,132,252,0.15));
          color: #e9d5ff;
          animation: orbitFloat3 11s linear infinite;
        }

        .ticket-4 {
          background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(244,114,182,0.12));
          color: #fce7f3;
          animation: orbitFloat4 13s linear infinite;
        }

        .ticket-5 {
          background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.12));
          color: #d1fae5;
          animation: orbitFloat5 15s linear infinite;
        }

        /* ===== HOVER INTERACTIONS ===== */
        .robot-scene:hover .robot-ambient-glow {
          filter: blur(30px);
          background: radial-gradient(circle, rgba(99,102,241,0.28), rgba(6,182,212,0.15), transparent 70%);
        }

        .robot-scene:hover .orbit-ticket {
          animation-duration: 6s !important;
        }

        .robot-scene:hover .eye-pupil {
          box-shadow: 0 0 18px rgba(96,165,250,1), 0 0 35px rgba(99,102,241,0.6);
        }

        .robot-scene:hover .antenna-bulb {
          box-shadow: 0 0 16px rgba(99,102,241,0.8), 0 0 35px rgba(99,102,241,0.5);
        }

        /* ===== KEYFRAMES ===== */
        @keyframes robotBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes headFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes eyeGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(0.95); }
        }

        @keyframes antennaPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(99,102,241,0.6), 0 0 25px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 18px rgba(99,102,241,0.9), 0 0 40px rgba(99,102,241,0.5); }
        }

        @keyframes ambientPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes lightBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes armSwayLeft {
          0%, 100% { transform: rotate(3deg); }
          50% { transform: rotate(-2deg); }
        }

        @keyframes armSwayRight {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(2deg); }
        }

        @keyframes cycleText {
          0%, 20% { transform: translateY(0); }
          25%, 45% { transform: translateY(-40px); }
          50%, 70% { transform: translateY(-80px); }
          75%, 95% { transform: translateY(-120px); }
          100% { transform: translateY(-160px); }
        }

        /* ORBIT PATHS — unique ellipses for each ticket */
        @keyframes orbitFloat1 {
          0%   { top: 5%; left: 50%; transform: translate(-50%, 0) rotate(0deg); }
          25%  { top: 40%; left: 95%; transform: translate(-50%, -50%) rotate(8deg); }
          50%  { top: 85%; left: 50%; transform: translate(-50%, -100%) rotate(0deg); }
          75%  { top: 40%; left: 5%; transform: translate(-50%, -50%) rotate(-8deg); }
          100% { top: 5%; left: 50%; transform: translate(-50%, 0) rotate(0deg); }
        }

        @keyframes orbitFloat2 {
          0%   { top: 40%; left: 95%; transform: translate(-50%, -50%) rotate(5deg); }
          25%  { top: 90%; left: 55%; transform: translate(-50%, -100%) rotate(-3deg); }
          50%  { top: 45%; left: 2%; transform: translate(-50%, -50%) rotate(-5deg); }
          75%  { top: 2%; left: 45%; transform: translate(-50%, 0) rotate(3deg); }
          100% { top: 40%; left: 95%; transform: translate(-50%, -50%) rotate(5deg); }
        }

        @keyframes orbitFloat3 {
          0%   { top: 80%; left: 20%; transform: translate(-50%, -50%) rotate(-4deg); }
          25%  { top: 10%; left: 30%; transform: translate(-50%, 0) rotate(6deg); }
          50%  { top: 15%; left: 85%; transform: translate(-50%, 0) rotate(-4deg); }
          75%  { top: 75%; left: 80%; transform: translate(-50%, -50%) rotate(6deg); }
          100% { top: 80%; left: 20%; transform: translate(-50%, -50%) rotate(-4deg); }
        }

        @keyframes orbitFloat4 {
          0%   { top: 25%; left: 8%; transform: translate(-50%, -50%) rotate(3deg); }
          25%  { top: 8%; left: 70%; transform: translate(-50%, 0) rotate(-5deg); }
          50%  { top: 60%; left: 92%; transform: translate(-50%, -50%) rotate(3deg); }
          75%  { top: 88%; left: 35%; transform: translate(-50%, -100%) rotate(-5deg); }
          100% { top: 25%; left: 8%; transform: translate(-50%, -50%) rotate(3deg); }
        }

        @keyframes orbitFloat5 {
          0%   { top: 70%; left: 70%; transform: translate(-50%, -50%) rotate(-6deg); }
          25%  { top: 20%; left: 85%; transform: translate(-50%, 0) rotate(4deg); }
          50%  { top: 10%; left: 25%; transform: translate(-50%, 0) rotate(-6deg); }
          75%  { top: 65%; left: 10%; transform: translate(-50%, -50%) rotate(4deg); }
          100% { top: 70%; left: 70%; transform: translate(-50%, -50%) rotate(-6deg); }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .robot-scene {
            width: 260px;
            height: 350px;
            margin: 0 auto;
          }

          .robot-head {
            width: 100px;
            height: 76px;
          }

          .robot-torso {
            width: 120px;
            height: 100px;
          }

          .orbit-ring {
            width: 260px;
            height: 260px;
          }

          .orbit-ticket {
            font-size: 0.6rem;
            padding: 4px 10px;
          }
        }
      `}</style>
    </div>
  );
}
