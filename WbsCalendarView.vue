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
        <!-- Custom appointment template -->
        <template #appointmentTemplate="{ appointmentData }">
          <div class="custom-appointment" :class="getAppointmentClass(appointmentData)">
            <div class="appointment-header">
              <span class="appointment-title">{{ appointmentData.name }}</span>
              <div class="appointment-badges">
                <span v-if="appointmentData.priority" 
                      class="priority-badge" 
                      :class="`priority-${appointmentData.priority.toLowerCase()}`">
                  {{ appointmentData.priority }}
                </span>
                <span v-if="appointmentData.progress !== undefined" 
                      class="progress-badge">
                  {{ appointmentData.progress }}%
                </span>
              </div>
            </div>
            <div v-if="appointmentData.assignee" class="appointment-assignee">
              <div class="assignee-avatar">{{ getInitials(appointmentData.assignee) }}</div>
              <span class="assignee-name">{{ appointmentData.assignee }}</span>
            </div>
            <div v-if="appointmentData.description" class="appointment-description">
              {{ appointmentData.description.length > 50 ? 
                  appointmentData.description.substring(0, 50) + '...' : 
                  appointmentData.description }}
            </div>
          </div>
        </template>

        <!-- Custom appointment tooltip template -->
        <template #appointmentTooltipTemplate="{ appointmentData }">
          <div class="appointment-tooltip">
            <div class="tooltip-header">
              <h4>{{ appointmentData.name }}</h4>
              <span class="task-id">#{{ appointmentData.id }}</span>
            </div>
            <div class="tooltip-content">
              <div v-if="appointmentData.description" class="tooltip-field">
                <strong>Description:</strong>
                <p>{{ appointmentData.description }}</p>
              </div>
              <div class="tooltip-field">
                <strong>Status:</strong>
                <span class="status-badge" :class="`status-${appointmentData.status?.toLowerCase().replace(' ', '-')}`">
                  {{ appointmentData.status }}
                </span>
              </div>
              <div v-if="appointmentData.assignee" class="tooltip-field">
                <strong>Assignee:</strong>
                <span>{{ appointmentData.assignee }}</span>
              </div>
              <div v-if="appointmentData.estimatedHours" class="tooltip-field">
                <strong>Estimated Hours:</strong>
                <span>{{ appointmentData.estimatedHours }}h</span>
              </div>
              <div v-if="appointmentData.progress !== undefined" class="tooltip-field">
                <strong>Progress:</strong>
                <div class="progress-container">
                  <DxProgressBar
                    :value="appointmentData.progress"
                    :show-status="false"
                    :height="12"
                  />
                  <span class="progress-text">{{ appointmentData.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DxScheduler>
    </div>

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
  DxPopup,
  DxProgressBar
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

function getAppointmentClass(appointment: any): string {
  const classes = ['appointment-custom']
  
  if (appointment.status) {
    classes.push(`status-${appointment.status.toLowerCase().replace(' ', '-')}`)
  }
  
  if (appointment.priority) {
    classes.push(`priority-${appointment.priority.toLowerCase()}`)
  }
  
  return classes.join(' ')
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// Watch for current date changes to update scheduler
watch(currentDate, (newDate) => {
  if (schedulerRef.value) {
    schedulerRef.value.instance.option('currentDate', newDate)
  }
})
</script>

<style scoped lang="scss">
.wbs-calendar-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
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
  //flex: 1;
  //overflow: hidden;
  padding: 16px;
}

.custom-appointment {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  height: 100%;
  overflow: hidden;

  &.status-completed {
    background: rgba(40, 167, 69, 0.1);
    border-left: 3px solid #28a745;
  }

  &.status-in-progress {
    background: rgba(0, 123, 255, 0.1);
    border-left: 3px solid #007bff;
  }

  &.status-not-started {
    background: rgba(108, 117, 125, 0.1);
    border-left: 3px solid #6c757d;
  }

  &.status-on-hold {
    background: rgba(255, 193, 7, 0.1);
    border-left: 3px solid #ffc107;
  }

  .appointment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2px;

    .appointment-title {
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.2;
      flex: 1;
      margin-right: 4px;
    }

    .appointment-badges {
      display: flex;
      gap: 2px;
      flex-shrink: 0;

      .priority-badge, .progress-badge {
        padding: 1px 4px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 500;
      }

      .priority-badge {
        &.priority-high {
          background: #fd7e14;
          color: white;
        }

        &.priority-critical {
          background: #dc3545;
          color: white;
        }

        &.priority-medium {
          background: #ffc107;
          color: #212529;
        }

        &.priority-low {
          background: #28a745;
          color: white;
        }
      }

      .progress-badge {
        background: #e9ecef;
        color: #495057;
      }
    }
  }

  .appointment-assignee {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 2px;

    .assignee-avatar {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 600;
    }

    .assignee-name {
      font-size: 10px;
      color: #6c757d;
    }
  }

  .appointment-description {
    font-size: 10px;
    color: #6c757d;
    line-height: 1.2;
  }
}

.appointment-tooltip {
  max-width: 300px;

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e9ecef;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
    }

    .task-id {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
    }
  }

  .tooltip-content {
    .tooltip-field {
      margin-bottom: 8px;

      strong {
        display: block;
        font-size: 12px;
        color: #495057;
        margin-bottom: 2px;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #6c757d;
        line-height: 1.4;
      }

      .status-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 500;

        &.status-completed {
          background: #d4edda;
          color: #155724;
        }

        &.status-in-progress {
          background: #cce7ff;
          color: #0066cc;
        }

        &.status-not-started {
          background: #f8f9fa;
          color: #6c757d;
        }

        &.status-on-hold {
          background: #fff3cd;
          color: #856404;
        }
      }

      .progress-container {
        display: flex;
        align-items: center;
        gap: 8px;

        .progress-text {
          font-size: 10px;
          font-weight: 500;
          color: #495057;
        }
      }
    }
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
