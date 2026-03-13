'use client'

import Link from 'next/link'
import { Mail, Github, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-yellow rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-blue rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-display font-bold">
                Campus<span className="gradient-text">Connect</span>
              </span>
            </div>
            <p className="text-text-secondary text-sm">
              Empowering university students to connect, collaborate, and create amazing things together.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  Team Finder
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-primary-yellow transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dark-border flex items-center justify-center text-text-secondary hover:text-primary-yellow hover:bg-primary-yellow hover:bg-opacity-10 transition-all duration-300"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dark-border flex items-center justify-center text-text-secondary hover:text-primary-yellow hover:bg-primary-yellow hover:bg-opacity-10 transition-all duration-300"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dark-border flex items-center justify-center text-text-secondary hover:text-primary-yellow hover:bg-primary-yellow hover:bg-opacity-10 transition-all duration-300"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:hello@campusconnect.com"
                className="w-10 h-10 rounded-full bg-dark-border flex items-center justify-center text-text-secondary hover:text-primary-yellow hover:bg-primary-yellow hover:bg-opacity-10 transition-all duration-300"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-text-secondary text-sm">
            © {new Date().getFullYear()} CampusConnect. All rights reserved.
          </p>
          <p className="text-text-secondary text-sm">
            Made with ❤️ for students, by students
          </p>
        </div>
      </div>
    </footer>
  )
}
