import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ConnectionButton from '../components/ConnectionButton'
import useAuth from '../hooks/useAuth'
import { getUserById } from '../services/userService'
import { getInitials, formatDate } from '../utils/helpers'

function SkeletonProfile() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="h-7 bg-gray-700 rounded w-56 mb-3" />
            <div className="h-4 bg-gray-700 rounded w-40 mb-3" />
            <div className="h-4 bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-gray-700 rounded w-3/4" />
          </div>
        </div>
      </div>
      <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-6 mb-6">
        <div className="h-5 bg-gray-700 rounded w-20 mb-4" />
        <div className="flex gap-2">
          <div className="h-7 bg-gray-700 rounded-full w-16" />
          <div className="h-7 bg-gray-700 rounded-full w-20" />
          <div className="h-7 bg-gray-700 rounded-full w-14" />
        </div>
      </div>
    </div>
  )
}

function StudentProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['users', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  })

  const isOwnProfile = currentUser?._id === id || currentUser?.id === id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="max-w-3xl mx-auto">
              <div className="h-5 bg-gray-700 rounded w-16 mb-6 animate-pulse" />
              <SkeletonProfile />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="max-w-3xl mx-auto text-center py-16">
              <p className="text-5xl mb-4">😕</p>
              <p className="text-white font-semibold text-lg">Student not found</p>
              <p className="text-gray-400 mt-2 text-sm">
                This profile doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-5 inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                ← Go back
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const skillsList = Array.isArray(user.skills) ? user.skills : []
  const projectsList = Array.isArray(user.projects) ? user.projects : []

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              ← Back
            </button>

            {/* Profile Header Card */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-8 mb-5">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-3xl overflow-hidden flex-shrink-0 ring-4 ring-indigo-600/20 shadow-xl">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(user.name)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                      {user.collegeId && (
                        <p className="text-indigo-400 mt-1 font-medium text-sm">
                          {typeof user.collegeId === 'object' ? user.collegeId.name || user.collegeId.domain : user.collegeId}
                        </p>
                      )}
                      {user.email && (
                        <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {!isOwnProfile && (
                        <ConnectionButton
                          userId={user._id || user.id}
                          connectionStatus={user.connectionStatus}
                        />
                      )}
                    </div>
                  </div>
                  {user.bio && (
                    <p className="text-gray-300 mt-4 leading-relaxed text-sm">{user.bio}</p>
                  )}
                  {user.createdAt && (
                    <p className="text-gray-600 text-xs mt-3">
                      Member since {formatDate(user.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {skillsList.length > 0 && (
              <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-6 mb-5">
                <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <span>🛠</span> Skills
                  <span className="text-gray-500 text-xs font-normal">({skillsList.length})</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 rounded-full text-sm font-medium hover:bg-indigo-900/70 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projectsList.length > 0 && (
              <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-6 mb-5">
                <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <span>💼</span> Projects
                  <span className="text-gray-500 text-xs font-normal">({projectsList.length})</span>
                </h2>
                <div className="space-y-4">
                  {projectsList.map((project, idx) => {
                    const title =
                      typeof project === 'string'
                        ? project
                        : project.title || project.name || 'Untitled Project'
                    const description =
                      typeof project === 'object' ? project.description : null
                    const link = typeof project === 'object' ? project.link || project.url : null

                    return (
                      <div
                        key={idx}
                        className="border-l-2 border-indigo-600/60 pl-4 py-1"
                      >
                        <h3 className="text-white font-medium text-sm">{title}</h3>
                        {description && (
                          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{description}</p>
                        )}
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs mt-1.5 font-medium transition-colors"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resume */}
            {user.resumeUrl && (
              <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-6">
                <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <span>📄</span> Resume
                </h2>
                <a
                  href={user.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-600/20"
                >
                  📥 Download Resume
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentProfilePage
