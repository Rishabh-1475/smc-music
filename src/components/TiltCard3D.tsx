'use client';
import React, { useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  depth?: number;
}

export const TiltCard3D: React.FC<Props> = ({ children, className = '', onClick, depth = 20 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -depth;
    const rotateY = ((x - centerX) / centerX) * depth;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`,
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
      className={`relative preserve-3d cursor-pointer ${className}`}
    >
      {/* Dynamic Specular Sheen Layer */}
      <div 
        style={{
          opacity: isHovered ? 0.35 : 0,
          transform: 'translateZ(30px)',
          background: `radial-gradient(circle at ${(rotate.y / depth + 1) * 50}% ${(-rotate.x / depth + 1) * 50}%, rgba(255, 255, 255, 0.4), transparent 70%)`
        }}
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-30"
      />
      {children}
    </div>
  );
};

export default TiltCard3D;
