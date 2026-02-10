import React from 'react';
import { Calendar, Users, BarChart3, MessageSquare, Shield } from 'lucide-react';
import { features } from '../data/mockData';
import AnimatedSection from './AnimatedSection';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Calendar,
    Users,
    BarChart3,
    MessageSquare,
    Shield,
};

const Features = () => {
    return (
        <section id="features" className="py-24 bg-background relative">
            <div className="container mx-auto px-4 sm:px-6 xl:px-12">
                <AnimatedSection animation="slideUp">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-sm font-medium text-primary mb-6">
                            Core Capabilities
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
                            Digitalize Your Clinic.
                            <span className="block text-primary">Schedule, Record, Nurture, Retain.</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Patient management software that boosts revenue operations—from scheduling to retention in one platform.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = iconMap[feature.icon];
                        return (
                            <AnimatedSection
                                key={feature.id}
                                animation="scale"
                                delay={index * 0.1}
                            >
                                <div
                                    className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
                                >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-8 transition-opacity">
                                    <Icon className="w-24 h-24" />
                                </div>

                                <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-primary/20 dark:group-hover:bg-primary transition-all duration-300">
                                    <Icon className="w-7 h-7 text-primary dark:text-blue-400 group-hover:text-primary dark:group-hover:text-primary-foreground transition-colors" />
                                </div>

                                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary/90 transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    {feature.description}
                                </p>

                                <div className="pt-6 border-t border-border mt-auto">
                                    <button aria-label={`Learn more about ${feature.title}`} className="text-sm font-bold text-primary flex items-center gap-2 group/btn hover:text-primary/90 transition-colors">
                                        Learn More
                                        <span className="group-hover/btn:translate-x-1 transition-transform" aria-hidden="true">→</span>
                                    </button>
                                </div>
                                </div>
                            </AnimatedSection>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
