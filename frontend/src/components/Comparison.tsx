import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { comparisonFeatures } from '../data/mockData';
import AnimatedSection from './AnimatedSection';

const Comparison = () => {
    const [selectedPlan, setSelectedPlan] = useState('pro');

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Section header */}
                <AnimatedSection animation="slideUp">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-bold text-primary mb-6">
                            Plan Comparison
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
                            Find Your Perfect
                            <span className="block text-primary">Feature Match</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium">
                            Compare all features across our plans to make the best decision for your practice.
                        </p>
                    </div>
                </AnimatedSection>

                {/* Comparison table */}
                <AnimatedSection animation="fade" delay={0.2}>
                    <Card className="border border-border shadow-2xl shadow-primary/5 overflow-hidden bg-card">
                    <CardContent className="p-0">
                        {/* Desktop view */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/30">
                                        <th className="text-left p-8 font-extrabold text-foreground text-xl">Features</th>
                                        <th className="text-center p-8">
                                            <div className="space-y-2">
                                                <p className="font-extrabold text-foreground text-xl">Starter</p>
                                                <p className="text-sm text-muted-foreground font-medium">For small practices</p>
                                            </div>
                                        </th>
                                        <th className="text-center p-8 bg-primary/[0.03] border-x border-primary/10 relative">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                                            <div className="space-y-2">
                                                <div className="inline-block bg-primary text-primary-foreground text-[10px] tracking-widest font-black px-3 py-1 rounded-full mb-2 uppercase">
                                                    Most Popular
                                                </div>
                                                <p className="font-extrabold text-foreground text-xl">Pro</p>
                                                <p className="text-sm text-muted-foreground font-medium">For growing practices</p>
                                            </div>
                                        </th>
                                        <th className="text-center p-8">
                                            <div className="space-y-2">
                                                <p className="font-extrabold text-foreground text-xl">Enterprise</p>
                                                <p className="text-sm text-muted-foreground font-medium">For multi-location</p>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonFeatures.map((feature, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-border hover:bg-muted/30 transition-colors group"
                                        >
                                            <td className="p-6 font-bold text-foreground/80 group-hover:text-foreground transition-colors">{feature.name}</td>
                                            {[feature.basic, feature.pro, feature.enterprise].map((value, idx) => (
                                                <td key={idx} className={`p-6 text-center ${idx === 1 ? 'bg-primary/[0.02] border-x border-primary/5' : ''}`}>
                                                    {typeof value === 'boolean' ? (
                                                        value ? (
                                                            <div className="inline-flex w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 items-center justify-center">
                                                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex w-10 h-10 rounded-full bg-muted/50 items-center justify-center">
                                                                <span className="text-muted-foreground/50 font-bold">—</span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="font-extrabold text-foreground">{value}</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view - Accordion */}
                        <div className="lg:hidden p-6 bg-card">
                            {/* Plan selector */}
                            <div className="flex gap-2 mb-8 bg-muted p-1 rounded-xl">
                                {[
                                    { key: 'basic', label: 'Starter' },
                                    { key: 'pro', label: 'Pro' },
                                    { key: 'enterprise', label: 'Enterprise' }
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedPlan(key)}
                                        className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm transition-all ${selectedPlan === key
                                            ? 'bg-card text-primary shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Features list */}
                            <div className="space-y-4">
                                {comparisonFeatures.map((feature, index) => {
                                    const value =
                                        selectedPlan === 'basic'
                                            ? feature.basic
                                            : selectedPlan === 'pro'
                                                ? feature.pro
                                                : feature.enterprise;
                                    
                                    const isAccountsRow = feature.name === "Accounts";

                                    return (
                                        <div
                                            key={index}
                                            className={`flex ${isAccountsRow ? 'flex-col gap-3' : 'items-center justify-between'} p-5 bg-secondary/30 rounded-2xl border border-border/50`}
                                        >
                                            <span className={`font-bold text-foreground/80 ${isAccountsRow ? 'w-full' : ''}`}>{feature.name}</span>
                                            {typeof value === 'boolean' ? (
                                                value ? (
                                                    <div className={`w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center ${isAccountsRow ? 'self-start' : ''}`}>
                                                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30 font-bold ${isAccountsRow ? 'self-start' : ''}`}>
                                                        —
                                                    </div>
                                                )
                                            ) : (
                                                <span className={`font-black text-primary ${isAccountsRow ? 'w-full break-words' : ''}`}>{value}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                    </Card>
                </AnimatedSection>
            </div>
        </section>
    );
};

export default Comparison;
