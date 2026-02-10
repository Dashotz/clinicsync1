import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        <AnimatedSection animation="fade">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 mb-16">
          {/* Company info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">ClinicSync</h2>
              <p className="text-foreground/80">
                Empowering dental practices with comprehensive management solutions.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#" aria-label="Visit our Facebook page" className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Visit our Twitter page" className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Visit our Instagram page" className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Visit our LinkedIn page" className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Product</h3>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'Case Studies', 'Reviews', 'Updates'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-foreground/80 hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-4">
              {['Help Center', 'Tutorials', 'API Documentation', 'Community', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-foreground/80 hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground/80">
                  123 Dental Plaza, Suite 456<br />San Francisco, CA 94103
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground/80">(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground/80">contact@clinicsync.com</span>
              </li>
            </ul>
          </div>
          </div>
        </AnimatedSection>

        {/* Bottom bar */}
        <AnimatedSection animation="fade" delay={0.2}>
          <div className="border-t border-border/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-foreground/80 text-sm">
              © {currentYear} ClinicSync. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-foreground/80 hover:text-primary text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-foreground/80 hover:text-primary text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-foreground/80 hover:text-primary text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
};

export default Footer;
