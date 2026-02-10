import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useLenis } from '@/components/LenisProvider';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const lenis = useLenis();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            lenis?.stop();
        } else {
            document.body.style.overflow = '';
            lenis?.start();
        }
        return () => {
            document.body.style.overflow = '';
            lenis?.start();
        };
    }, [isMobileMenuOpen, lenis]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-background/95 backdrop-blur-lg shadow-lg'
                : 'bg-transparent'
                }`}
        >
            {/* Backdrop overlay when mobile menu is open */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm xl:hidden z-0"
                    aria-hidden="true"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <div className="container mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
                <div className="flex items-center justify-between h-20">
                    {/* Logo ... */}
                    <div className="flex items-center">
                        <Link href="/" aria-label="ClinicSync home" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src="/brand/logo-lgt.svg"
                                    alt="ClinicSync logo"
                                    width={40}
                                    height={40}
                                    className="block dark:hidden"
                                    priority
                                />
                                <Image
                                    src="/brand/logo-drk.svg"
                                    alt="ClinicSync logo"
                                    width={40}
                                    height={40}
                                    className="hidden dark:block"
                                    priority
                                />
                            </div>
                            <span
                                className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-foreground' : 'text-foreground'
                                    }`}
                            >
                                ClinicSync
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:flex items-center gap-6">
                        {[
                            { label: 'Features', href: '#features' },
                            { label: 'Product', href: '#product' },
                            { label: 'Benefits', href: '#benefits' },
                            { label: 'Pricing', href: '#pricing' },
                            { label: 'Comparison', href: '#comparison' },
                            { label: 'Testimonials', href: '#testimonials' },
                            { label: 'Request Demo', href: '#demo' },
                        ].map(({ label, href }) => (
                            <a
                                key={href}
                                href={href}
                                className={`font-semibold transition-colors hover:text-primary ${isScrolled ? 'text-muted-foreground' : 'text-foreground'}`}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden xl:flex items-center gap-4">
                        <ModeToggle />
                        <Button
                            variant="ghost"
                            className={`font-semibold ${isScrolled
                                ? 'text-muted-foreground hover:text-primary'
                                : 'text-foreground hover:text-primary'
                                }`}
                            asChild
                        >
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="xl:hidden p-2.5 rounded-lg hover:bg-accent transition-colors -mr-2"
                        aria-expanded={isMobileMenuOpen}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-foreground" />
                        ) : (
                            <Menu className="w-6 h-6 text-foreground" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="xl:hidden py-6 border-t border-border bg-background animate-in slide-in-from-top-2 duration-200 fade-in max-h-[calc(100vh-5rem)] overflow-y-auto rounded-b-2xl" data-lenis-prevent>
                        <nav className="flex flex-col">
                            {[
                                { label: 'Features', href: '#features' },
                                { label: 'Product', href: '#product' },
                                { label: 'Benefits', href: '#benefits' },
                                { label: 'Pricing', href: '#pricing' },
                                { label: 'Comparison', href: '#comparison' },
                                { label: 'Testimonials', href: '#testimonials' },
                                { label: 'Request Demo', href: '#demo' },
                            ].map(({ label, href }) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="text-foreground hover:text-primary font-semibold py-3 px-4 transition-colors rounded-lg hover:bg-accent/50 active:bg-accent mx-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {label}
                                </a>
                            ))}
                            <div className="border-t border-border pt-6 mt-2 space-y-4">
                                <div className="flex items-center justify-between gap-4 px-4 py-2 rounded-lg mx-2">
                                    <span className="text-sm font-semibold text-foreground">Theme</span>
                                    <div className="flex-shrink-0">
                                        <ModeToggle />
                                    </div>
                                </div>
                                <div className="px-4 space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full border-2 border-border hover:border-primary font-semibold h-11 rounded-lg"
                                        asChild
                                    >
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-lg">
                                        Get Started
                                    </Button>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
