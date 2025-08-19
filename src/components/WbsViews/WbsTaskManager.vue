<template>
  <div class="wbs-task-manager">
    <!-- Header with view controls -->
    <div class="manager-header">
      <div class="header-left">
        <DxButton
          icon="menu"
          styling-mode="text"
          @click="toggleSidebar"
          class="sidebar-toggle"
        />
        <div class="title-section">
          <h2>{{ title }}</h2>
          <div v-if="selectedFolder" class="folder-context">
            {{ selectedFolder.name }}
          </div>
        </div>
        <div class="view-switcher">
          <DxButtonGroup
            :items="viewModes"
            key-expr="value"
            display-expr="text"
            :selected-item-keys="[currentView]"
            selection-mode="single"
            @selection-changed="onViewChange"
          />
        </div>
      </div>
      <div class="header-right">
        <DxButton
          text="Add Task"
          type="success"
          icon="plus"
          @click="showAddTaskDialog = true"
        />
        <DxButton
          text="Manage Columns"
          icon="preferences"
          @click="showColumnManager = true"
        />
      </div>
    </div>

    <!-- Main content area with sidebar -->
    <div class="manager-body">
      <!-- Folder Tree Sidebar -->
      <div 
        class="sidebar" 
        :class="{ 'sidebar-hidden': !showSidebar }"
      >
        <WbsFolderTree
          :selected-folder-id="selectedFolderId"
          :include-subfolders="includeSubfolders"
          @folder-selected="onFolderSelected"
          @filter-mode-changed="onFilterModeChanged"
          @clear-selection="clearFolderSelection"
        />
      </div>

      <!-- Main content area -->
      <div class="manager-content">
        <!-- Table View -->
        <WbsTableView
          v-if="currentView === 'table'"
          :tasks="filteredTasks"
          :columns="visibleColumns"
          @task-updated="onTaskUpdated"
          @task-deleted="onTaskDeleted"
        />

        <!-- List View -->
        <WbsListView
          v-else-if="currentView === 'list'"
          :tasks="filteredTasks"
          :columns="visibleColumns"
          @task-updated="onTaskUpdated"
          @task-deleted="onTaskDeleted"
        />

        <!-- Kanban View -->
        <WbsKanbanView
          v-else-if="currentView === 'kanban'"
          :tasks="filteredTasks"
          :status-column="statusColumn"
          :columns="allColumns"
          @task-updated="onTaskUpdated"
          @task-deleted="onTaskDeleted"
        />

        <!-- Calendar View -->
        <WbsCalendarView
          v-else-if="currentView === 'calendar'"
          :tasks="filteredTasks"
          :date-column="dateColumn"
          @task-updated="onTaskUpdated"
          @task-deleted="onTaskDeleted"
        />
      </div>
    </div>

    <!-- Add Task Dialog -->
    <DxPopup
      v-model:visible="showAddTaskDialog"
      title="Add New Task"
      :width="600"
      :height="400"
      :show-close-button="true"
    >
      <AddTaskForm
        :columns="allColumns"
        @task-created="onTaskCreated"
        @cancel="showAddTaskDialog = false"
      />
    </DxPopup>

    <!-- Column Manager Dialog -->
    <DxPopup
      v-model:visible="showColumnManager"
      title="Manage Columns"
      :width="500"
      :height="600"
      :show-close-button="true"
    >
      <ColumnManager
        :columns="allColumns"
        :visible-columns="visibleColumns"
        @columns-updated="onColumnsUpdated"
        @cancel="showColumnManager = false"
      />
    </DxPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DxButtonGroup, DxButton, DxPopup } from 'devextreme-vue'
import WbsTableView from './WbsTableView.vue'
import WbsListView from './WbsListView.vue'
import WbsKanbanView from './WbsKanbanView.vue'
import WbsCalendarView from './WbsCalendarView.vue'
import AddTaskForm from './AddTaskForm.vue'
import ColumnManager from './ColumnManager.vue'
import WbsFolderTree from './WbsFolderTree.vue'
import type { WbsTask, TaskColumn } from '@/types/wbs-task'
import type { FolderTreeNode } from '@/services/folderService'

