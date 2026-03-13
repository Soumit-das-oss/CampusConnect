export interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'ADMIN'
  banned: boolean
  collegeId: string
  createdAt: string
  college?: College
  skills?: Skill[]
}

export interface College {
  id: string
  name: string
  domain: string
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  userId: string
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  imageUrl?: string
  collegeId: string
  createdBy: string
  createdAt: string
  registrations?: EventRegistration[]
  isRegistered?: boolean
}

export interface EventRegistration {
  id: string
  userId: string
  eventId: string
  registeredAt: string
  user?: User
}

export interface Team {
  id: string
  name: string
  description: string
  leaderId: string
  collegeId: string
  createdAt: string
  leader?: User
  members?: TeamMember[]
  _count?: {
    members: number
  }
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  joinedAt: string
  user?: User
}

export interface Message {
  id: string
  content: string
  senderId: string
  teamId: string
  createdAt: string
  sender?: User
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  teamId: string
  assignedTo?: string
  createdBy: string
  createdAt: string
  assignee?: User
}

export interface Board {
  id: string
  teamId: string
  content: string
  updatedAt: string
}

export interface MarketplaceListing {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  status: 'ACTIVE' | 'SOLD' | 'DELETED'
  sellerId: string
  collegeId: string
  createdAt: string
  seller?: User
}

export interface Connection {
  id: string
  senderId: string
  receiverId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  sender?: User
  receiver?: User
}

export interface Notification {
  id: string
  type: 'TEAM_INVITE' | 'CONNECTION_REQUEST' | 'EVENT' | 'MARKETPLACE'
  message: string
  metadata?: any
  read: boolean
  userId: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}
