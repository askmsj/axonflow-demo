<template>
  <div class="quick-add-task-form">
    <div class="form-content">
      <!-- Quick Task Information -->
      <div class="form-section">
        <div class="form-row">
          <DxTextBox
            v-model:value="formData.name"
            label="Task Name *"
            placeholder="Enter task name..."
            :is-valid="!validation.name"
            :validation-message="validation.name"
          />
        </div>

        <div class="form-row">
          <DxTextArea
            v-model:value="formData.description"
            label="Description"
            placeholder="Enter task description..."
            :height="60"
          />
        </div>
      </div>

      <!-- Quick Properties -->
      <div class="form-section">
        <div class="form-row-group">
          <div class="form-row half">
            <DxSelectBox
              v-model:value="formData.status"
              :data-source="statusOptions"
              label="Status"
              value-expr="value"
              display-expr="text"
            />
          </div>
          
          <div class="form-row half">
            <DxSelectBox
              v-model:value="formData.priority"
              :data-source="priorityOptions"
              label="Priority"
              value-expr="value"
              display-expr="text"
            />
          </div>
        </div>

        <div class="form-row">
          <DxSelectBox
            v-model:value="formData.assignee"
            :data-source="assigneeOptions"
            label="Assignee"
            value-expr="value"
            display-expr="text"
            placeholder="Select assignee..."
            :search-enabled="true"
            :accept-custom-value="true"
          />
        </div>

        <div class="form-row-group">
          <div class="form-row half">
            <DxDateBox
              v-model:value="formData.dueDate"
              label="Due Date"
              type="date"
              placeholder="Select due date..."
            />
          </div>
          
          <div class="form-row half">
            <DxNumberBox
              v-model:value="formData.estimatedHours"
              label="Est. Hours"
              placeholder="0"
              :min="0"
              :max="1000"
              :step="0.5"
              format="decimal"
            />
          </div>
        </div>
      </div>

      <!-- Date Context (if provided) -->
      <div v-if="initialDate" class="date-context">
        <div class="context-info">
          <i class="dx-icon dx-icon-event"></i>
          <span>Creating task for {{ formatDate(initialDate) }}</span>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <DxButton
        text="Cancel"
        @click="onCancel"
      />
      <DxButton
        text="Create Task"
        type="success"
        :disabled="!isValid"
        @click="onSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  DxTextBox,
  DxTextArea,
  DxSelectBox,
  DxDateBox,
  DxNumberBox,
  DxButton
} from 'devextreme-vue'
import type { WbsTask } from '@/types/wbs-task'

interface Props {
  initialDate?: Date | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  taskCreated: [task: WbsTask]
  cancel: []
}>()

const formData = ref({
  name: '',
  description: '',
  status: 'Not Started',
  priority: 'Medium',
  assignee: '',
  dueDate: props.initialDate || undefined,
  estimatedHours: undefined as number | undefined
})

const validation = ref({
  name: ''
})

const statusOptions = [
  { value: 'Not Started', text: 'Not Started' },
  { value: 'In Progress', text: 'In Progress' },
  { value: 'Completed', text: 'Completed' },
  { value: 'On Hold', text: 'On Hold' }
]

const priorityOptions = [
  { value: 'Low', text: 'Low' },
  { value: 'Medium', text: 'Medium' },
  { value: 'High', text: 'High' },
  { value: 'Critical', text: 'Critical' }
]

const assigneeOptions = ref([
  { value: 'John Doe', text: 'John Doe' },
  { value: 'Jane Smith', text: 'Jane Smith' },
  { value: 'Mike Johnson', text: 'Mike Johnson' },
  { value: 'Sarah Wilson', text: 'Sarah Wilson' },
  { value: 'David Brown', text: 'David Brown' },
  { value: 'Lisa Garcia', text: 'Lisa Garcia' }
])

const isValid = computed(() => {
  return formData.value.name && formData.value.name.trim().length > 0
})

function validateForm() {
  validation.value.name = ''
  
  if (!formData.value.name?.trim()) {
    validation.value.name = 'Task name is required'
    return false
  }
  
  return true
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

function createTask(): WbsTask {
  const now = new Date()
  
  return {
    id: Date.now(), // Temporary ID
    name: formData.value.name,
    description: formData.value.description || '',
    status: formData.value.status,
    priority: formData.value.priority,
    assignee: formData.value.assignee,
    startDate: props.initialDate || undefined,
    dueDate: formData.value.dueDate,
    estimatedHours: formData.value.estimatedHours,
    progress: 0,
    tags: [],
    createdAt: now,
    updatedAt: now,
    wbsId: 0, // Should be set by parent
    order: 0
  }
}

function onSubmit() {
  if (!validateForm()) return
  
  const task = createTask()
  emit('taskCreated', task)
}

function onCancel() {
  emit('cancel')
}

// Auto-focus on task name field
onMounted(() => {
  setTimeout(() => {
    const nameInput = document.querySelector('.quick-add-task-form input[placeholder="Enter task name..."]') as HTMLElement
    nameInput?.focus()
  }, 100)
})

// Watch for validation
watch(() => formData.value.name, () => {
  if (validation.value.name) {
    validateForm()
  }
})
</script>

<style scoped lang="scss">
.quick-add-task-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-row {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &.half {
    width: calc(50% - 8px);
  }
}

.form-row-group {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.date-context {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 16px;

  .context-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1565c0;
    font-size: 13px;
    font-weight: 500;

    i {
      font-size: 16px;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

:deep(.dx-textbox),
:deep(.dx-textarea),
:deep(.dx-selectbox),
:deep(.dx-datebox),
:deep(.dx-numberbox) {
  .dx-texteditor-label {
    font-weight: 500;
    color: #495057;
    font-size: 13px;
  }

  .dx-texteditor-input {
    font-size: 13px;
  }
}

:deep(.dx-textbox.dx-invalid),
:deep(.dx-textarea.dx-invalid) {
  .dx-texteditor-input {
    border-color: #dc3545;
  }
}
</style>