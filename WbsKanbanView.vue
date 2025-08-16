<template>
  <div class="wbs-kanban-view">
    <!-- Kanban Header -->
    <div class="kanban-header">
      <div class="header-left">
        <h3>Kanban Board</h3>
        <DxSelectBox
          :data-source="groupByOptions"
          value-expr="value"
          display-expr="text"
          :value="groupByField"
          @value-changed="onGroupByChanged"
          placeholder="Group by..."
          :width="150"
        />
      </div>
      <div class="header-right">
        <DxTextBox
          v-model:value="searchText"
          placeholder="Search tasks..."
          mode="search"
          :width="250"
        />
        <DxButton
          text="Add Column"
          icon="plus"
          @click="showAddColumnDialog = true"
        />
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board">
      <DxScrollView direction="horizontal" :show-scrollbar="'onHover'">
        <div class="kanban-columns">
          <div
            v-for="column in kanbanColumns"
            :key="column.key"
            class="kanban-column"
            @drop="onDrop($event, column.key)"
            @dragover="onDragOver"
          >
            <!-- Column Header -->
            <div class="column-header">
              <div class="column-title">
                <span class="column-name">{{ column.title }}</span>
                <span class="task-count">{{ column.tasks.length }}</span>
              </div>
              <div class="column-actions">
                <DxButton
                  icon="plus"
                  styling-mode="text"
                  title="Add task to this column"
                  @click="addTaskToColumn(column.key)"
                />
                <DxDropDownButton
                  icon="more"
                  styling-mode="text"
                  :items="columnActions"
                  @item-click="(e) => onColumnAction(e, column)"
                />
              </div>
            </div>

            <!-- Column Content -->
            <div class="column-content">
              <DxScrollView
                direction="vertical"
                :show-scrollbar="'onHover'"
                class="column-scroll"
              >
                <div class="task-cards">
                  <KanbanCard
                    v-for="task in column.tasks"
                    :key="task.id"
                    :task="task"
                    :columns="visibleColumns"
                    @task-updated="onTaskUpdated"
                    @task-deleted="onTaskDeleted"
                    @task-clicked="onTaskClicked"
                    @drag-start="onDragStart"
                  />
                </div>
              </DxScrollView>
            </div>

            <!-- Add Task Button -->
            <div class="column-footer">
              <DxButton
                text="+ Add a task"
                styling-mode="text"
                class="add-task-button"
                @click="addTaskToColumn(column.key)"
              />
            </div>
          </div>

          <!-- Add Column Button -->
          <div class="add-column">
            <DxButton
              text="+ Add Column"
              styling-mode="outlined"
              class="add-column-button"
              @click="showAddColumnDialog = true"
            />
          </div>
        </div>
      </DxScrollView>
    </div>

    <!-- Add Column Dialog -->
    <DxPopup
      v-model:visible="showAddColumnDialog"
      title="Add New Column"
      :width="400"
      :height="300"
      :show-close-button="true"
    >
      <div class="add-column-form">
        <DxTextBox
          v-model:value="newColumnName"
          label="Column Name"
          placeholder="Enter column name..."
        />
        <div class="form-actions">
          <DxButton
            text="Add Column"
            type="success"
            @click="addColumn"
          />
          <DxButton
            text="Cancel"
            @click="showAddColumnDialog = false"
          />
        </div>
      </div>
    </DxPopup>

    <!-- Task Detail Panel -->
    <DxDrawer
      v-model:opened="showTaskDetail"
      :width="400"
      position="right"
      reveal-mode="slide"
      open-state-mode="push"
    >
      <TaskDetailPanel
        v-if="selectedTask"
        :task="selectedTask"
        :columns="columns"
        @task-updated="onTaskUpdated"
        @close="showTaskDetail = false"
      />
    </DxDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  DxScrollView,
  DxSelectBox,
  DxTextBox,
  DxButton,
  DxDropDownButton,
  DxPopup,
  DxDrawer
} from 'devextreme-vue'
import KanbanCard from './KanbanCard.vue'
import TaskDetailPanel from './TaskDetailPanel.vue'
import type { WbsTask, TaskColumn } from '@/types/wbs-task'

interface Props {
  tasks: WbsTask[]
  statusColumn?: TaskColumn
}

const props = defineProps<Props>()

const emit = defineEmits<{
  taskUpdated: [task: WbsTask]
  taskDeleted: [taskId: number]
}>()

const searchText = ref('')
const groupByField = ref('status')
const selectedTask = ref<WbsTask | null>(null)
const showTaskDetail = ref(false)
const showAddColumnDialog = ref(false)
const newColumnName = ref('')
const draggedTask = ref<WbsTask | null>(null)
const customColumns = ref<string[]>([])

const groupByOptions = [
  { value: 'status', text: 'Status' },
  { value: 'priority', text: 'Priority' },
  { value: 'assignee', text: 'Assignee' }
]

const columnActions = [
  { text: 'Edit Column', icon: 'edit' },
  { text: 'Delete Column', icon: 'trash' },
  { text: 'Clear Tasks', icon: 'clear' }
]

