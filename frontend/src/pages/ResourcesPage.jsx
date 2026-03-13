import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { getResources, uploadResource, downloadResource, deleteResource } from '../services/resourceService'

const BRANCHES = [
  'Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical',
  'Civil', 'Chemical', 'Electrical', 'Other',
]
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
const FILE_ICON = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-powerpoint': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
  'application/zip': '🗜',
  'application/x-zip-compressed': '🗜',
  'image/jpeg': '🖼',
  'image/png': '🖼',
  'image/gif': '🖼',
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', subject: '', semester: '', branch: '' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!file) return setError('Please select a file.')
    setUploading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('file', file)
      await uploadResource(fd)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700/60 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60">
          <h2 className="text-white font-semibold text-lg">Upload Resource</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Title *</label>
            <input
              value={form.title} onChange={set('title')} required
              placeholder="e.g. Operating Systems Notes Unit 1-4"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Subject *</label>
              <input
                value={form.subject} onChange={set('subject')} required
                placeholder="e.g. Operating Systems"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Semester *</label>
              <select
                value={form.semester} onChange={set('semester')} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Branch *</label>
            <select
              value={form.branch} onChange={set('branch')} required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select branch</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={set('description')}
              placeholder="Brief description of the resource (optional)"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">File * <span className="text-gray-600">(PDF, DOC, PPT, ZIP, Image — max 50 MB)</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl px-4 py-6 text-center cursor-pointer transition-colors"
            >
              {file ? (
                <div className="text-sm">
                  <p className="text-white font-medium">{FILE_ICON[file.type] || '📎'} {file.name}</p>
                  <p className="text-gray-500 mt-1">{formatBytes(file.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-3xl mb-2">📁</p>
                  <p className="text-gray-400 text-sm">Click to browse files</p>
                  <p className="text-gray-600 text-xs mt-1">PDF, DOC, DOCX, PPT, PPTX, ZIP, Images</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.gif"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={uploading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ResourceCard({ resource, currentUserId, onDelete }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { url, fileName } = await downloadResource(resource._id)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      alert('Failed to download. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const icon = FILE_ICON[resource.fileType] || '📎'
  const isOwner = resource.uploadedBy?._id === currentUserId || resource.uploadedBy?._id?.toString() === currentUserId

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5 flex flex-col gap-3 hover:border-indigo-500/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm leading-snug truncate">{resource.title}</h3>
            {resource.description && (
              <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{resource.description}</p>
            )}
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(resource._id)}
            className="text-gray-600 hover:text-red-400 text-lg leading-none flex-shrink-0 transition-colors"
            title="Delete resource"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">{resource.subject}</span>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">Sem {resource.semester}</span>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{resource.branch}</span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden flex-shrink-0">
            {resource.uploadedBy?.avatarUrl
              ? <img src={resource.uploadedBy.avatarUrl} alt="" className="w-6 h-6 object-cover rounded-full" />
              : resource.uploadedBy?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-gray-400 text-xs truncate">{resource.uploadedBy?.name}</p>
            <p className="text-gray-600 text-[10px]">
              {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
              {resource.fileSize ? ` · ${formatBytes(resource.fileSize)}` : ''}
              {resource.downloadsCount > 0 ? ` · ${resource.downloadsCount} downloads` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload} disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
        >
          {downloading ? '...' : '⬇ Download'}
        </button>
      </div>
    </div>
  )
}

function ResourcesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const params = {}
  if (search) params.search = search
  if (filterSubject) params.subject = filterSubject
  if (filterSemester) params.semester = filterSemester
  if (filterBranch) params.branch = filterBranch

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources', params],
    queryFn: () => getResources(params),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      setDeleteConfirm(null)
    },
  })

  const currentUserId = user?._id || user?.id

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 px-6 py-6 max-w-7xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Campus Resources</h1>
              <p className="text-gray-500 text-sm mt-0.5">Study materials shared by students at your campus</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              + Upload Resource
            </button>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, subject..."
              className="flex-1 min-w-52 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
              placeholder="Filter by subject"
              className="w-44 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}
              className="w-40 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <select
              value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
              className="w-52 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Branches</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {(search || filterSubject || filterSemester || filterBranch) && (
              <button
                onClick={() => { setSearch(''); setFilterSubject(''); setFilterSemester(''); setFilterBranch('') }}
                className="px-3 py-2.5 text-gray-400 hover:text-white bg-gray-800 border border-gray-700 rounded-xl text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Resource grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-white font-semibold text-lg">No resources found</p>
              <p className="text-gray-500 text-sm mt-1">
                {search || filterSubject || filterSemester || filterBranch
                  ? 'Try adjusting your filters.'
                  : 'Be the first to share study materials with your campus!'}
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Upload Resource
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-xs mb-4">{resources.length} resource{resources.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((r) => (
                  <ResourceCard
                    key={r._id}
                    resource={r}
                    currentUserId={currentUserId}
                    onDelete={(id) => setDeleteConfirm(id)}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['resources'] })}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <p className="text-white font-semibold mb-2">Delete Resource?</p>
            <p className="text-gray-400 text-sm mb-5">This will permanently remove the file. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourcesPage
