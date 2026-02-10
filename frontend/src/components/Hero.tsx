import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import AnimatedSection from './AnimatedSection';
import { ConstellationBackground } from './ConstellationBackground';
import { getOptimizedImageUrl, getResponsiveSrcSet, getSizesAttribute } from '@/lib/imageOptimizer';

const Hero = () => {
    const { resolvedTheme } = useTheme();

    const isDark = resolvedTheme === 'dark';
    const constellationColors = isDark
        ? { nodeColor: 'rgba(136, 196, 255, 1)', lineColor: 'rgba(136, 196, 255, 0.4)' }
        : { nodeColor: 'rgba(37, 99, 235, 0.9)', lineColor: 'rgba(37, 99, 235, 0.6)' };

    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary pt-20">
            {/* Constellation Background */}
            <div className="absolute inset-0 z-0">
                <ConstellationBackground
                    className="opacity-80 dark:opacity-65"
                    count={80}
                    connectionDistance={150}
                    nodeColor={constellationColors.nodeColor}
                    lineColor={constellationColors.lineColor}
                    nodeSize={2}
                    mouseRadius={100}
                    glow
                />
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 xl:px-12 relative z-10 pt-32 pb-16 xl:pt-0 xl:pb-0">
                <div className="grid xl:grid-cols-2 gap-8 xl:gap-12 items-center">
                    {/* Left content */}
                    <AnimatedSection animation="slideRight">
                        <div className="space-y-8">

                        <h1 className="text-4xl md:text-5xl xl:text-7xl font-bold text-foreground leading-tight">
                            Transform Your
                            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                Dental Practice
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                            Complete clinic management system. Streamline scheduling, automate workflows, and grow your practice with powerful insights.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-border hover:border-primary hover:bg-secondary px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Watch Demo
                            </Button>
                        </div>

                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-background flex items-center justify-center text-white font-semibold text-sm"
                                    >
                                        {i === 1 ? 'SM' : i === 2 ? 'JC' : i === 3 ? 'ER' : 'MW'}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Trusted by 2,500+ dental practices</p>
                            </div>
                        </div>
                        </div>
                    </AnimatedSection>

                    {/* Right content - Hero image */}
                    <AnimatedSection animation="slideLeft" delay={0.2}>
                        <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={getOptimizedImageUrl("https://images.unsplash.com/photo-1629909613654-28e377c37b09", 800)}
                                srcSet={getResponsiveSrcSet("https://images.unsplash.com/photo-1629909613654-28e377c37b09", [400, 800, 1200])}
                                sizes={getSizesAttribute({ desktop: '50vw' })}
                                alt="Modern dental clinic"
                                className="w-full h-auto object-cover"
                                loading="eager"
                                fetchPriority="high"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
                        </div>

                        {/* Floating cards */}
                        <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-xl border border-border animate-float">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Appointment Confirmed</p>
                                    <p className="text-xs text-muted-foreground">Scheduled by doctor</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-xl border border-border animate-float animation-delay-2000">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Revenue Up 30%</p>
                                    <p className="text-xs text-muted-foreground">This quarter</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
};

export default Hero;
