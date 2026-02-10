import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedSection from './AnimatedSection';

const DemoRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast.success("Demo request sent successfully!");
  };

  if (isSubmitted) {
    return (
      <section id="demo" className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 xl:px-12 text-center">
          <AnimatedSection animation="scale">
            <Card className="max-w-2xl mx-auto border-2 border-primary/20 bg-card p-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Request Received!</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your interest. One of our specialists will contact you within 24 hours to schedule your personalized demo.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="px-8"
            >
              Back to Website
            </Button>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section id="demo" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
        <div className="grid xl:grid-cols-2 gap-8 xl:gap-16 items-center">
          <AnimatedSection animation="slideRight">
            <div className="max-w-xl">
            <h2 className="text-4xl xl:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your
              <span className="block text-primary">Dental Practice?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of practitioners who have already optimized their operations with ClinicSync's platform.
            </p>
            <ul className="space-y-4">
              {[
                "Personalized 30-minute walkthrough",
                "Pricing customized for your practice",
                "Interactive Q&A session with experts",
                "Full access to advanced features"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slideLeft" delay={0.2}>
            <Card className="border-2 border-border shadow-2xl bg-card overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John"
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Practice Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Smile Dental Clinic"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <Button type="submit" className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                  Schedule Your Demo <Send className="w-5 h-5" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </CardContent>
          </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default DemoRequest;
