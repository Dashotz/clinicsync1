import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { pricingPlans } from '../data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedSection from './AnimatedSection';

const Pricing = () => {
    return (
        <section id="pricing" className="py-24 bg-secondary/50 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
                <AnimatedSection animation="slideUp">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm font-medium text-primary mb-6">
                            Simple Pricing
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-bold text-foreground mb-6">
                            Transparent Plans for Every
                            <span className="block text-primary">Practice Stage</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Choose the plan that fits your current needs and scale your practice with confidence.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <AnimatedSection
                            key={plan.id}
                            animation="scale"
                            delay={index * 0.15}
                        >
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col border-2 transition-all duration-300 hover:scale-105 ${plan.popular
                                ? 'border-primary shadow-2xl bg-card scale-105 z-10'
                                : 'border-border bg-card shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-sm font-bold px-6 py-1 rounded-full whitespace-nowrap">
                                    MOST POPULAR
                                </div>
                            )}

                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                                    <p className="text-muted-foreground text-sm mb-6 h-10">{plan.description}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                                        <span className="text-muted-foreground font-semibold">{plan.period}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-primary dark:text-blue-400" />
                                            </div>
                                            <span className="text-foreground text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className={`w-full py-6 text-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${plan.popular
                                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'
                                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                        }`}
                                >
                                    Choose {plan.name} <ArrowRight className="w-5 h-5" />
                                </Button>
                            </CardContent>
                        </Card>
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection animation="fade" delay={0.4}>
                    <div className="mt-20 text-center">
                        <p className="text-muted-foreground">
                            All plans include a 14-day free trial. No credit card required.
                        </p>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

export default Pricing;
