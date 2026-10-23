import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, X, ArrowRight, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export function MarketingLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useUIStore();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Features', path: '/features' },
    { title: 'AI Intelligence', path: '/ai' },
    { title: 'Banking', path: '/banking-info' },
    { title: 'Investments', path: '/investments-info' },
    { title: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Banner indicating Prototype Status */}
      <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 relative z-40">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          EXPENZO Prototype Environment — Fully Offline, Zero-Cost Demonstration
        </span>
        <Link
          to="/app/dashboard"
          className="underline font-bold hover:text-emerald-100 ml-1 shrink-0"
        >
          Open App Shell &rarr;
        </Link>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B1220]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                EXPENZO
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
                Fintech Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`
                }
              >
                {link.title}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium cursor-pointer flex items-center gap-1.5"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>

            <Link to="/auth/register">
              <Button variant="primary" size="sm">
                Get Started
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger & Theme Switcher */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] px-5 py-6 space-y-4 animate-in fade-in-0 shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {link.title}
                </NavLink>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
              <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Login
                </Button>
              </Link>
              <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080D17] py-14 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
                E
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                EXPENZO
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
              All Your Money. One Smarter Place. Unified personal finance, banking overview, and explainable AI intelligence.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <Shield className="h-4 w-4" />
              <span>Offline Prototype Sandbox</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Product Modules
            </h5>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-emerald-600 transition-colors">Features Overview</Link></li>
              <li><Link to="/features#expenses" className="hover:text-emerald-600 transition-colors">Expense Tracking</Link></li>
              <li><Link to="/banking-info" className="hover:text-emerald-600 transition-colors">Banking Overview</Link></li>
              <li><Link to="/investments-info" className="hover:text-emerald-600 transition-colors">Investment Portfolio</Link></li>
              <li><Link to="/ai" className="hover:text-emerald-600 transition-colors">AI Intelligence</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Company & Trust
            </h5>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
              <li><Link to="/security" className="hover:text-emerald-600 transition-colors">Security Architecture</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Interactive Demos
            </h5>
            <p className="text-slate-400 leading-relaxed mb-3">
              Experience the full application without real bank connectivity or financial risk.
            </p>
            <div className="space-y-2">
              <Link to="/app/dashboard" className="block text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Launch App Dashboard &rarr;
              </Link>
              <Link to="/dev/ui-preview" className="block text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                Design System Preview
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>&copy; 2026 EXPENZO Financial Technologies. All rights reserved.</p>
          <p className="text-[11px]">
            Demonstration prototype. Fictional sample data. Not licensed financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
