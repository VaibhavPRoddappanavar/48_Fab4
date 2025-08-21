import { useEffect, useState } from "react";

// Enhanced particle effect with alphanumeric characters and improved animations
export function ParticleBackground() {
    const [particles, setParticles] = useState<Array<{ 
        id: number; 
        left: number; 
        animationDelay: number; 
        animationDuration: number; 
        size: number;
        char: string;
    }>>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Generate random character with higher frequency of numbers and symbols
    const getRandomChar = () => {
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?~/`';
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        
        // Weight distribution: 50% numbers, 30% symbols, 20% letters
        const random = Math.random();
        if (random < 0.5) {
            return numbers.charAt(Math.floor(Math.random() * numbers.length));
        } else if (random < 0.8) {
            return symbols.charAt(Math.floor(Math.random() * symbols.length));
        } else {
            return letters.charAt(Math.floor(Math.random() * letters.length));
        }
    };

    useEffect(() => {
        // Create 60 particles with random positions, timing, and sizes
        const newParticles = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDelay: 0 + Math.random() * 20, 
            animationDuration: 10 + Math.random() * 15,
            size: 1.5 + Math.random() * 2.5,
            char: getRandomChar()
        }));
        setParticles(newParticles);

        // Initialize after 1 second
        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Alphanumeric Rain Effect - Enhanced */}
            <div className={`absolute inset-0 transition-opacity duration-2000 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
                {Array.from({ length: 40 }).map((_, i) => {
                    // Create staggered delays starting from 1 second
                    const baseDelay = 1 + Math.random() * 25; // 1-26 seconds
                    const columnDelay = i * 0.2; // Larger increment per column for more spread
                    const totalDelay = baseDelay + columnDelay;
                    
                    return (
                        <div
                            key={`column-${i}`}
                            className="absolute top-0 w-6 binary-fall-delayed"
                            style={{
                                left: `${(i / 40) * 100}%`,
                                opacity: 0, // Start invisible
                                animationDelay: `${totalDelay}s`, // Staggered delays starting from 1s
                                animationDuration: `${12 + Math.random() * 18}s`,
                                animationFillMode: 'both' // Keep the final state
                            }}
                        >
                            {Array.from({ length: 20 }).map((_, j) => (
                                <div
                                    key={`char-${j}`}
                                    className="text-green-400 font-mono text-sm leading-5 text-center binary-glow-soft font-medium"
                                    style={{
                                        opacity: 0.4 + Math.random() * 0.5,
                                        textShadow: '0 0 8px #10B981, 0 0 16px #10B981'
                                    }}
                                >
                                    {getRandomChar()}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Floating Particles - Enhanced with Characters */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className={`absolute bg-green-400 rounded-full particle-float-smooth transition-opacity duration-1000 ${
                        isInitialized ? 'opacity-80' : 'opacity-0'
                    }`}
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

            {/* Additional Floating Character Orbs */}
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={`char-orb-${i}`}
                    className={`absolute text-green-400 font-mono text-xs font-medium particle-orb-delayed transition-opacity duration-1500 ${
                        isInitialized ? 'opacity-60' : 'opacity-0'
                    }`}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '-30px',
                        animationDelay: `${2 + Math.random() * 25}s`, // Start after 2 seconds
                        animationDuration: `${20 + Math.random() * 20}s`,
                        textShadow: '0 0 15px #10B981, 0 0 30px #10B981'
                    }}
                >
                    {getRandomChar()}
                </div>
            ))}
        </div>
    );
}