const visibleColumns = computed(() => {
  // For kanban, we want to show fewer columns to keep cards compact
  const importantFields = ['priority', 'assignee', 'dueDate', 'estimatedHours', 'progress']
  return importantFields.map(fieldId => ({
    id: fieldId,
    name: fieldId.charAt(0).toUpperCase() + fieldId.slice(1),
    type: 'text' as const,
    visible: true
  }))
})

const filteredTasks = computed(() => {
  let filtered = props.tasks

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(task =>
      task.name.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search) ||
      task.assignee?.toLowerCase().includes(search)
    )
  }

  return filtered
})

const kanbanColumns = computed(() => {
  const columns = new Map<string, WbsTask[]>()
  
  // Get all possible column values
  const allValues = new Set<string>()
  filteredTasks.value.forEach(task => {
    const value = task[groupByField.value as keyof WbsTask] as string
    if (value) allValues.add(value)
  })

  // Add custom columns
  customColumns.value.forEach(col => allValues.add(col))

  // Initialize columns
  allValues.forEach(value => {
    columns.set(value, [])
  })

  // Add default columns if none exist
  if (columns.size === 0) {
    if (groupByField.value === 'status') {
      ['Not Started', 'In Progress', 'Completed'].forEach(status => {
        columns.set(status, [])
      })
    } else if (groupByField.value === 'priority') {
      ['Low', 'Medium', 'High', 'Critical'].forEach(priority => {
        columns.set(priority, [])
      })
    }
  }

  // Distribute tasks into columns
  filteredTasks.value.forEach(task => {
    const value = task[groupByField.value as keyof WbsTask] as string || 'Unassigned'
    if (!columns.has(value)) {
      columns.set(value, [])
    }
    columns.get(value)!.push(task)
  })

  return Array.from(columns.entries()).map(([key, tasks]) => ({
    key,
    title: key,
    tasks: tasks.sort((a, b) => a.order || 0 - (b.order || 0))
  }))
})

function onGroupByChanged(e: any) {
  groupByField.value = e.value
}

function onDragStart(task: WbsTask) {
  draggedTask.value = task
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function onDrop(e: DragEvent, columnKey: string) {
  e.preventDefault()
  
  if (!draggedTask.value) return

  const updatedTask = {
    ...draggedTask.value,
    [groupByField.value]: columnKey,
    updatedAt: new Date()
  }

  emit('taskUpdated', updatedTask)
  draggedTask.value = null
}

function addTaskToColumn(columnKey: string) {
  // This would open a task creation dialog with the column value pre-filled
  console.log('Add task to column:', columnKey)
}

function addColumn() {
  if (newColumnName.value.trim()) {
    customColumns.value.push(newColumnName.value.trim())
    newColumnName.value = ''
    showAddColumnDialog.value = false
  }
}

function onColumnAction(e: any, column: any) {
  switch (e.itemData.text) {
    case 'Edit Column':
      console.log('Edit column:', column.key)
      break
    case 'Delete Column':
      const index = customColumns.value.indexOf(column.key)
      if (index > -1) {
        customColumns.value.splice(index, 1)
      }
      break
    case 'Clear Tasks':
      // Move all tasks from this column to 'Unassigned'
      column.tasks.forEach((task: WbsTask) => {
        const updatedTask = {
          ...task,
          [groupByField.value]: null,
          updatedAt: new Date()
        }
        emit('taskUpdated', updatedTask)
      })
      break
  }
}

function onTaskUpdated(task: WbsTask) {
  emit('taskUpdated', task)
}

function onTaskDeleted(taskId: number) {
  emit('taskDeleted', taskId)
  if (selectedTask.value?.id === taskId) {
    selectedTask.value = null
    showTaskDetail.value = false
  }
}

function onTaskClicked(task: WbsTask) {
  selectedTask.value = task
  showTaskDetail.value = true
}
</script>

<style scoped lang="scss">
.wbs-kanban-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.kanban-board {
/*  //flex: 1;*/
/*  //overflow: hidden;*/
  padding: 16px;
}

.kanban-columns {
  display: flex;
  gap: 16px;
  min-height: 100%;
  padding-bottom: 16px;
}

.kanban-column {
  width: 320px;
  min-width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;

  .column-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .column-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .task-count {
      background: #e9ecef;
      color: #6c757d;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
  }

  .column-actions {
    display: flex;
    gap: 4px;
  }
}

.column-content {
  flex: 1;
  overflow: hidden;

  .column-scroll {
    height: 100%;
    padding: 8px;
  }
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-footer {
  padding: 8px 16px;
  border-top: 1px solid #e9ecef;

  .add-task-button {
    width: 100%;
    justify-content: flex-start;
    color: #6c757d;

    &:hover {
      background: #f8f9fa;
      color: #495057;
    }
  }
}

.add-column {
  display: flex;
  align-items: flex-start;
  padding-top: 16px;

  .add-column-button {
    width: 200px;
    height: 120px;
    border: 2px dashed #dee2e6;
    background: transparent;
    color: #6c757d;

    &:hover {
      border-color: #007bff;
      color: #007bff;
      background: rgba(0, 123, 255, 0.05);
    }
  }
}

.add-column-form {
  padding: 20px;

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }
}
</style>
