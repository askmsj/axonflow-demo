<template>
  <p>12334567</p>
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
import type { WbsTask, TaskColumn } from '../../types/wbs-task'

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

</style>