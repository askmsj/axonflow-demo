<template>
  <div class="field-renderer">
    <!-- Text Field Display -->
    <span v-if="column.type === 'text'" class="text-value">
      {{ displayValue }}
    </span>

    <!-- Number Field Display -->
    <span v-else-if="column.type === 'number'" class="number-value">
      {{ formatNumber(value) }}
    </span>

    <!-- Currency Field Display -->
    <span v-else-if="column.type === 'currency'" class="currency-value">
      {{ formatCurrency(value) }}
    </span>

    <!-- Date Field Display -->
    <span v-else-if="column.type === 'date'" class="date-value">
      {{ formatDate(value) }}
    </span>

    <!-- DateTime Field Display -->
    <span v-else-if="column.type === 'datetime'" class="datetime-value">
      {{ formatDateTime(value) }}
    </span>

    <!-- Select Field Display -->
    <span v-else-if="column.type === 'select'" class="select-value">
      {{ value }}
    </span>

    <!-- Tags Field Display -->
    <div v-else-if="column.type === 'tags'" class="tags-value">
      <span
        v-for="tag in (Array.isArray(value) ? value : [])"
        :key="tag"
        class="tag-chip"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Boolean Field Display -->
    <div v-else-if="column.type === 'boolean'" class="boolean-value">
      <i :class="value ? 'dx-icon dx-icon-check' : 'dx-icon dx-icon-close'" 
         :style="{ color: value ? '#28a745' : '#dc3545' }"></i>
      <span>{{ getBooleanText() }}</span>
    </div>

    <!-- Fallback Display -->
    <span v-else class="default-value">
      {{ displayValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskColumn } from '@/types/wbs-task'

interface Props {
  value: any
  column: TaskColumn
}

const props = defineProps<Props>()

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return ''
  }
  return String(props.value)
})

function formatNumber(value: any): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  
  const num = Number(value)
  if (isNaN(num)) {
    return String(value)
  }

  switch (props.column.format) {
    case 'integer':
      return num.toFixed(0)
    case 'percent':
      return `${num.toFixed(1)}%`
    case 'decimal':
    default:
      return num.toFixed(2)
  }
}

function formatCurrency(value: any): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  
  const num = Number(value)
  if (isNaN(num)) {
    return String(value)
  }

  const format = props.column.format || 'currency'
  
  if (format.includes('EUR')) {
    return `€${num.toFixed(2)}`
  } else if (format.includes('PLN')) {
    return `${num.toFixed(2)} zł`
  } else {
    return `$${num.toFixed(2)}`
  }
}

function formatDate(value: any): string {
  if (!value) return ''
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return String(value)
    
    const format = props.column.format || 'dd/MM/yyyy'
    
    switch (format) {
      case 'MM/dd/yyyy':
        return date.toLocaleDateString('en-US')
      case 'yyyy-MM-dd':
        return date.toISOString().split('T')[0]
      case 'dd MMM yyyy':
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
      case 'dd/MM/yyyy':
      default:
        return date.toLocaleDateString('en-GB')
    }
  } catch {
    return String(value)
  }
}

function formatDateTime(value: any): string {
  if (!value) return ''
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return String(value)
    
    const format = props.column.format || 'dd/MM/yyyy HH:mm'
    
    switch (format) {
      case 'MM/dd/yyyy HH:mm':
        return date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      case 'yyyy-MM-dd HH:mm':
        return date.toLocaleString('sv-SE').replace(' ', ' ')
      case 'dd MMM yyyy HH:mm':
        return date.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      case 'dd/MM/yyyy HH:mm':
      default:
        return date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
    }
  } catch {
    return String(value)
  }
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
.field-renderer {
  display: inline-block;
  width: 100%;
}

.text-value,
.number-value,
.currency-value,
.date-value,
.datetime-value,
.select-value,
.default-value {
  font-size: 13px;
  color: #495057;
  line-height: 1.4;
}

.number-value,
.currency-value {
  font-weight: 500;
  text-align: right;
}

.tags-value {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .tag-chip {
    display: inline-block;
    padding: 2px 6px;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
  }
}

.boolean-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #495057;

  i {
    font-size: 14px;
  }
}

// Empty state
.field-renderer:empty::before {
  content: '—';
  color: #dee2e6;
  font-style: italic;
}
</style>