import React from 'react';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '../data/mockData';
import AnimatedSection from './AnimatedSection';

const Testimonials = () => {
    return (
        <section className="py-24 bg-card relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-40 -translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <AnimatedSection animation="slideUp">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-sm font-medium text-primary mb-6">
                            Testimonials
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Trusted by Leading
                            <span className="block text-primary">Practices</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            See how ClinicSync is helping dental professionals streamline operations and improve patient care.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <AnimatedSection
                            key={testimonial.id}
                            animation="slideUp"
                            delay={index * 0.15}
                        >
                        <div key={testimonial.id} className="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                                ))}
                            </div>

                            <div className="relative mb-6">
                                <Quote className="w-10 h-10 text-primary/10 absolute -top-4 -left-2 rotate-12" />
                                <p className="text-lg text-foreground leading-relaxed italic relative z-10">
                                    "{testimonial.content}"
                                </p>
                            </div>

                            <div className="mt-auto flex items-center gap-4 pt-6 border-t border-border">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">{testimonial.name}</h3>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection animation="fade" delay={0.4}>
                    <div className="mt-20 flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Replace with actual partner logos if available */}
                    <span className="text-xl font-bold text-muted-foreground">AMERICAN DENTAL</span>
                    <span className="text-xl font-bold text-muted-foreground">HEALTHY SMILE</span>
                    <span className="text-xl font-bold text-muted-foreground">MODERN PRACTICE</span>
                    <span className="text-xl font-bold text-muted-foreground">DENTAL GROUP</span>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

export default Testimonials;
