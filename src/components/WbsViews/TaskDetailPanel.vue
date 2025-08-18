<template>
  <div class="task-detail-panel">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="header-content">
        <h3 class="task-title">{{ task?.name || 'Untitled Task' }}</h3>
        <span class="task-id">#{{ task?.id || 'N/A' }}</span>
      </div>
      <DxButton
        icon="close"
        styling-mode="text"
        @click="onClose"
      />
    </div>

    <!-- Panel Content -->
    <div class="panel-content">
      <DxScrollView direction="vertical" :show-scrollbar="'onHover'">
        <!-- Basic Information Section -->
        <div class="detail-section">
          <h4 class="section-title">Basic Information</h4>
          
          <div class="field-group">
            <label class="field-label">Task Name</label>
            <DxTextBox
              v-model:value="editableTask.name"
              placeholder="Enter task name..."
              @value-changed="(e) => markAsChanged(e)"
            />
          </div>

          <div class="field-group">
            <label class="field-label">Description</label>
            <DxTextArea
              v-model:value="editableTask.description"
              placeholder="Enter task description..."
              :height="80"
              @value-changed="(e) => markAsChanged(e)"
            />
          </div>
        </div>

        <!-- Status and Priority Section -->
        <div class="detail-section">
          <h4 class="section-title">Status & Priority</h4>
          
          <div class="field-row">
            <div class="field-group half">
              <label class="field-label">Status</label>
              <DxSelectBox
                v-model:value="editableTask.status"
                :data-source="statusOptions"
                value-expr="value"
                display-expr="text"
                @value-changed="(e) => markAsChanged(e)"
              />
            </div>
            
            <div class="field-group half">
              <label class="field-label">Priority</label>
              <DxSelectBox
                v-model:value="editableTask.priority"
                :data-source="priorityOptions"
                value-expr="value"
                display-expr="text"
                @value-changed="(e) => markAsChanged(e)"
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Progress</label>
            <div class="progress-field">
              <DxSlider
                v-model:value="editableTask.progress"
                :min="0"
                :max="100"
                :step="5"
                :tooltip="{ enabled: true, position: 'top' }"
                @value-changed="(e) => markAsChanged(e)"
              />
              <span class="progress-value">{{ editableTask.progress }}%</span>
            </div>
          </div>
        </div>

        <!-- Assignment Section -->
        <div class="detail-section">
          <h4 class="section-title">Assignment</h4>
          
          <div class="field-group">
            <label class="field-label">Assignee</label>
            <DxSelectBox
              v-model:value="editableTask.assignee"
              :data-source="assigneeOptions"
              value-expr="value"
              display-expr="text"
              placeholder="Select assignee..."
              :search-enabled="true"
              :accept-custom-value="true"
              @value-changed="(e) => markAsChanged(e)"
            />
          </div>
        </div>

        <!-- Timeline Section -->
        <div class="detail-section">
          <h4 class="section-title">Timeline</h4>
          
          <div class="field-row">
            <div class="field-group half">
              <label class="field-label">Start Date</label>
              <DxDateBox
                v-model:value="editableTask.startDate"
                type="date"
                placeholder="Select start date..."
                @value-changed="(e) => markAsChanged(e)"
              />
            </div>
            
            <div class="field-group half">
              <label class="field-label">Due Date</label>
              <DxDateBox
                v-model:value="editableTask.dueDate"
                type="date"
                placeholder="Select due date..."
                @value-changed="(e) => markAsChanged(e)"
              />
            </div>
          </div>

          <div class="field-row">
            <div class="field-group half">
              <label class="field-label">Estimated Hours</label>
              <DxNumberBox
                v-model:value="editableTask.estimatedHours"
                placeholder="0"
                :min="0"
                :max="1000"
                :step="0.5"
                format="decimal"
                @value-changed="(e) => markAsChanged(e)"
              />
            </div>
            
            <div class="field-group half">
              <label class="field-label">Actual Hours</label>
              <DxNumberBox
                v-model:value="editableTask.actualHours"
                placeholder="0"
                :min="0"
                :max="1000"
                :step="0.5"
                format="decimal"
                @value-changed="(e) => markAsChanged(e)"
              />
            </div>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="detail-section">
          <h4 class="section-title">Tags</h4>
          
          <div class="field-group">
            <label class="field-label">Tags</label>
            <DxTagBox
              v-model:value="editableTask.tags"
              :data-source="availableTags"
              placeholder="Add tags..."
              :accept-custom-value="true"
              :search-enabled="true"
              :multi-tag="false"
              @value-changed="(e) => markAsChanged(e)"
            />
          </div>
        </div>

        <!-- Custom Fields Section -->
        <div v-if="customFields && customFields.length > 0" class="detail-section">
          <h4 class="section-title">Custom Fields</h4>
          
          <div
            v-for="field in customFields"
            :key="field.id"
            class="field-group"
          >
            <DynamicField
              :column="field"
              :value="editableTask[field.id]"
              @update="(value) => updateCustomField(field.id, value)"
            />
          </div>
        </div>

        <!-- Metadata Section -->
        <div class="detail-section">
          <h4 class="section-title">Metadata</h4>
          
          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="metadata-label">Created:</span>
              <span class="metadata-value">{{ formatDateTime(task?.createdAt) }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Updated:</span>
              <span class="metadata-value">{{ formatDateTime(task?.updatedAt) }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Task ID:</span>
              <span class="metadata-value">#{{ task?.id || 'N/A' }}</span>
            </div>
            <div v-if="task?.parentId" class="metadata-item">
              <span class="metadata-label">Parent Task:</span>
              <span class="metadata-value">#{{ task.parentId }}</span>
            </div>
          </div>
        </div>
      </DxScrollView>
    </div>

    <!-- Panel Footer -->
    <div class="panel-footer">
      <div class="footer-actions">
        <DxButton
          text="Cancel"
          @click="onCancel"
        />
        <DxButton
          text="Save Changes"
          type="success"
          :disabled="!hasChanges"
          @click="onSave"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  DxTextBox,
  DxTextArea,
  DxSelectBox,
  DxDateBox,
  DxNumberBox,
  DxSlider,
  DxTagBox,
  DxButton,
  DxScrollView
} from 'devextreme-vue'
import DynamicField from './DynamicField.vue'
import type { WbsTask, TaskColumn } from '@/types/wbs-task'

interface Props {
  task: WbsTask
  columns?: TaskColumn[]
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => []
})

