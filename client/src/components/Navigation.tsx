'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-effect py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-display font-bold hidden sm:inline">
              Campus<span className="gradient-text">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
            >
              Features
            </Link>
            <Link
              href="/events"
              className="text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
            >
              Events
            </Link>
            <Link
              href="/teams"
              className="text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
            >
              Teams
            </Link>
            <Link
              href="/marketplace"
              className="text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
            >
              Marketplace
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 rounded-full border-2 border-primary-yellow text-primary-yellow hover:bg-primary-yellow hover:text-dark-bg transition-all duration-300 font-semibold"
                >
                  Dashboard
                </Link>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform duration-300">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-full border-2 border-primary-yellow text-primary-yellow hover:bg-primary-yellow hover:text-dark-bg transition-all duration-300 font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-primary-yellow text-dark-bg hover:bg-opacity-90 transition-all duration-300 font-semibold hover-lift"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 space-y-4 animate-fade-in">
            <Link
              href="/features"
              className="block text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/events"
              className="block text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/teams"
              className="block text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Teams
            </Link>
            <Link
              href="/marketplace"
              className="block text-text-secondary hover:text-primary-yellow transition-colors duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <div className="pt-4 space-y-3">
              {isAuthenticated() ? (
                <Link
                  href="/dashboard"
                  className="block w-full px-6 py-2.5 rounded-full bg-primary-yellow text-dark-bg text-center font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block w-full px-6 py-2.5 rounded-full border-2 border-primary-yellow text-primary-yellow text-center font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full px-6 py-2.5 rounded-full bg-primary-yellow text-dark-bg text-center font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
