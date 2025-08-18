<template>
  <div class="wbs-calendar-view">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="header-left">
        <h3>Calendar View</h3>
        <DxSelectBox
          :data-source="dateFieldOptions"
          value-expr="value"
          display-expr="text"
          :value="dateField"
          @value-changed="onDateFieldChanged"
          placeholder="Date field..."
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
        <DxSelectBox
          :data-source="viewModes"
          value-expr="value"
          display-expr="text"
          :value="currentView"
          @value-changed="onViewModeChanged"
          :width="120"
        />
      </div>
    </div>

    <!-- Calendar Component -->
    <div class="calendar-content">
      <DxScheduler
        ref="schedulerRef"
        :data-source="calendarTasks"
        :views="schedulerViews"
        :current-view="currentView"
        :current-date="currentDate"
        :start-day-hour="8"
        :end-day-hour="18"
        :show-all-day-panel="true"
        :editing="editingConfig"
        :time-zone="timeZone"
        text-expr="name"
        description-expr="description"
        start-date-expr="startDate"
        end-date-expr="endDate"
        all-day-expr="allDay"
        recurrence-rule-expr="recurrenceRule"
        @appointment-click="onAppointmentClick"
        @appointment-dbl-click="onAppointmentDblClick"
        @appointment-added="onAppointmentAdded"
        @appointment-updated="onAppointmentUpdated"
        @appointment-deleted="onAppointmentDeleted"
        @cell-click="onCellClick"
      >
      </DxScheduler>

    </div>

    <!-- Task Detail Panel -->
    <DxDrawer
      v-model:opened="showTaskDetail"
      :width="500"
      position="right"
      reveal-mode="slide"
      open-state-mode="overlap"
      :close-on-outside-click="true"
      template="dxTemp"
      class="calendar-drawer"
    >
    <template #dxTemp>
      <div class="drawer-content-wrapper">        
        <TaskDetailPanel
          v-if="selectedTask"
          :task="selectedTask"
          :columns="columns"
          @task-updated="onTaskUpdated"
          @close="showTaskDetail = false"
        /> 
      </div>
    </template>
    </DxDrawer>

    <!-- Quick Add Task Dialog -->
    <DxPopup
      v-model:visible="showQuickAdd"
      title="Quick Add Task"
      :width="400"
      :height="300"
      :show-close-button="true"
    >
      <QuickAddTaskForm
        :initial-date="quickAddDate"
        @task-created="onTaskCreated"
        @cancel="showQuickAdd = false"
      />
    </DxPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  DxScheduler,
  DxSelectBox,
  DxTextBox,
  DxDrawer,
  DxPopup
} from 'devextreme-vue'
import TaskDetailPanel from './TaskDetailPanel.vue'
import QuickAddTaskForm from './QuickAddTaskForm.vue'
import type { WbsTask, TaskColumn } from '@/types/wbs-task'

interface Props {
  tasks: WbsTask[]
  dateColumn?: TaskColumn
}

const props = defineProps<Props>()

const emit = defineEmits<{
  taskUpdated: [task: WbsTask]
  taskDeleted: [taskId: number]
  taskCreated: [task: WbsTask]
}>()

const schedulerRef = ref()
const searchText = ref('')
const dateField = ref('dueDate')
const currentView = ref('month')
const currentDate = ref(new Date())
const selectedTask = ref<WbsTask | null>(null)
const showTaskDetail = ref(false)
const showQuickAdd = ref(false)
const quickAddDate = ref<Date | null>(null)
const timeZone = 'Europe/Warsaw'

const dateFieldOptions = [
  { value: 'dueDate', text: 'Due Date' },
  { value: 'startDate', text: 'Start Date' },
  { value: 'createdAt', text: 'Created Date' },
  { value: 'updatedAt', text: 'Updated Date' }
]

const viewModes = [
  { value: 'day', text: 'Day' },
  { value: 'week', text: 'Week' },
  { value: 'month', text: 'Month' },
  { value: 'agenda', text: 'Agenda' }
]

const schedulerViews = [
  {
    type: 'day',
    name: 'Day',
    intervalCount: 1
  },
  {
    type: 'week',
    name: 'Week',
    intervalCount: 1
  },
  {
    type: 'month',
    name: 'Month',
    intervalCount: 1
  },
  {
    type: 'agenda',
    name: 'Agenda',
    intervalCount: 7
  }
]

