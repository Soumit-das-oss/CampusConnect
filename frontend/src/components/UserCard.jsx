import { Link } from 'react-router-dom'
import { getInitials } from '../utils/helpers'
import ConnectionButton from './ConnectionButton'

function UserCard({ user }) {
  const {
    id,
    name,
    skills = [],
    bio,
    avatarUrl,
    collegeId,
    connectionStatus,
  } = user

  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/60 transition-all hover:shadow-lg hover:shadow-indigo-900/20 group">
      {/* Header: avatar + name */}
      <div className="flex items-start gap-3.5 mb-4">
        <Link to={`/profile/${id}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500/40 transition-all">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${id}`}
            className="text-white font-semibold hover:text-indigo-400 transition-colors block truncate leading-snug"
          >
            {name}
          </Link>
          {collegeId && (
            <p className="text-indigo-400 text-xs mt-0.5 truncate font-medium">
              {typeof collegeId === 'object' ? collegeId.name || collegeId.domain : collegeId}
            </p>
          )}
          {bio && (
            <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{bio}</p>
          )}
        </div>
      </div>

      {/* Skills badges */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-700/60 text-gray-400 rounded-full text-xs">
              +{skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer: view link + connect button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/40">
        <Link
          to={`/profile/${id}`}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          View Profile →
        </Link>
        <ConnectionButton userId={id} connectionStatus={connectionStatus} />
      </div>
    </div>
  )
}

export default UserCard