interface Props {
  title?: string
  wbsId?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'WBS Tasks',
  wbsId: 0
})

const emit = defineEmits<{
  taskCreated: [task: WbsTask]
  taskUpdated: [task: WbsTask]
  taskDeleted: [taskId: number]
}>()

const currentView = ref<'table' | 'list' | 'kanban' | 'calendar'>('table')
const showAddTaskDialog = ref(false)
const showColumnManager = ref(false)
const showSidebar = ref(true)
const selectedFolderId = ref<number | null>(null)
const selectedFolder = ref<FolderTreeNode | null>(null)
const includeSubfolders = ref(true)
const tasks = ref<WbsTask[]>([])

const viewModes = [
  { value: 'table', text: 'Table', icon: 'rowfield' },
  { value: 'list', text: 'List', icon: 'bulletlist' },
  { value: 'kanban', text: 'Kanban', icon: 'hierarchy' },
  { value: 'calendar', text: 'Calendar', icon: 'event' }
]

const allColumns = ref<TaskColumn[]>([
  { id: 'name', name: 'Task Name', type: 'text', visible: true, width: 200, required: true },
  { id: 'description', name: 'Description', type: 'text', visible: true, width: 300 },
  { id: 'status', name: 'Status', type: 'select', visible: true, width: 120, 
    options: ['Not Started', 'In Progress', 'Completed', 'On Hold'] },
  { id: 'priority', name: 'Priority', type: 'select', visible: true, width: 100, 
    options: ['Low', 'Medium', 'High', 'Critical'] },
  { id: 'assignee', name: 'Assignee', type: 'select', visible: true, width: 150 },
  { id: 'startDate', name: 'Start Date', type: 'date', visible: true, width: 120 },
  { id: 'dueDate', name: 'Due Date', type: 'date', visible: true, width: 120 },
  { id: 'estimatedHours', name: 'Est. Hours', type: 'number', visible: true, width: 100 },
  { id: 'actualHours', name: 'Actual Hours', type: 'number', visible: false, width: 100 },
  { id: 'progress', name: 'Progress %', type: 'number', visible: true, width: 100 },
  { id: 'tags', name: 'Tags', type: 'tags', visible: false, width: 150 },
  { id: 'createdAt', name: 'Created', type: 'datetime', visible: false, width: 140 },
  { id: 'updatedAt', name: 'Updated', type: 'datetime', visible: false, width: 140 }
])

const visibleColumns = computed(() => 
  allColumns.value.filter(col => col.visible)
)

const filteredTasks = computed(() => {
  if (!selectedFolder.value) {
    return tasks.value
  }
  
  let targetFolderIds: number[] = []
  
  if (includeSubfolders.value) {
    // Hierarchical filtering: include all child folder IDs recursively  
    const getAllChildFolderIds = (folder: FolderTreeNode): number[] => {
      const ids: number[] = []
      if (folder.id) ids.push(folder.id)
      
      if (folder.children) {
        folder.children.forEach(child => {
          ids.push(...getAllChildFolderIds(child))
        })
      }
      
      return ids
    }
    
    targetFolderIds = getAllChildFolderIds(selectedFolder.value)
    console.log(`Hierarchical filtering for "${selectedFolder.value.name}" + children:`, targetFolderIds)
  } else {
    // Strict filtering: only selected folder
    targetFolderIds = selectedFolder.value.id ? [selectedFolder.value.id] : []
    console.log(`Strict filtering for "${selectedFolder.value.name}" only:`, targetFolderIds)
  }
  
  return tasks.value.filter(task => {
    return targetFolderIds.includes(task.folderId)
  })
})

const statusColumn = computed(() => 
  allColumns.value.find(col => col.id === 'status')
)

const dateColumn = computed(() => 
  allColumns.value.find(col => col.id === 'dueDate') || 
  allColumns.value.find(col => col.id === 'startDate')
)

