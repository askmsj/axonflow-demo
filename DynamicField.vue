<template>
  <div class="dynamic-field">
    <!-- Text Field -->
    <DxTextBox
      v-if="column.type === 'text'"
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      :placeholder="`Enter ${column.name.toLowerCase()}...`"
      @value-changed="onValueChanged"
    />

    <!-- Number Field -->
    <DxNumberBox
      v-else-if="column.type === 'number'"
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      :placeholder="0"
      :min="column.min"
      :max="column.max"
      :format="column.format || 'decimal'"
      @value-changed="onValueChanged"
    />

    <!-- Currency Field -->
    <DxNumberBox
      v-else-if="column.type === 'currency'"
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      :placeholder="0"
      :min="column.min"
      :max="column.max"
      format="currency"
      @value-changed="onValueChanged"
    />

    <!-- Date Field -->
    <DxDateBox
      v-else-if="column.type === 'date'"
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      type="date"
      :placeholder="`Select ${column.name.toLowerCase()}...`"
      @value-changed="onValueChanged"
    />

    <!-- DateTime Field -->
    <DxDateBox
      v-else-if="column.type === 'datetime'"
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      type="datetime"
      :placeholder="`Select ${column.name.toLowerCase()}...`"
      @value-changed="onValueChanged"
    />

    <!-- Select Field -->
    <DxSelectBox
      v-else-if="column.type === 'select'"
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      :data-source="column.options || []"
      :placeholder="`Select ${column.name.toLowerCase()}...`"
      :search-enabled="true"
      :accept-custom-value="false"
      @value-changed="onValueChanged"
    />

    <!-- Tags Field -->
    <DxTagBox
      v-else-if="column.type === 'tags'"
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      :data-source="column.options || []"
      :placeholder="`Add ${column.name.toLowerCase()}...`"
      :accept-custom-value="true"
      :search-enabled="true"
      :multi-tag="false"
      @value-changed="onValueChanged"
    />

    <!-- Boolean Field -->
    <div v-else-if="column.type === 'boolean'" class="boolean-field">
      <label class="field-label">{{ column.name }}{{ column.required ? ' *' : '' }}</label>
      <DxCheckBox
        :value="value"
        :text="getBooleanText()"
        @value-changed="onValueChanged"
      />
    </div>

    <!-- Fallback Text Field -->
    <DxTextBox
      v-else
      :value="value"
      :label="column.name + (column.required ? ' *' : '')"
      :placeholder="`Enter ${column.name.toLowerCase()}...`"
      @value-changed="onValueChanged"
    />
  </div>
</template>

<script setup lang="ts">
import {
  DxTextBox,
  DxNumberBox,
  DxDateBox,
  DxSelectBox,
  DxTagBox,
  DxCheckBox
} from 'devextreme-vue'
import type { TaskColumn } from '@/types/wbs-task'

interface Props {
  column: TaskColumn
  value?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [value: any]
}>()

function onValueChanged(e: any) {
  emit('update', e.value)
}

function getBooleanText(): string {
  if (props.column.name.toLowerCase().includes('enabled') || 
      props.column.name.toLowerCase().includes('active')) {
    return props.value ? 'Enabled' : 'Disabled'
  }
  if (props.column.name.toLowerCase().includes('completed') || 
      props.column.name.toLowerCase().includes('done')) {
    return props.value ? 'Completed' : 'Not Completed'
  }
  return props.value ? 'Yes' : 'No'
}
</script>

<style scoped lang="scss">
.dynamic-field {
  width: 100%;
}

.boolean-field {
  .field-label {
    display: block;
    font-weight: 500;
    color: #495057;
    margin-bottom: 8px;
    font-size: 14px;
  }
}

:deep(.dx-textbox),
:deep(.dx-numberbox),
:deep(.dx-datebox),
:deep(.dx-selectbox),
:deep(.dx-tagbox) {
  .dx-texteditor-label {
    font-weight: 500;
    color: #495057;
    margin-bottom: 4px;
  }
}

:deep(.dx-checkbox) {
  .dx-checkbox-text {
    font-size: 14px;
    color: #495057;
    margin-left: 8px;
  }
}
</style>