const editingConfig = {
  allowAdding: true,
  allowUpdating: true,
  allowDeleting: true,
  allowResizing: true,
  allowDragging: true
}

const filteredTasks = computed(() => {
  debugger
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

const calendarTasks = computed(() => {
  debugger
  return filteredTasks.value.map(task => {
    const dateValue = task[dateField.value as keyof WbsTask] as Date
    
    if (!dateValue) return null

    const startDate = new Date(dateValue)
    let endDate = new Date(dateValue)
    
    // If using due date and there's a start date, use the range
    if (dateField.value === 'dueDate' && task.startDate) {
      const start = new Date(task.startDate)
      if (start < startDate) {
        return {
          ...task,
          startDate: start,
          endDate: startDate,
          allDay: true
        }
      }
    }
    
    // For tasks with estimated hours, calculate end time
    if (task.estimatedHours && task.estimatedHours > 0) {
      endDate = new Date(startDate.getTime() + (task.estimatedHours * 60 * 60 * 1000))
      return {
        ...task,
        startDate,
        endDate,
        allDay: false
      }
    }

    // Default to all-day event
    return {
      ...task,
      startDate,
      endDate: new Date(startDate.getTime() + (24 * 60 * 60 * 1000)),
      allDay: true
    }
  }).filter(Boolean)
})

function onDateFieldChanged(e: any) {
  dateField.value = e.value
}

function onViewModeChanged(e: any) {
  currentView.value = e.value
}

function onAppointmentClick(e: any) {
  const task = e.appointmentData as WbsTask
  selectedTask.value = task
  showTaskDetail.value = true
}

function onAppointmentDblClick(e: any) {
  e.cancel = true // Prevent default edit dialog
  const task = e.appointmentData as WbsTask
  selectedTask.value = task
  showTaskDetail.value = true
}

function onAppointmentAdded(e: any) {
  const appointmentData = e.appointmentData
  const newTask: WbsTask = {
    id: Date.now(), // Temporary ID
    name: appointmentData.name || 'New Task',
    description: appointmentData.description,
    status: 'Not Started',
    priority: 'Medium',
    assignee: appointmentData.assignee,
    startDate: appointmentData.startDate,
    dueDate: appointmentData.endDate || appointmentData.startDate,
    estimatedHours: appointmentData.allDay ? 8 : 
      Math.round((appointmentData.endDate - appointmentData.startDate) / (1000 * 60 * 60)),
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    wbsId: 0 // Should be set by parent
  }
  
  emit('taskCreated', newTask)
}

function onAppointmentUpdated(e: any) {
  const updatedData = e.appointmentData
  const updatedTask: WbsTask = {
    ...updatedData,
    updatedAt: new Date()
  }
  
  emit('taskUpdated', updatedTask)
}

function onAppointmentDeleted(e: any) {
  const taskId = e.appointmentData.id
  emit('taskDeleted', taskId)
}

function onCellClick(e: any) {
  if (e.cellData && !e.cellData.allDay) {
    quickAddDate.value = e.cellData.startDate
    showQuickAdd.value = true
  }
}

function onTaskUpdated(task: WbsTask) {
  emit('taskUpdated', task)
  selectedTask.value = task
}

function onTaskCreated(task: WbsTask) {
  emit('taskCreated', task)
  showQuickAdd.value = false
}


// Watch for current date changes to update scheduler
watch(currentDate, (newDate) => {
  debugger
  if (schedulerRef.value) { 
    schedulerRef.value.instance.option('currentDate', newDate)
  }
})
</script>

<style scoped lang="scss">
.wbs-calendar-view {
  height: 100%;
  position: relative;
  background: white;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;

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

.calendar-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 16px;
}


// Drawer positioning and content styling
.calendar-drawer {
  :deep(.dx-drawer-wrapper) {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    height: 100% !important;
    z-index: 1000 !important;
  }
  
  :deep(.dx-drawer-panel-content) {
    width: 500px !important;
    background: white !important;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
    border-left: 1px solid #e9ecef !important;
  }
  
  :deep(.dx-overlay-content) {
    width: 500px !important;
    background: white !important;
  }
}

.drawer-content-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  .task-detail-panel {
    width: 100%;
    height: 100%;
  }
}

:deep(.dx-scheduler) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .dx-scheduler-header-panel {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }

  .dx-scheduler-date-table-cell {
    border-color: #f1f3f4;
  }

  .dx-scheduler-appointment {
    border-radius: 4px;
  }
}
</style>
