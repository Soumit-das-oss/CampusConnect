import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import UserCard from '../components/UserCard'
import { getUsers } from '../services/userService'

const POPULAR_SKILLS = ['React', 'Python', 'JavaScript', 'Machine Learning', 'Node.js', 'Flutter', 'Java', 'Data Science']

function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-14" />
        <div className="h-5 bg-gray-700 rounded-full w-20" />
      </div>
      <div className="h-px bg-gray-700 mb-3" />
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-700 rounded w-20" />
        <div className="h-7 bg-gray-700 rounded-lg w-16" />
      </div>
    </div>
  )
}

function TeamFinderPage() {
  const [skillsFilter, setSkillsFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data: users = [], isLoading, isFetching } = useQuery({
    queryKey: ['users', skillsFilter],
    queryFn: () => getUsers(skillsFilter || undefined),
    placeholderData: (prev) => prev,
  })

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      setSkillsFilter(searchInput.trim())
    },
    [searchInput]
  )

  const handleClear = () => {
    setSearchInput('')
    setSkillsFilter('')
  }

  const handleTagClick = (skill) => {
    setSearchInput(skill)
    setSkillsFilter(skill)
  }

  const loading = isLoading || isFetching

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Team Finder</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Discover talented students and find your perfect teammates for hackathons & projects.
            </p>
          </div>

          {/* Search area */}
          <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 mb-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by skills (e.g. React, Python, Machine Learning)"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-600/20"
              >
                Search
              </button>
              {skillsFilter && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Popular skill tags */}
            <div className="mt-3">
              <p className="text-gray-500 text-xs mb-2">Popular skills:</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleTagClick(skill)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      skillsFilter === skill
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white border border-gray-600'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {skillsFilter && (
              <p className="text-gray-400 text-xs mt-3">
                Showing results for:{' '}
                <span className="text-indigo-400 font-medium">"{skillsFilter}"</span>
              </p>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-white font-semibold text-lg">No students found</p>
              <p className="text-gray-400 mt-2 text-sm max-w-sm mx-auto">
                {skillsFilter
                  ? `No students with skills matching "${skillsFilter}". Try a broader search or different keywords.`
                  : 'No students have registered yet. Invite your peers!'}
              </p>
              {skillsFilter && (
                <button
                  onClick={handleClear}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Clear filter and show all
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">
                  Found{' '}
                  <span className="text-white font-semibold">{users.length}</span>{' '}
                  {users.length === 1 ? 'student' : 'students'}
                  {skillsFilter && (
                    <span>
                      {' '}with skills in{' '}
                      <span className="text-indigo-400 font-medium">"{skillsFilter}"</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default TeamFinderPage
