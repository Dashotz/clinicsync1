import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const ProductShowcase = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section className="py-24 bg-background text-foreground relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left content */}
                    <AnimatedSection animation="slideRight">
                        <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-sm font-medium">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Live Demo
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                            See the System
                            <span className="block text-primary">in Action</span>
                        </h2>

                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Watch how our AI-powered platform transforms daily operations in real dental practices. From intelligent scheduling to automated patient communications.
                        </p>

                        <div className="space-y-6">
                            {[
                                {
                                    title: 'Smart Scheduling',
                                    description: 'AI optimizes appointments based on treatment time, provider availability, and patient preferences',
                                },
                                {
                                    title: 'Real-Time Updates',
                                    description: 'Instant synchronization across all devices and locations',
                                },
                                {
                                    title: 'Patient Communication',
                                    description: 'Automated reminders, confirmations, and follow-ups via SMS and email',
                                },
                            ].map((item, index) => (
                                <div key={index} className="flex gap-4 items-start group">
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <span className="text-primary-foreground font-bold">{index + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                            Request Full Demo
                        </button>
                        </div>
                    </AnimatedSection>

                    {/* Right content - Video/Image showcase */}
                    <AnimatedSection animation="slideLeft" delay={0.2}>
                        <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                            <img
                                src="https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8?w=800&q=80"
                                alt="Product showcase"
                                className="w-full h-auto"
                            />

                            {/* Video overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 dark:from-background/80 via-foreground/40 dark:via-background/40 to-transparent flex items-center justify-center">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-20 h-20 rounded-full bg-background/90 dark:bg-foreground/90 hover:bg-background dark:hover:bg-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 text-primary dark:text-primary-foreground" />
                                    ) : (
                                        <Play className="w-8 h-8 text-primary dark:text-primary-foreground ml-1" />
                                    )}
                                </button>
                            </div>

                            {/* Video duration indicator */}
                            {!isPlaying && (
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg text-white">
                                        <Volume2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">2:45</span>
                                    </div>
                                    <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium text-white">
                                        Product Tour
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Floating feature badges */}
                        <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-4 rounded-xl shadow-xl border border-border animate-float">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">HIPAA Compliant</p>
                                    <p className="text-xs text-muted-foreground">Certified & Secure</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-6 -right-6 bg-card text-card-foreground p-4 rounded-xl shadow-xl border border-border animate-float animation-delay-2000">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Lightning Fast</p>
                                    <p className="text-xs text-muted-foreground">Cloud-powered</p>
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

export default ProductShowcase;
