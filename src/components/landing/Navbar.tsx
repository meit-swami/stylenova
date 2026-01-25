import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { IconMenu2, IconX, IconSparkles } from '@tabler/icons-react';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card mt-4 rounded-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <IconSparkles className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold">
                Style<span className="gradient-text">Nova</span> ✨
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <IconX className="h-6 w-6" />
              ) : (
                <IconMenu2 className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden glass-card mt-2 rounded-2xl p-6"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <hr className="border-border" />
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
