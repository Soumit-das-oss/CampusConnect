'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import {
  Users,
  Calendar,
  Rocket,
  BookOpen,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-texture">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-blue opacity-20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-yellow opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-blue opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-effect border border-primary-yellow/30">
                <Sparkles className="text-primary-yellow" size={16} />
                <span className="text-sm text-text-secondary">Trusted by 5,000+ Students</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
                Connect. <br />
                <span className="gradient-text">Collaborate.</span> <br />
                Create.
              </h1>

              <p className="text-xl text-text-secondary max-w-xl">
                Empowering university students to find teammates, build projects, and attend campus events. Your journey to amazing collaborations starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary-yellow text-dark-bg font-semibold text-lg hover:bg-opacity-90 transition-all duration-300 hover-lift btn-primary"
                >
                  Get Started
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link
                  href="/teams"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-primary-yellow text-primary-yellow font-semibold text-lg hover:bg-primary-yellow hover:text-dark-bg transition-all duration-300"
                >
                  Explore Projects
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-display font-bold gradient-text">5,000+</p>
                  <p className="text-text-secondary text-sm mt-1">Active Students</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-display font-bold gradient-text">200+</p>
                  <p className="text-text-secondary text-sm mt-1">Projects</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-display font-bold gradient-text">50+</p>
                  <p className="text-text-secondary text-sm mt-1">Events/Month</p>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative animate-fade-in stagger-2 hidden lg:block">
              <div className="relative w-full h-[500px] flex items-center justify-center">
                {/* Decorative Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full border-2 border-primary-blue/30 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '0.5s' }}>
                  <div className="w-96 h-96 rounded-full border-2 border-primary-yellow/20 animate-pulse"></div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 w-48 h-48 rounded-3xl bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-500">
                  <Users size={80} className="text-white" />
                </div>

                {/* Floating Cards */}
                <div className="absolute top-10 right-10 glass-effect rounded-2xl p-4 hover-lift transform hover:rotate-3 transition-all duration-300">
                  <Calendar className="text-primary-yellow mb-2" size={24} />
                  <p className="text-sm font-semibold">50+ Events</p>
                </div>

                <div className="absolute bottom-20 left-10 glass-effect rounded-2xl p-4 hover-lift transform hover:-rotate-3 transition-all duration-300">
                  <Rocket className="text-primary-blue mb-2" size={24} />
                  <p className="text-sm font-semibold">200+ Teams</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary-yellow flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-primary-yellow"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              All the tools you need to connect with peers and build amazing projects together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Find Teammates',
                description: 'Connect with students who share your skills and interests',
                delay: '0.1s',
              },
              {
                icon: Calendar,
                title: 'Join Campus Events',
                description: 'Discover and participate in exciting college events',
                delay: '0.2s',
              },
              {
                icon: Rocket,
                title: 'Build Projects Together',
                description: 'Collaborate on projects with real-time tools',
                delay: '0.3s',
              },
              {
                icon: BookOpen,
                title: 'Access Resources',
                description: 'Buy and sell books, notes, and study materials',
                delay: '0.4s',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-effect rounded-2xl p-8 hover-lift animate-fade-in group cursor-pointer"
                style={{ animationDelay: feature.delay }}
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-card to-transparent"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Get started in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '01', title: 'Create Profile', description: 'Sign up with your college email and build your profile' },
              { number: '02', title: 'Discover Events', description: 'Browse campus events and register for ones you like' },
              { number: '03', title: 'Join Teams', description: 'Find or create teams for your next big project' },
              { number: '04', title: 'Build Projects', description: 'Collaborate with teammates using our built-in tools' },
            ].map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-blue to-primary-yellow text-white text-3xl font-display font-bold mb-6 hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-blue to-primary-yellow"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              What Students <span className="gradient-text">Say</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Hear from students who are already building amazing things
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                role: 'Computer Science, VJTI',
                content: 'CampusConnect helped me find the perfect team for my final year project. The collaboration tools are amazing!',
                rating: 5,
              },
              {
                name: 'Rahul Verma',
                role: 'Electronics Engineering, SPIT',
                content: 'I discovered so many interesting events through this platform. It has really enriched my college experience.',
                rating: 5,
              },
              {
                name: 'Ananya Patel',
                role: 'Information Technology, DJ Sanghvi',
                content: 'The marketplace feature is a game-changer. I sold my old textbooks and bought what I needed instantly!',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="glass-effect rounded-2xl p-8 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-primary-yellow fill-current" />
                  ))}
                </div>
                <p className="text-text-secondary mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-text-secondary text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-blue to-primary-yellow opacity-10"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-effect rounded-3xl p-12 md:p-16 text-center animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of students already collaborating on CampusConnect
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-primary-yellow text-dark-bg font-semibold text-lg hover:bg-opacity-90 transition-all duration-300 hover-lift btn-primary"
            >
              Create Your Free Account
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
