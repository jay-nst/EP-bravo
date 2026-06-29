'use client';

const PULSE_DOTS = [
  { top: '22%', left: '58%', delay: 0, label: '서울' },
  { top: '45%', left: '72%', delay: 2.5, label: '도쿄' },
  { top: '62%', left: '30%', delay: 5, label: '나이로비' },
  { top: '30%', left: '38%', delay: 1.5, label: '런던' },
  { top: '55%', left: '55%', delay: 3.5, label: '싱가포르' },
  { top: '75%', left: '45%', delay: 6, label: '시드니' },
];

export default function EarthPulse() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '320px', height: '320px' }}>
      {/* Ambient glow */}
      <div
        className="absolute"
        style={{
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,191,168,0.12) 0%, rgba(27,191,168,0.03) 50%, transparent 70%)',
          animation: 'ep-glow 4s ease-in-out infinite',
        }}
      />

      {/* Globe */}
      <div
        className="relative"
        style={{
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #1a2a3a, #0a1018 60%, #050810)',
          boxShadow: '0 0 60px rgba(27,191,168,0.08), inset 0 0 30px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines */}
        <svg
          viewBox="0 0 220 220"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.25 }}
        >
          <ellipse cx="110" cy="110" rx="25" ry="100" fill="none" stroke="#1bbfa8" strokeWidth="0.5" />
          <ellipse cx="110" cy="110" rx="55" ry="100" fill="none" stroke="#1bbfa8" strokeWidth="0.5" />
          <ellipse cx="110" cy="110" rx="85" ry="100" fill="none" stroke="#1bbfa8" strokeWidth="0.4" />
          <ellipse cx="110" cy="110" rx="100" ry="12" fill="none" stroke="#1bbfa8" strokeWidth="0.5" />
          <ellipse cx="110" cy="70" rx="88" ry="10" fill="none" stroke="#1bbfa8" strokeWidth="0.4" />
          <ellipse cx="110" cy="150" rx="88" ry="10" fill="none" stroke="#1bbfa8" strokeWidth="0.4" />
          <ellipse cx="110" cy="45" rx="65" ry="8" fill="none" stroke="#1bbfa8" strokeWidth="0.3" />
          <ellipse cx="110" cy="175" rx="65" ry="8" fill="none" stroke="#1bbfa8" strokeWidth="0.3" />
          <circle cx="110" cy="110" r="100" fill="none" stroke="#1bbfa8" strokeWidth="0.6" opacity="0.3" />
        </svg>

        {/* Rotating light sweep - creates illusion of rotation */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 120deg, rgba(27,191,168,0.06) 180deg, transparent 240deg, transparent 360deg)',
            animation: 'ep-sweep 12s linear infinite',
          }}
        />

        {/* Continent hints with drift animation */}
        <div className="absolute" style={{
          top: '25%', left: '30%', width: '35%', height: '20%',
          background: 'rgba(27,191,168,0.06)',
          borderRadius: '40% 60% 50% 50%',
          animation: 'ep-drift 20s ease-in-out infinite',
        }} />
        <div className="absolute" style={{
          top: '50%', left: '20%', width: '18%', height: '30%',
          background: 'rgba(27,191,168,0.05)',
          borderRadius: '30% 40% 60% 40%',
          animation: 'ep-drift 20s ease-in-out infinite',
          animationDelay: '-5s',
        }} />
        <div className="absolute" style={{
          top: '35%', left: '55%', width: '30%', height: '25%',
          background: 'rgba(27,191,168,0.05)',
          borderRadius: '50% 40% 30% 60%',
          animation: 'ep-drift 20s ease-in-out infinite',
          animationDelay: '-10s',
        }} />

        {/* Pulse dots */}
        {PULSE_DOTS.map((dot, i) => (
          <div
            key={i}
            className="absolute"
            style={{ top: dot.top, left: dot.left }}
          >
            <div
              className="absolute"
              style={{
                width: '20px',
                height: '20px',
                top: '-8px',
                left: '-8px',
                borderRadius: '50%',
                border: '1px solid rgba(27,191,168,0.4)',
                animation: `ep-pulse-ring 3s ease-out infinite`,
                animationDelay: `${dot.delay}s`,
              }}
            />
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#1bbfa8',
                boxShadow: '0 0 6px rgba(27,191,168,0.8)',
                animation: `ep-pulse-dot 6s ease-in-out infinite`,
                animationDelay: `${dot.delay}s`,
              }}
            />
          </div>
        ))}

        {/* Atmospheric edge glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(27,191,168,0.08) 80%, rgba(27,191,168,0.15) 100%)',
          }}
        />
      </div>

      {/* Orbit ring - Observer-1A */}
      <div
        className="absolute"
        style={{
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: '1px dashed rgba(27,191,168,0.12)',
          transform: 'rotateX(65deg) rotateZ(-20deg)',
          animation: 'ep-orbit 20s linear infinite',
        }}
      >
        <div
          className="absolute"
          style={{
            top: '-3px',
            left: '50%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#1bbfa8',
            boxShadow: '0 0 8px rgba(27,191,168,0.6), 0 0 2px #fff',
          }}
        />
      </div>

      {/* Orbit ring - Observer-1B (different angle & speed) */}
      <div
        className="absolute"
        style={{
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          border: '1px dashed rgba(27,191,168,0.08)',
          transform: 'rotateX(70deg) rotateZ(40deg)',
          animation: 'ep-orbit 25s linear infinite reverse',
        }}
      >
        <div
          className="absolute"
          style={{
            top: '-3px',
            left: '50%',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#35d9c0',
            boxShadow: '0 0 6px rgba(53,217,192,0.5)',
          }}
        />
      </div>

      {/* Live indicator */}
      <div
        className="absolute flex items-center gap-1.5"
        style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#1bbfa8',
            animation: 'ep-count-pulse 2s ease-in-out infinite',
          }}
        />
        <span className="text-xs font-mono tracking-wider" style={{ color: 'var(--accent)', fontSize: '10px' }}>
          LIVE
        </span>
      </div>
    </div>
  );
}
