export interface WbsTask {
  id: number
  name: string
  description?: string
  status: string
  priority: string
  assignee?: string
  startDate?: Date
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  progress: number
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  parentId?: number
  wbsId: number
  order?: number
  [key: string]: any // Allow dynamic attributes
}

export interface TaskColumn {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'tags' | 'boolean' | 'currency'
  visible: boolean
  width?: number
  required?: boolean
  options?: string[] // For select type
  min?: number // For number type
  max?: number // For number type
  format?: string // For date/number formatting
  editable?: boolean
  sortable?: boolean
  filterable?: boolean
}

export interface TaskFilter {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between'
  value: any
}

export interface TaskView {
  id: string
  name: string
  type: 'table' | 'list' | 'kanban' | 'calendar'
  columns: TaskColumn[]
  filters: TaskFilter[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  groupBy?: string
}