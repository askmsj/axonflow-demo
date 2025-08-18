<template>
  <div class="task-list-item" @click="onTaskClick">
    <div class="task-main">
      <!-- Task Priority Indicator -->
      <div class="priority-indicator" :class="`priority-${task.priority?.toLowerCase()}`"></div>

      <!-- Task Content -->
      <div class="task-content">
        <!-- Task Header -->
        <div class="task-header">
          <h4 class="task-title">{{ task.name }}</h4>
          <div class="task-meta">
            <span class="task-id">#{{ task.id }}</span>
            <div class="status-badge" :class="`status-${task.status?.toLowerCase().replace(' ', '-')}`">
              {{ task.status }}
            </div>
          </div>
        </div>

        <!-- Task Description -->
        <p v-if="task.description" class="task-description">
          {{ task.description }}
        </p>

        <!-- Task Details Grid -->
        <div class="task-details">
          <div v-for="column in displayColumns" :key="column.id" class="detail-item">
            <span class="detail-label">{{ column.name }}:</span>
            <span class="detail-value">
              <component
                :is="getFieldComponent(column.type)"
                :value="task[column.id]"
                :column="column"
                @update="(value) => updateField(column.id, value)"
              />
            </span>
          </div>
        </div>

        <!-- Task Tags -->
        <div v-if="task.tags && task.tags.length > 0" class="task-tags">
          <span v-for="tag in task.tags" :key="tag" class="tag-chip">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Task Actions -->
      <div class="task-actions">
        <DxButton
          icon="edit"
          styling-mode="text"
          title="Edit task"
          @click="onEditClick"
        />
        <DxButton
          icon="trash"
          styling-mode="text"
          type="danger"
          title="Delete task"
          @click="onDeleteClick"
        />
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="task.progress !== undefined" class="task-progress">
      <DxProgressBar
        :value="task.progress"
        :show-status="false"
        :height="4"
        :class="getProgressClass(task.progress)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DxButton, DxProgressBar } from 'devextreme-vue'
import FieldRenderer from './FieldRenderer.vue'
import type { WbsTask, TaskColumn } from '@/types/wbs-task'

interface Props {
  task: WbsTask
  columns: TaskColumn[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  taskUpdated: [task: WbsTask]
  taskDeleted: [taskId: number]
  taskClicked: [task: WbsTask]
}>()

const displayColumns = computed(() => {
  const excludeFromDetails = ['name', 'description', 'status', 'tags', 'progress']
  return props.columns.filter(col => 
    col.visible && 
    !excludeFromDetails.includes(col.id) &&
    props.task[col.id] !== undefined &&
    props.task[col.id] !== null &&
    props.task[col.id] !== ''
  )
})

function getFieldComponent(type: string) {
  return FieldRenderer
}

function updateField(fieldId: string, value: any) {
  const updatedTask = { ...props.task, [fieldId]: value, updatedAt: new Date() }
  emit('taskUpdated', updatedTask)
}

function getProgressClass(progress: number): string {
  if (progress >= 80) return 'progress-high'
  if (progress >= 50) return 'progress-medium'
  if (progress >= 20) return 'progress-low'
  return 'progress-none'
}

function onTaskClick() {
  emit('taskClicked', props.task)
}

function onEditClick(e?: any) {
  // Prevent event bubbling to parent task click
  if (e && e.event && e.event.stopPropagation) {
    e.event.stopPropagation()
  }
  emit('taskClicked', props.task)
}

function onDeleteClick(e?: any) {
  // Prevent event bubbling to parent task click
  if (e && e.event && e.event.stopPropagation) {
    e.event.stopPropagation()
  }
  emit('taskDeleted', props.task.id)
}
</script>

<style scoped lang="scss">
.task-list-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 8px 16px;
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #007bff;
  }

  &:last-child {
    margin-bottom: 16px;
  }
}

.task-main {
  display: flex;
  padding: 16px;
  gap: 12px;
}

.priority-indicator {
  width: 4px;
  flex-shrink: 0;
  border-radius: 2px;

  &.priority-low {
    background: #28a745;
  }

  &.priority-medium {
    background: #ffc107;
  }

  &.priority-high {
    background: #fd7e14;
  }

  &.priority-critical {
    background: #dc3545;
  }
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;

  .task-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.3;
  }

  .task-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .task-id {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
    }
  }
}

.task-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px 16px;
  margin-bottom: 12px;

  .detail-item {
    display: flex;
    align-items: center;
    font-size: 13px;

    .detail-label {
      font-weight: 500;
      color: #495057;
      margin-right: 6px;
      min-width: 80px;
    }

    .detail-value {
      color: #6c757d;
      flex: 1;
    }
  }
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .tag-chip {
    display: inline-block;
    padding: 2px 8px;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  .task-list-item:hover & {
    opacity: 1;
  }
}

.task-progress {
  padding: 0 16px 8px 32px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;

  &.status-not-started {
    background: #f8f9fa;
    color: #6c757d;
  }

  &.status-in-progress {
    background: #cce7ff;
    color: #0066cc;
  }

  &.status-completed {
    background: #d4edda;
    color: #155724;
  }

  &.status-on-hold {
    background: #fff3cd;
    color: #856404;
  }

  &.status-cancelled {
    background: #f8d7da;
    color: #721c24;
  }
}

:deep(.progress-high .dx-progressbar-status) {
  background: #28a745;
}

:deep(.progress-medium .dx-progressbar-status) {
  background: #ffc107;
}

:deep(.progress-low .dx-progressbar-status) {
  background: #fd7e14;
}

:deep(.progress-none .dx-progressbar-status) {
  background: #dc3545;
}
</style>