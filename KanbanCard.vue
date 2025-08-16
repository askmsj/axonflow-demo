<template>
  <div
    class="kanban-card"
    :draggable="true"
    @dragstart="onDragStart"
    @click="onCardClick"
  >
    <!-- Priority Indicator -->
    <div class="priority-indicator" :class="`priority-${task.priority?.toLowerCase()}`"></div>

    <!-- Card Header -->
    <div class="card-header">
      <h4 class="task-title">{{ task.name }}</h4>
      <DxButton
        icon="more"
        styling-mode="text"
        class="card-menu"
        @click.stop="showMenu = !showMenu"
      />
    </div>

    <!-- Task Description -->
    <p v-if="task.description" class="task-description">
      {{ task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description }}
    </p>

    <!-- Task Meta Information -->
    <div class="task-meta">
      <!-- Assignee -->
      <div v-if="task.assignee" class="meta-item assignee">
        <div class="assignee-avatar">{{ getInitials(task.assignee) }}</div>
        <span class="assignee-name">{{ task.assignee }}</span>
      </div>

      <!-- Due Date -->
      <div v-if="task.dueDate" class="meta-item due-date" :class="getDueDateClass(task.dueDate)">
        <i class="dx-icon dx-icon-event"></i>
        <span>{{ formatDate(task.dueDate) }}</span>
      </div>

      <!-- Estimated Hours -->
      <div v-if="task.estimatedHours" class="meta-item hours">
        <i class="dx-icon dx-icon-clock"></i>
        <span>{{ task.estimatedHours }}h</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="task.progress !== undefined" class="task-progress">
      <div class="progress-label">
        <span>Progress</span>
        <span class="progress-value">{{ task.progress }}%</span>
      </div>
      <DxProgressBar
        :value="task.progress"
        :show-status="false"
        :height="6"
        :class="getProgressClass(task.progress)"
      />
    </div>

    <!-- Tags -->
    <div v-if="task.tags && task.tags.length > 0" class="task-tags">
      <span
        v-for="(tag, index) in task.tags.slice(0, 3)"
        :key="tag"
        class="tag-chip"
      >
        {{ tag }}
      </span>
      <span v-if="task.tags.length > 3" class="tag-more">
        +{{ task.tags.length - 3 }}
      </span>
    </div>

    <!-- Card Footer -->
    <div class="card-footer">
      <div class="task-id">#{{ task.id }}</div>
      <div class="card-actions">
        <DxButton
          icon="edit"
          styling-mode="text"
          :width="24"
          :height="24"
          title="Edit task"
          @click.stop="onEditClick"
        />
        <DxButton
          icon="trash"
          styling-mode="text"
          type="danger"
          :width="24"
          :height="24"
          title="Delete task"
          @click.stop="onDeleteClick"
        />
      </div>
    </div>

    <!-- Context Menu -->
    <div v-if="showMenu" class="context-menu" @click.stop>
      <div class="menu-item" @click="onEditClick">
        <i class="dx-icon dx-icon-edit"></i>
        Edit Task
      </div>
      <div class="menu-item" @click="onDuplicateClick">
        <i class="dx-icon dx-icon-copy"></i>
        Duplicate
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item danger" @click="onDeleteClick">
        <i class="dx-icon dx-icon-trash"></i>
        Delete
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DxButton, DxProgressBar } from 'devextreme-vue'
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
  dragStart: [task: WbsTask]
}>()

const showMenu = ref(false)

function onDragStart(e: DragEvent) {
  emit('dragStart', props.task)
  showMenu.value = false
}

function onCardClick() {
  showMenu.value = false
  emit('taskClicked', props.task)
}

function onEditClick() {
  showMenu.value = false
  emit('taskClicked', props.task)
}

function onDeleteClick() {
  showMenu.value = false
  emit('taskDeleted', props.task.id)
}

function onDuplicateClick() {
  showMenu.value = false
  const duplicatedTask = {
    ...props.task,
    id: Date.now(), // Temporary ID
    name: `${props.task.name} (Copy)`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  emit('taskUpdated', duplicatedTask)
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function getDueDateClass(dueDate: Date): string {
  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'due-soon'
  return 'due-normal'
}

function getProgressClass(progress: number): string {
  if (progress >= 80) return 'progress-high'
  if (progress >= 50) return 'progress-medium'
  if (progress >= 20) return 'progress-low'
  return 'progress-none'
}

// Close menu when clicking outside
document.addEventListener('click', () => {
  showMenu.value = false
})
</script>

<style scoped lang="scss">
.kanban-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-color: #007bff;
    transform: translateY(-1px);

    .card-actions {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
}

.priority-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 8px 8px 0 0;

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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  margin-top: 4px;

  .task-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.3;
    flex: 1;
    margin-right: 8px;
  }

  .card-menu {
    opacity: 0;
    transition: opacity 0.2s ease;
    flex-shrink: 0;

    .kanban-card:hover & {
      opacity: 1;
    }
  }
}

.task-description {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #6c757d;

    i {
      width: 12px;
      height: 12px;
    }

    &.assignee {
      .assignee-avatar {
        width: 16px;
        height: 16px;
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
        font-weight: 500;
      }
    }

    &.due-date {
      &.overdue {
        color: #dc3545;
        font-weight: 600;
      }

      &.due-soon {
        color: #fd7e14;
        font-weight: 600;
      }

      &.due-normal {
        color: #6c757d;
      }
    }
  }
}

.task-progress {
  margin-bottom: 10px;

  .progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 11px;
    color: #6c757d;

    .progress-value {
      font-weight: 600;
    }
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

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;

  .tag-chip {
    display: inline-block;
    padding: 2px 6px;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 500;
  }

  .tag-more {
    display: inline-block;
    padding: 2px 6px;
    background: #f8f9fa;
    color: #6c757d;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 500;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f8f9fa;

  .task-id {
    font-size: 10px;
    color: #6c757d;
    font-weight: 500;
  }

  .card-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

.context-menu {
  position: absolute;
  top: 32px;
  right: 8px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 140px;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 12px;
    color: #495057;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #f8f9fa;
    }

    &.danger {
      color: #dc3545;

      &:hover {
        background: #f8d7da;
      }
    }

    i {
      width: 12px;
      height: 12px;
    }
  }

  .menu-separator {
    height: 1px;
    background: #e9ecef;
    margin: 4px 0;
  }
}
</style>