<template>
  <div class="wbs-task-manager">
    <!-- Header with view controls -->
    <div class="manager-header">
      <div class="header-left">
        <h2>{{ title }}</h2>
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

    <!-- Main content area -->
    <div class="manager-content">
      <!-- Table View -->
      <WbsTableView
        v-if="currentView === 'table'"
        :tasks="tasks"
        :columns="visibleColumns"
        @task-updated="onTaskUpdated"
        @task-deleted="onTaskDeleted"
      />

      <!-- List View -->
      <WbsListView
        v-else-if="currentView === 'list'"
        :tasks="tasks"
        :columns="visibleColumns"
        @task-updated="onTaskUpdated"
        @task-deleted="onTaskDeleted"
      />

      <!-- Kanban View -->
      <WbsKanbanView
        v-else-if="currentView === 'kanban'"
        :tasks="tasks"
        :status-column="statusColumn"
        @task-updated="onTaskUpdated"
        @task-deleted="onTaskDeleted"
      />

      <!-- Calendar View -->
      <WbsCalendarView
        v-else-if="currentView === 'calendar'"
        :tasks="tasks"
        :date-column="dateColumn"
        @task-updated="onTaskUpdated"
        @task-deleted="onTaskDeleted"
      />
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
import WbsTableView from './WbsViews/WbsTableView.vue'
import WbsListView from './WbsViews/WbsListView.vue'
import WbsKanbanView from './WbsViews/WbsKanbanView.vue'
import WbsCalendarView from './WbsViews/WbsCalendarView.vue'
import AddTaskForm from './WbsViews/AddTaskForm.vue'
import ColumnManager from './WbsViews/ColumnManager.vue'
import type { WbsTask, TaskColumn } from '@/types/wbs-task'

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
const tasks = ref<WbsTask[]>([])

const viewModes = [
  { value: 'table', text: 'Table', icon: 'table' },
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
      updatedAt: new Date('2024-01-20')
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
      updatedAt: new Date('2024-01-25')
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
      updatedAt: new Date('2024-01-20')
    }
  ]
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
    gap: 24px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
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