import React from 'react';
import spaceBg from '../../assets/images/space_background_1790746720255.jpg';

export const SpaceBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Space Background Image with high-tech cosmic grade overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105 transform-gpu"
        style={{
          backgroundImage: `url(${spaceBg})`,
          opacity: 0.42,
          filter: 'contrast(115%) brightness(85%)',
        }}
      />

      {/* Subtle Star Particle & Nebula Gradients */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/95 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-950/30 via-transparent to-transparent pointer-events-none" />

      {/* Foreground Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
};
