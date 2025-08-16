<template>
  <div class="column-editor">
    <div class="editor-content">
      <!-- Basic Information -->
      <div class="form-section">
        <h5>Basic Information</h5>
        
        <div class="form-row">
          <DxTextBox
            v-model:value="formData.name"
            label="Column Name"
            placeholder="Enter column name..."
            :is-valid="!validation.name"
            :validation-message="validation.name"
          />
        </div>

        <div class="form-row">
          <DxTextBox
            v-model:value="formData.id"
            label="Field ID"
            placeholder="Enter field ID (camelCase)..."
            :is-valid="!validation.id"
            :validation-message="validation.id"
            :read-only="!!column"
          />
        </div>

        <div class="form-row">
          <DxSelectBox
            v-model:value="formData.type"
            :data-source="columnTypes"
            value-expr="value"
            display-expr="text"
            label="Data Type"
            @value-changed="onTypeChanged"
          />
        </div>
      </div>

      <!-- Display Settings -->
      <div class="form-section">
        <h5>Display Settings</h5>
        
        <div class="form-row">
          <DxNumberBox
            v-model:value="formData.width"
            label="Width (pixels)"
            placeholder="Auto"
            :min="50"
            :max="800"
            :show-spin-buttons="true"
          />
        </div>

        <div class="form-row checkbox-row">
          <DxCheckBox
            v-model:value="formData.visible"
            text="Visible by default"
          />
        </div>

        <div class="form-row checkbox-row">
          <DxCheckBox
            v-model:value="formData.required"
            text="Required field"
            :disabled="isSystemField"
          />
        </div>
      </div>

      <!-- Behavior Settings -->
      <div class="form-section">
        <h5>Behavior Settings</h5>
        
        <div class="form-row checkbox-row">
          <DxCheckBox
            v-model:value="formData.editable"
            text="Allow editing"
            :value="formData.editable !== false"
          />
        </div>

        <div class="form-row checkbox-row">
          <DxCheckBox
            v-model:value="formData.sortable"
            text="Allow sorting"
            :value="formData.sortable !== false"
          />
        </div>

        <div class="form-row checkbox-row">
          <DxCheckBox
            v-model:value="formData.filterable"
            text="Allow filtering"
            :value="formData.filterable !== false"
          />
        </div>
      </div>

      <!-- Type-specific Settings -->
      <div v-if="formData.type === 'select'" class="form-section">
        <h5>Select Options</h5>
        
        <div class="form-row">
          <DxTagBox
            v-model:value="formData.options"
            :accept-custom-value="true"
            placeholder="Add options..."
            label="Available Options"
            :search-enabled="false"
            :show-selection-controls="true"
          />
        </div>
      </div>

      <div v-if="formData.type === 'number' || formData.type === 'currency'" class="form-section">
        <h5>Number Settings</h5>
        
        <div class="form-row">
          <DxNumberBox
            v-model:value="formData.min"
            label="Minimum Value"
            placeholder="No limit"
          />
        </div>

        <div class="form-row">
          <DxNumberBox
            v-model:value="formData.max"
            label="Maximum Value"
            placeholder="No limit"
          />
        </div>
      </div>

      <div v-if="formData.type === 'date' || formData.type === 'datetime' || formData.type === 'number' || formData.type === 'currency'" class="form-section">
        <h5>Format Settings</h5>
        
        <div class="form-row">
          <DxSelectBox
            v-model:value="formData.format"
            :data-source="formatOptions"
            value-expr="value"
            display-expr="text"
            label="Display Format"
            placeholder="Default format"
          />
        </div>
      </div>

      <!-- Preview -->
      <div class="form-section">
        <h5>Preview</h5>
        <div class="column-preview">
          <div class="preview-header">
            <span class="preview-name">{{ formData.name || 'Column Name' }}</span>
            <span class="preview-type">{{ getTypeDisplayName(formData.type) }}</span>
          </div>
          <div class="preview-sample">
            Sample: {{ getSampleValue() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="editor-actions">
      <DxButton
        text="Cancel"
        @click="onCancel"
      />
      <DxButton
        text="Save Column"
        type="success"
        :disabled="!isValid"
        @click="onSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  DxTextBox,
  DxSelectBox,
  DxNumberBox,
  DxCheckBox,
  DxTagBox,
  DxButton
} from 'devextreme-vue'
import type { TaskColumn } from '@/types/wbs-task'

interface Props {
  column?: TaskColumn | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [column: TaskColumn]
  cancel: []
}>()

const formData = ref<Partial<TaskColumn>>({
  id: '',
  name: '',
  type: 'text',
  visible: true,
  width: undefined,
  required: false,
  editable: true,
  sortable: true,
  filterable: true,
  options: [],
  min: undefined,
  max: undefined,
  format: undefined
})

const validation = ref({
  name: '',
  id: ''
})

const columnTypes = [
  { value: 'text', text: 'Text' },
  { value: 'number', text: 'Number' },
  { value: 'date', text: 'Date' },
  { value: 'datetime', text: 'Date & Time' },
  { value: 'select', text: 'Select (Dropdown)' },
  { value: 'tags', text: 'Tags' },
  { value: 'boolean', text: 'True/False' },
  { value: 'currency', text: 'Currency' }
]

const systemFields = ['id', 'name', 'createdAt', 'updatedAt']

const isSystemField = computed(() => 
  systemFields.includes(formData.value.id || '')
)

const formatOptions = computed(() => {
  switch (formData.value.type) {
    case 'date':
      return [
        { value: 'dd/MM/yyyy', text: 'DD/MM/YYYY' },
        { value: 'MM/dd/yyyy', text: 'MM/DD/YYYY' },
        { value: 'yyyy-MM-dd', text: 'YYYY-MM-DD' },
        { value: 'dd MMM yyyy', text: 'DD MMM YYYY' }
      ]
    case 'datetime':
      return [
        { value: 'dd/MM/yyyy HH:mm', text: 'DD/MM/YYYY HH:MM' },
        { value: 'MM/dd/yyyy HH:mm', text: 'MM/DD/YYYY HH:MM' },
        { value: 'yyyy-MM-dd HH:mm', text: 'YYYY-MM-DD HH:MM' },
        { value: 'dd MMM yyyy HH:mm', text: 'DD MMM YYYY HH:MM' }
      ]
    case 'number':
      return [
        { value: 'decimal', text: 'Decimal (1.23)' },
        { value: 'integer', text: 'Integer (123)' },
        { value: 'percent', text: 'Percentage (12.3%)' }
      ]
    case 'currency':
      return [
        { value: 'currency', text: 'Currency ($1.23)' },
        { value: 'currency EUR', text: 'Euro (€1.23)' },
        { value: 'currency PLN', text: 'Polish Złoty (1.23 zł)' }
      ]
    default:
      return []
  }
})

const isValid = computed(() => {
  return formData.value.name && 
         formData.value.id && 
         !validation.value.name && 
         !validation.value.id
})

function validateForm() {
  validation.value.name = ''
  validation.value.id = ''

  if (!formData.value.name?.trim()) {
    validation.value.name = 'Column name is required'
  }

  if (!formData.value.id?.trim()) {
    validation.value.id = 'Field ID is required'
  } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(formData.value.id)) {
    validation.value.id = 'Field ID must be valid camelCase (letters and numbers only)'
  }
}

