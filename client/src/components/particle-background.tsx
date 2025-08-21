import { useEffect, useState } from "react";

// Enhanced particle effect with larger, brighter particles
export function ParticleBackground() {
    const [particles, setParticles] = useState<Array<{ id: number; left: number; animationDelay: number; animationDuration: number; size: number }>>([]);

    useEffect(() => {
        // Create 80 particles with random positions, timing, and sizes
        const newParticles = Array.from({ length: 80 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDelay: Math.random() * 20,
            animationDuration: 8 + Math.random() * 12,
            size: 2 + Math.random() * 4 // Larger particles (2-6px)
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Binary Rain Effect - Enhanced */}
            <div className="absolute inset-0">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={`column-${i}`}
                        className="absolute top-0 w-6 opacity-60 binary-fall"
                        style={{
                            left: `${(i / 30) * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${12 + Math.random() * 8}s`
                        }}
                    >
                        {Array.from({ length: 25 }).map((_, j) => (
                            <div
                                key={`char-${j}`}
                                className="text-green-400 font-mono text-lg leading-6 text-center binary-glow-enhanced font-bold"
                                style={{
                                    opacity: 0.4 + Math.random() * 0.6, // Higher opacity range
                                }}
                            >
                                {Math.random() > 0.5 ? '1' : '0'}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Floating Particles - Enhanced */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute bg-green-400 rounded-full opacity-80 particle-float-enhanced"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.left}%`,
                        top: '-20px',
                        animationDelay: `${particle.animationDelay}s`,
                        animationDuration: `${particle.animationDuration}s`,
                        boxShadow: `0 0 ${particle.size * 3}px #10B981, 0 0 ${particle.size * 6}px #10B981`
                    }}
                />
            ))}

            {/* Additional Floating Orbs for More Depth */}
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={`orb-${i}`}
                    className="absolute bg-green-300 rounded-full opacity-40 particle-orb"
                    style={{
                        width: `${6 + Math.random() * 8}px`,
                        height: `${6 + Math.random() * 8}px`,
                        left: `${Math.random() * 100}%`,
                        top: '-30px',
                        animationDelay: `${Math.random() * 15}s`,
                        animationDuration: `${20 + Math.random() * 15}s`,
                        boxShadow: '0 0 20px #10B981, 0 0 40px #059669'
                    }}
                />
            ))}
        </div>
    );
}
