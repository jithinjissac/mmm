export interface TenantGroup {
  id: string
  name: string
  description?: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

export interface TenantGroupMember {
  userId: string
  userName: string
  avatarUrl?: string
}

export interface TenantGroupFormData {
  name: string
  description?: string
  memberIds: string[]
}