function onTypeChanged() {
  // Reset type-specific options when type changes
  formData.value.options = []
  formData.value.min = undefined
  formData.value.max = undefined
  formData.value.format = undefined
}

function getTypeDisplayName(type: string): string {
  const typeInfo = columnTypes.find(t => t.value === type)
  return typeInfo?.text || type
}

function getSampleValue(): string {
  switch (formData.value.type) {
    case 'text':
      return 'Sample text'
    case 'number':
      return '123'
    case 'date':
      return '15/08/2024'
    case 'datetime':
      return '15/08/2024 14:30'
    case 'select':
      return formData.value.options?.[0] || 'Option 1'
    case 'tags':
      return 'tag1, tag2'
    case 'boolean':
      return 'true/false'
    case 'currency':
      return '$123.45'
    default:
      return 'Sample value'
  }
}

function onSave() {
  validateForm()
  if (!isValid.value) return

  const columnData: TaskColumn = {
    id: formData.value.id!,
    name: formData.value.name!,
    type: formData.value.type as TaskColumn['type'],
    visible: formData.value.visible!,
    width: formData.value.width,
    required: formData.value.required,
    editable: formData.value.editable,
    sortable: formData.value.sortable,
    filterable: formData.value.filterable,
    options: formData.value.options,
    min: formData.value.min,
    max: formData.value.max,
    format: formData.value.format
  }

  emit('save', columnData)
}

function onCancel() {
  emit('cancel')
}

// Initialize form data
onMounted(() => {
  if (props.column) {
    formData.value = { ...props.column }
  } else {
    // Generate a unique ID for new columns
    formData.value.id = `custom_${Date.now()}`
  }
})

// Watch for validation
watch([() => formData.value.name, () => formData.value.id], validateForm)
</script>

<style scoped lang="scss">
.column-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-content {
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

  &.checkbox-row {
    margin-bottom: 12px;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.column-preview {
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .preview-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .preview-type {
      font-size: 12px;
      color: #6c757d;
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }

  .preview-sample {
    font-size: 12px;
    color: #6c757d;
    font-style: italic;
  }
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

:deep(.dx-textbox),
:deep(.dx-selectbox),
:deep(.dx-numberbox),
:deep(.dx-tagbox) {
  .dx-texteditor-label {
    font-weight: 500;
    color: #495057;
  }
}

:deep(.dx-checkbox) {
  .dx-checkbox-text {
    font-size: 14px;
    color: #495057;
  }
}
</style>