onMounted(async () => {
  await loadTasks()
})

async function loadTasks() {
  // TODO: Implement API call to load tasks
  // For now, using mock data
  tasks.value = [
    {
      id: 1,
      name: 'Design Database Schema',
      description: 'Create initial database design for the project',
      status: 'Completed',
      priority: 'High',
      assignee: 'John Doe',
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-01-20'),
      estimatedHours: 16,
      actualHours: 18,
      progress: 100,
      tags: ['backend', 'database'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20'),
      wbsId: 1,
      folderId: 1
    },
    {
      id: 2,
      name: 'Implement User Authentication',
      description: 'Set up JWT-based authentication system',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Jane Smith',
      startDate: new Date('2024-01-21'),
      dueDate: new Date('2024-01-28'),
      estimatedHours: 24,
      actualHours: 12,
      progress: 50,
      tags: ['backend', 'security'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-25'),
      wbsId: 1,
      folderId: 1
    },
    {
      id: 3,
      name: 'Create Vue.js Components',
      description: 'Build reusable UI components for the application',
      status: 'Not Started',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      startDate: new Date('2024-02-01'),
      dueDate: new Date('2024-02-15'),
      estimatedHours: 32,
      progress: 0,
      tags: ['frontend', 'vue'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      wbsId: 2,
      folderId: 2
    },
    {
      id: 4,
      name: 'Setup Navigation Component',
      description: 'Create main navigation menu with routing',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Sarah Wilson',
      startDate: new Date('2024-02-05'),
      dueDate: new Date('2024-02-12'),
      estimatedHours: 16,
      actualHours: 8,
      progress: 60,
      tags: ['frontend', 'navigation'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-08'),
      wbsId: 1,
      folderId: 3
    },
    {
      id: 5,
      name: 'Build Form Validation System',
      description: 'Implement reusable form validation components',
      status: 'Completed',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      startDate: new Date('2024-01-25'),
      dueDate: new Date('2024-02-02'),
      estimatedHours: 20,
      actualHours: 22,
      progress: 100,
      tags: ['frontend', 'forms', 'validation'],
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-02-02'),
      wbsId: 1,
      folderId: 3
    },
    {
      id: 6,
      name: 'Create Data Table Component',
      description: 'Build sortable and filterable data table',
      status: 'Not Started',
      priority: 'Low',
      assignee: 'Sarah Wilson',
      startDate: new Date('2024-02-15'),
      dueDate: new Date('2024-02-28'),
      estimatedHours: 28,
      progress: 0,
      tags: ['frontend', 'components', 'table'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      wbsId: 2,
      folderId: 4
    },
    {
      id: 7,
      name: 'Implement Dashboard Views',
      description: 'Create main dashboard with charts and widgets',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Jane Smith',
      startDate: new Date('2024-02-08'),
      dueDate: new Date('2024-02-20'),
      estimatedHours: 40,
      actualHours: 15,
      progress: 35,
      tags: ['frontend', 'dashboard', 'charts'],
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-12'),
      wbsId: 1,
      folderId: 4
    },
    {
      id: 8,
      name: 'Setup API Endpoints',
      description: 'Create REST API controllers for data operations',
      status: 'Completed',
      priority: 'Critical',
      assignee: 'John Doe',
      startDate: new Date('2024-01-28'),
      dueDate: new Date('2024-02-05'),
      estimatedHours: 32,
      actualHours: 30,
      progress: 100,
      tags: ['backend', 'api', 'rest'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-02-05'),
      wbsId: 1,
      folderId: 6
    },
    {
      id: 9,
      name: 'Database Migrations',
      description: 'Create and run database migration scripts',
      status: 'On Hold',
      priority: 'Medium',
      assignee: 'John Doe',
      startDate: new Date('2024-02-10'),
      dueDate: new Date('2024-02-18'),
      estimatedHours: 12,
      actualHours: 4,
      progress: 25,
      tags: ['backend', 'database', 'migrations'],
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-10'),
      wbsId: 2,
      folderId: 7
    },
    {
      id: 10,
      name: 'API Documentation',
      description: 'Write comprehensive API documentation',
      status: 'Not Started',
      priority: 'Low',
      assignee: 'Sarah Wilson',
      startDate: new Date('2024-02-20'),
      dueDate: new Date('2024-03-05'),
      estimatedHours: 18,
      progress: 0,
      tags: ['backend', 'documentation', 'api'],
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      wbsId: 1,
      folderId: 6
    },
    {
      id: 11,
      name: 'Security Audit',
      description: 'Perform security audit of authentication system',
      status: 'In Progress',
      priority: 'Critical',
      assignee: 'Jane Smith',
      startDate: new Date('2024-02-12'),
      dueDate: new Date('2024-02-25'),
      estimatedHours: 24,
      actualHours: 10,
      progress: 40,
      tags: ['backend', 'security', 'audit'],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-15'),
      wbsId: 2,
      folderId: 7
    },
    {
      id: 12,
      name: 'User Research Study',
      description: 'Conduct user interviews and usability testing',
      status: 'Completed',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      startDate: new Date('2024-01-30'),
      dueDate: new Date('2024-02-10'),
      estimatedHours: 35,
      actualHours: 38,
      progress: 100,
      tags: ['research', 'user-testing'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-02-10'),
      wbsId: 1,
      folderId: 9
    },
    {
      id: 13,
      name: 'Prototype Development',
      description: 'Build interactive prototype for new features',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Sarah Wilson',
      startDate: new Date('2024-02-15'),
      dueDate: new Date('2024-03-01'),
      estimatedHours: 45,
      actualHours: 20,
      progress: 45,
      tags: ['prototype', 'design', 'frontend'],
      createdAt: new Date('2024-02-12'),
      updatedAt: new Date('2024-02-18'),
      wbsId: 2,
      folderId: 10
    }
  ]
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

function onFolderSelected(folder: FolderTreeNode | null) {
  selectedFolder.value = folder
  selectedFolderId.value = folder?.id || null
}

function clearFolderSelection() {
  selectedFolder.value = null
  selectedFolderId.value = null
  includeSubfolders.value = true // Reset to default
}

function onFilterModeChanged(newMode: boolean) {
  includeSubfolders.value = newMode
}

function onViewChange(e: any) {
  currentView.value = e.addedItems[0]?.value || 'table'
}

function onTaskCreated(task: WbsTask) {
  tasks.value.push(task)
  showAddTaskDialog.value = false
  emit('taskCreated', task)
}

function onTaskUpdated(task: WbsTask) {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index >= 0) {
    tasks.value[index] = task
  }
  emit('taskUpdated', task)
}

function onTaskDeleted(taskId: number) {
  const index = tasks.value.findIndex(t => t.id === taskId)
  if (index >= 0) {
    tasks.value.splice(index, 1)
  }
  emit('taskDeleted', taskId)
}

function onColumnsUpdated(columns: TaskColumn[]) {
  allColumns.value = columns
  showColumnManager.value = false
}
</script>

<style scoped lang="scss">
.wbs-task-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e1e5e9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .sidebar-toggle {
      margin-right: 8px;
    }

    .title-section {
      display: flex;
      flex-direction: column;
      min-width: 200px;
      flex-shrink: 0;
      
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #2c3e50;
        line-height: 1.2;
      }
      
      .folder-context {
        font-weight: 400;
        color: #6c757d;
        font-size: 14px;
        margin-top: 2px;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.manager-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  min-width: 250px;
  max-width: 400px;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &.sidebar-hidden {
    width: 0;
    min-width: 0;
  }
}

.manager-content {
  flex: 1;
  overflow: hidden;
  padding: 16px 24px;
}

.view-switcher {
  :deep(.dx-buttongroup) {
    border-radius: 6px;
    overflow: hidden;
  }

  :deep(.dx-button) {
    border-radius: 0;
    border-right: 1px solid #ddd;

    &:last-child {
      border-right: none;
    }
  }
}
</style>