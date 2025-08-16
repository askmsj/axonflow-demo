<template>
  <div class="add-task-form">
    <div class="form-content">
      <!-- Required Fields Section -->
      <div class="form-section">
        <h5>Task Information</h5>
        
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
            :height="80"
          />
        </div>
      </div>

      <!-- Basic Properties -->
      <div class="form-section">
        <h5>Properties</h5>
        
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
      </div>

      <!-- Dates and Time -->
      <div class="form-section">
        <h5>Timeline</h5>
        
        <div class="form-row-group">
          <div class="form-row half">
            <DxDateBox
              v-model:value="formData.startDate"
              label="Start Date"
              type="date"
              placeholder="Select start date..."
            />
          </div>
          
          <div class="form-row half">
            <DxDateBox
              v-model:value="formData.dueDate"
              label="Due Date"
              type="date"
              placeholder="Select due date..."
            />
          </div>
        </div>

        <div class="form-row-group">
          <div class="form-row half">
            <DxNumberBox
              v-model:value="formData.estimatedHours"
              label="Estimated Hours"
              placeholder="0"
              :min="0"
              :max="1000"
              :step="0.5"
              format="decimal"
            />
          </div>
          
          <div class="form-row half">
            <DxSlider
              v-model:value="formData.progress"
              label="Progress %"
              :min="0"
              :max="100"
              :step="5"
              :tooltip="{ enabled: true, position: 'top' }"
            />
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div class="form-section">
        <h5>Organization</h5>
        
        <div class="form-row">
          <DxTagBox
            v-model:value="formData.tags"
            :data-source="availableTags"
            label="Tags"
            placeholder="Add tags..."
            :accept-custom-value="true"
            :search-enabled="true"
            :multi-tag="false"
          />
        </div>
      </div>

      <!-- Dynamic Fields -->
      <div v-if="customColumns.length > 0" class="form-section">
        <h5>Additional Fields</h5>
        
        <div
          v-for="column in customColumns"
          :key="column.id"
          class="form-row"
        >
          <DynamicField
            :column="column"
            :value="formData[column.id]"
            @update="(value) => updateField(column.id, value)"
          />
        </div>
      </div>

      <!-- Task Template -->
      <div class="form-section">
        <h5>Quick Setup</h5>
        
        <div class="form-row">
          <DxSelectBox
            :value="null"
            :data-source="taskTemplates"
            label="Apply Template"
            value-expr="id"
            display-expr="name"
            placeholder="Choose a template..."
            @value-changed="applyTemplate"
          />
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <div class="action-buttons">
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
        <DxButton
          text="Create & Add Another"
          type="success"
          styling-mode="outlined"
          :disabled="!isValid"
          @click="onSubmitAndContinue"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  DxTextBox,
  DxTextArea,
  DxSelectBox,
  DxDateBox,
  DxNumberBox,
  DxSlider,
  DxTagBox,
  DxButton
} from 'devextreme-vue'
import DynamicField from './DynamicField.vue'
import type { WbsTask, TaskColumn } from '@/types/wbs-task'

