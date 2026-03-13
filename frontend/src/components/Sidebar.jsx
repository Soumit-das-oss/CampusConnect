import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/team-finder', icon: '🔍', label: 'Team Finder' },
  { to: '/events', icon: '📅', label: 'Events' },
  { to: '/marketplace', icon: '🛒', label: 'Marketplace' },
  { to: '/connections', icon: '🔗', label: 'Connections' },
  { to: '/messages', icon: '💬', label: 'Messages' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
]

function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-700/60 fixed left-0 top-16 bottom-0 z-40 overflow-y-auto">
      <div className="flex flex-col flex-1 py-5 px-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/profile'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-700/60">
          <div className="px-3">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <NavLink
              to="/marketplace/create"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base leading-none">➕</span>
              <span>New Listing</span>
            </NavLink>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-700/60">
        <p className="text-xs text-gray-600 text-center">CampusConnect v1.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