const emit = defineEmits<{
  taskUpdated: [task: WbsTask]
  close: []
}>()

const editableTask = ref<WbsTask>({ ...props.task })
const hasChanges = ref(false)

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

const customFields = computed(() => {
  const systemFields = ['name', 'description', 'status', 'priority', 'assignee', 'startDate', 'dueDate', 'estimatedHours', 'actualHours', 'progress', 'tags', 'id', 'createdAt', 'updatedAt', 'wbsId', 'parentId', 'order']
  // Ensure props.columns exists and is an array before filtering
  if (!props.columns || !Array.isArray(props.columns)) {
    return []
  }
  return props.columns.filter(col => 
    col.visible && 
    !systemFields.includes(col.id) &&
    col.editable !== false
  )
})

function markAsChanged(e?: any) {
  hasChanges.value = true
}

function updateCustomField(fieldId: string, value: any) {
  editableTask.value[fieldId as keyof WbsTask] = value
  markAsChanged()
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  } catch (error) {
    return 'Invalid Date'
  }
}

function onSave() {
  const updatedTask = {
    ...editableTask.value,
    updatedAt: new Date()
  }
  
  emit('taskUpdated', updatedTask)
  hasChanges.value = false
}

function onCancel() {
  if (hasChanges.value) {
    if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      editableTask.value = { ...props.task }
      hasChanges.value = false
      emit('close')
    }
  } else {
    emit('close')
  }
}

function onClose() {
  onCancel()
}

// Watch for task changes from parent
watch(() => props.task, (newTask) => {
  if (!hasChanges.value) {
    editableTask.value = { ...newTask }
  }
}, { deep: true })

onMounted(() => {
  hasChanges.value = false
})
</script>

<style scoped lang="scss">
.task-detail-panel {
  height: 100%;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;

  .header-content {
    flex: 1;

    .task-title {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.3;
    }

    .task-id {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
    }
  }
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.detail-section {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f4;

  &:last-child {
    border-bottom: none;
  }

  .section-title {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: #495057;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.field-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &.half {
    width: calc(50% - 8px);
  }

  .field-label {
    display: block;
    font-weight: 500;
    color: #495057;
    margin-bottom: 6px;
    font-size: 13px;
  }
}

.field-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.progress-field {
  display: flex;
  align-items: center;
  gap: 12px;

  .progress-value {
    font-size: 13px;
    font-weight: 500;
    color: #495057;
    min-width: 35px;
  }
}

.metadata-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .metadata-item {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .metadata-label {
      font-size: 11px;
      font-weight: 500;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metadata-value {
      font-size: 13px;
      color: #495057;
      font-weight: 500;
    }
  }
}

.panel-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;

  .footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

:deep(.dx-textbox),
:deep(.dx-textarea),
:deep(.dx-selectbox),
:deep(.dx-datebox),
:deep(.dx-numberbox),
:deep(.dx-tagbox) {
  .dx-texteditor-input {
    font-size: 13px;
  }
}

:deep(.dx-slider) {
  .dx-slider-handle {
    background: #007bff;
    border-color: #007bff;
  }

  .dx-slider-range {
    background: #007bff;
  }
}
</style>