interface Props {
  columns: TaskColumn[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  taskCreated: [task: WbsTask]
  cancel: []
}>()

const formData = ref<Partial<WbsTask>>({
  name: '',
  description: '',
  status: 'Not Started',
  priority: 'Medium',
  assignee: '',
  startDate: undefined,
  dueDate: undefined,
  estimatedHours: undefined,
  progress: 0,
  tags: []
})

const validation = ref({
  name: ''
})

const statusOptions = [
  { value: 'Not Started', text: 'Not Started' },
  { value: 'In Progress', text: 'In Progress' },
  { value: 'Completed', text: 'Completed' },
  { value: 'On Hold', text: 'On Hold' },
  { value: 'Cancelled', text: 'Cancelled' }
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

const availableTags = ref([
  'frontend', 'backend', 'database', 'security', 'vue', 'api', 
  'testing', 'documentation', 'design', 'review', 'urgent', 'bug'
])

const taskTemplates = [
  {
    id: 'development',
    name: 'Development Task',
    data: {
      status: 'Not Started',
      priority: 'Medium',
      estimatedHours: 8,
      tags: ['development']
    }
  },
  {
    id: 'bug-fix',
    name: 'Bug Fix',
    data: {
      status: 'Not Started',
      priority: 'High',
      estimatedHours: 4,
      tags: ['bug', 'urgent']
    }
  },
  {
    id: 'research',
    name: 'Research Task',
    data: {
      status: 'Not Started',
      priority: 'Low',
      estimatedHours: 16,
      tags: ['research', 'documentation']
    }
  },
  {
    id: 'review',
    name: 'Code Review',
    data: {
      status: 'Not Started',
      priority: 'Medium',
      estimatedHours: 2,
      tags: ['review']
    }
  }
]

const customColumns = computed(() => {
  const systemFields = ['name', 'description', 'status', 'priority', 'assignee', 'startDate', 'dueDate', 'estimatedHours', 'progress', 'tags', 'id', 'createdAt', 'updatedAt', 'wbsId', 'parentId', 'order']
  return props.columns.filter(col => 
    col.visible && 
    !systemFields.includes(col.id) &&
    col.editable !== false
  )
})

const isValid = computed(() => {
  return formData.value.name && formData.value.name.trim().length > 0
})

function updateField(fieldId: string, value: any) {
  formData.value[fieldId as keyof WbsTask] = value
}

function validateForm() {
  validation.value.name = ''
  
  if (!formData.value.name?.trim()) {
    validation.value.name = 'Task name is required'
    return false
  }
  
  return true
}

function applyTemplate(e: any) {
  if (!e.value) return
  
  const template = taskTemplates.find(t => t.id === e.value)
  if (template) {
    Object.assign(formData.value, template.data)
  }
}

function createTask(): WbsTask {
  const now = new Date()
  
  return {
    id: Date.now(), // Temporary ID - should be assigned by backend
    name: formData.value.name!,
    description: formData.value.description || '',
    status: formData.value.status || 'Not Started',
    priority: formData.value.priority || 'Medium',
    assignee: formData.value.assignee,
    startDate: formData.value.startDate,
    dueDate: formData.value.dueDate,
    estimatedHours: formData.value.estimatedHours,
    progress: formData.value.progress || 0,
    tags: formData.value.tags || [],
    createdAt: now,
    updatedAt: now,
    wbsId: 0, // Should be set by parent component
    parentId: formData.value.parentId,
    order: formData.value.order || 0,
    ...getCustomFieldValues()
  }
}

function getCustomFieldValues() {
  const customValues: Record<string, any> = {}
  customColumns.value.forEach(column => {
    if (formData.value[column.id as keyof WbsTask] !== undefined) {
      customValues[column.id] = formData.value[column.id as keyof WbsTask]
    }
  })
  return customValues
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    assignee: '',
    startDate: undefined,
    dueDate: undefined,
    estimatedHours: undefined,
    progress: 0,
    tags: []
  }
  
  validation.value.name = ''
}

function onSubmit() {
  if (!validateForm()) return
  
  const task = createTask()
  emit('taskCreated', task)
}

function onSubmitAndContinue() {
  if (!validateForm()) return
  
  const task = createTask()
  emit('taskCreated', task)
  
  // Keep some fields for next task
  const keepFields = ['status', 'priority', 'assignee', 'tags']
  const keepValues: Partial<WbsTask> = {}
  keepFields.forEach(field => {
    keepValues[field as keyof WbsTask] = formData.value[field as keyof WbsTask]
  })
  
  resetForm()
  Object.assign(formData.value, keepValues)
}

function onCancel() {
  emit('cancel')
}

onMounted(() => {
  // Auto-focus on task name field
  setTimeout(() => {
    const nameInput = document.querySelector('.add-task-form input[placeholder="Enter task name..."]') as HTMLElement
    nameInput?.focus()
  }, 100)
})
</script>

<style scoped lang="scss">
.add-task-form {
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
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  h5 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: #495057;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

.form-actions {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    align-items: center;
  }
}

:deep(.dx-textbox),
:deep(.dx-textarea),
:deep(.dx-selectbox),
:deep(.dx-datebox),
:deep(.dx-numberbox),
:deep(.dx-tagbox) {
  .dx-texteditor-label {
    font-weight: 500;
    color: #495057;
    margin-bottom: 4px;
  }
}

:deep(.dx-slider) {
  .dx-slider-label {
    font-weight: 500;
    color: #495057;
    margin-bottom: 8px;
    display: block;
  }
}

:deep(.dx-textbox.dx-invalid),
:deep(.dx-textarea.dx-invalid) {
  .dx-texteditor-input {
    border-color: #dc3545;
  }
}

.progress-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;

  .progress-value {
    font-size: 12px;
    font-weight: 500;
    color: #495057;
    min-width: 30px;
  }
}
</style>