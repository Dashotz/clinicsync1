import React from 'react';
import { TrendingUp, Users, Clock, ShieldCheck } from 'lucide-react';
import { benefits } from '../data/mockData';
import AnimatedSection from './AnimatedSection';

const iconMap: { [key: number]: any } = {
    1: TrendingUp,
    2: Clock,
    3: Users,
    4: ShieldCheck
};

const Benefits = () => {
    return (
        <section className="py-24 bg-secondary/50 relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <AnimatedSection animation="slideUp">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
                            Real Impact
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-foreground tracking-tight">
                            Drive Better Results for Your
                            <span className="block text-primary">Bottom Line</span>
                        </h2>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => {
                        const Icon = iconMap[benefit.id];
                        return (
                            <AnimatedSection
                                key={benefit.id}
                                animation="slideUp"
                                delay={index * 0.1}
                            >
                                <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6 text-primary dark:text-blue-400" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-5xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors tracking-tight">
                                        {benefit.metric}
                                    </h3>
                                    <p className="text-lg font-bold text-primary">
                                        {benefit.label}
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed font-medium">
                                        {benefit.description}
                                    </p>
                                </div>
                                </div>
                            </AnimatedSection>
                        );
                    })}
                </div>

                <AnimatedSection animation="fade" delay={0.4}>
                    <div className="mt-20 text-center">
                        <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-primary/20 shadow-lg">
                            See the Difference
                        </button>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

export default Benefits;
