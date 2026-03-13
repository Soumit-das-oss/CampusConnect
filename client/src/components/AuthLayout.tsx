'use client'

import Link from 'next/link'
import { Building2, Users, Network, Zap } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 noise-texture">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-blue opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-yellow opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="flex items-center space-x-2 mb-12 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <span className="text-2xl font-display font-bold">
              Campus<span className="gradient-text">Connect</span>
            </span>
          </Link>

          {/* Isometric Illustration */}
          <div className="relative h-96 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central Building */}
              <div className="relative animate-fade-in">
                <div className="w-48 h-64 bg-gradient-to-br from-dark-card to-dark-border rounded-2xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 border border-primary-blue/20">
                  <div className="absolute top-4 left-4 right-4 space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex space-x-2">
                        <div className="w-6 h-6 bg-primary-yellow/30 rounded"></div>
                        <div className="w-6 h-6 bg-primary-blue/30 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-primary-yellow/40 rounded-t-lg"></div>
                </div>

                {/* Floating Network Nodes */}
                <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center animate-float shadow-lg">
                  <Users className="text-white" size={28} />
                </div>

                <div className="absolute -top-4 -right-12 w-12 h-12 rounded-full glass-effect flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                  <Network className="text-primary-yellow" size={20} />
                </div>

                <div className="absolute -bottom-8 -right-8 w-14 h-14 rounded-full glass-effect flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                  <Zap className="text-primary-blue" size={24} />
                </div>

                <div className="absolute -bottom-4 -left-12 w-12 h-12 rounded-full glass-effect flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                  <Building2 className="text-primary-yellow" size={20} />
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                  <line x1="50%" y1="50%" x2="20%" y2="10%" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                  </line>
                  <line x1="50%" y1="50%" x2="90%" y2="15%" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                  </line>
                  <line x1="50%" y1="50%" x2="90%" y2="85%" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                  </line>
                  <line x1="50%" y1="50%" x2="10%" y2="85%" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                  </line>
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#FDB022" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 animate-fade-in stagger-2">
            <h2 className="text-4xl font-display font-bold">
              Join Your Campus <span className="gradient-text">Community</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Connect with students, build amazing projects, and attend exciting events. Your college network awaits!
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">5,000+</p>
                <p className="text-text-secondary text-sm">Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">200+</p>
                <p className="text-text-secondary text-sm">Teams</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">50+</p>
                <p className="text-text-secondary text-sm">Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center space-x-2 mb-8 justify-center group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-display font-bold">
              Campus<span className="gradient-text">Connect</span>
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}
