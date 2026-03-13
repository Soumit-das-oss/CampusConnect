import { Link } from 'react-router-dom'

const features = [
  {
    icon: '👤',
    title: 'Student Profiles',
    description:
      'Build a rich profile showcasing your skills, projects, and experience. Make yourself discoverable to peers and collaborators.',
    color: 'indigo',
  },
  {
    icon: '🔍',
    title: 'Team Finder',
    description:
      'Find the perfect teammates for your next hackathon or project. Filter by skills and connect with the right people instantly.',
    color: 'violet',
  },
  {
    icon: '🛒',
    title: 'Campus Marketplace',
    description:
      'Buy and sell textbooks, electronics, and more within your campus community. Safe, local, and trusted.',
    color: 'blue',
  },
  {
    icon: '🔗',
    title: 'Connections',
    description:
      'Grow your campus network by connecting with classmates, seniors, and juniors. Collaboration starts with a connection.',
    color: 'cyan',
  },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800/60 bg-gray-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">CampusConnect</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Gradient blobs */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-gray-900 to-gray-900 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              Your Campus. Your Community. Your Network.
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Connect.{' '}
              </span>
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Collaborate.{' '}
              </span>
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Build.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              The all-in-one platform for college students to discover peers, form dream teams for
              hackathons, and trade items within their campus community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 shadow-lg shadow-indigo-600/30"
              >
                Create Free Account →
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
              >
                Sign In
              </Link>
            </div>

            <p className="text-gray-500 text-sm mt-5">
              Free for students · Use your college email · No credit card required
            </p>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { label: 'Students', value: '1,000+' },
              { label: 'Connections', value: '5,000+' },
              { label: 'Listings', value: '2,500+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need on campus
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              CampusConnect brings your entire student community onto one powerful, easy-to-use
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/20 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-900/60 border border-indigo-700/40 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:bg-indigo-600/30 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get started in minutes
            </h2>
            <p className="text-gray-400 text-lg">Simple, fast, and built for students.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create your profile',
                desc: 'Sign up with your college email and build your student profile with skills and projects.',
              },
              {
                step: '02',
                title: 'Discover & Connect',
                desc: 'Browse students, find teammates for your projects, and send connection requests.',
              },
              {
                step: '03',
                title: 'Collaborate & Trade',
                desc: 'Work together on projects and use the marketplace to buy or sell campus items.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-700/40 text-indigo-400 font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-gray-900 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to connect with your campus?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of students already building their network, finding teammates, and
            trading on CampusConnect.
          </p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-600/30"
          >
            Join CampusConnect — It's Free
          </Link>
          <p className="text-gray-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in here
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-10 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <span className="text-gray-400 font-semibold text-sm">CampusConnect</span>
            </div>
            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} CampusConnect. Built for students, by students.
            </p>
            <div className="flex gap-4">
              <Link to="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
