<template>
  <div class="wbs-table-view">
    <DxDataGrid
      ref="dataGridRef"
      :data-source="tasks"
      :columns="gridColumns"
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :column-auto-width="false"
      :show-borders="true"
      :show-row-lines="true"
      :show-column-lines="true"
      :row-alternation-enabled="true"
      :hover-state-enabled="true"
      :selection="{ mode: 'single' }"
      :editing="editingConfig"
      :paging="{ enabled: true, pageSize: 50 }"
      :sorting="{ mode: 'multiple' }"
      :filter-row="{ visible: true }"
      :header-filter="{ visible: true }"
      :search-panel="{ visible: true, width: 300, placeholder: 'Search tasks...' }"
      @row-updated="onRowUpdated"
      @row-removed="onRowRemoved"
      @toolbar-preparing="onToolbarPreparing"
    >
      <DxColumn
        data-field="name"
        caption="Task Name"
        :width="200"
        :allow-editing="true"
        :validation-rules="[{ type: 'required', message: 'Task name is required' }]"
      >
        <DxLookup
          :data-source="[]"
          value-expr="id"
          display-expr="name"
        />
      </DxColumn>

      <DxColumn
        data-field="description"
        caption="Description"
        :width="300"
        :allow-editing="true"
        cell-template="descriptionTemplate"
        edit-cell-template="descriptionEditTemplate"
      />

      <DxColumn
        data-field="status"
        caption="Status"
        :width="120"
        :allow-editing="true"
        cell-template="statusTemplate"
      >
        <DxLookup
          :data-source="statusOptions"
          value-expr="value"
          display-expr="text"
        />
      </DxColumn>

      <DxColumn
        data-field="priority"
        caption="Priority"
        :width="100"
        :allow-editing="true"
        cell-template="priorityTemplate"
      >
        <DxLookup
          :data-source="priorityOptions"
          value-expr="value"
          display-expr="text"
        />
      </DxColumn>

      <DxColumn
        data-field="assignee"
        caption="Assignee"
        :width="150"
        :allow-editing="true"
        cell-template="assigneeTemplate"
      >
        <DxLookup
          :data-source="assigneeOptions"
          value-expr="value"
          display-expr="text"
        />
      </DxColumn>

      <DxColumn
        data-field="startDate"
        caption="Start Date"
        data-type="date"
        :width="120"
        :allow-editing="true"
      />

      <DxColumn
        data-field="dueDate"
        caption="Due Date"
        data-type="date"
        :width="120"
        :allow-editing="true"
        cell-template="dueDateTemplate"
      />

      <DxColumn
        data-field="estimatedHours"
        caption="Est. Hours"
        data-type="number"
        :width="100"
        :allow-editing="true"
        format="decimal"
      />

      <DxColumn
        data-field="actualHours"
        caption="Actual Hours"
        data-type="number"
        :width="100"
        :allow-editing="true"
        format="decimal"
      />

      <DxColumn
        data-field="progress"
        caption="Progress %"
        data-type="number"
        :width="120"
        :allow-editing="true"
        cell-template="progressTemplate"
        edit-cell-template="progressEditTemplate"
      />

      <DxColumn
        data-field="tags"
        caption="Tags"
        :width="150"
        :allow-editing="true"
        cell-template="tagsTemplate"
        edit-cell-template="tagsEditTemplate"
      />

      <DxColumn
        data-field="createdAt"
        caption="Created"
        data-type="datetime"
        :width="140"
        :allow-editing="false"
        format="dd/MM/yyyy HH:mm"
      />

      <DxColumn
        data-field="updatedAt"
        caption="Updated"
        data-type="datetime"
        :width="140"
        :allow-editing="false"
        format="dd/MM/yyyy HH:mm"
      />

      <!-- Actions Column -->
      <DxColumn
        caption="Actions"
        :width="80"
        :allow-editing="false"
        :allow-sorting="false"
        :allow-filtering="false"
        cell-template="actionsTemplate"
      />

      <!-- Custom Templates -->
      <template #descriptionTemplate="{ data }">
        <div class="description-cell" :title="data.value">
          {{ data.value ? (data.value.length > 50 ? data.value.substring(0, 50) + '...' : data.value) : '' }}
        </div>
      </template>

      <template #descriptionEditTemplate="{ data }">
        <DxTextArea
          :value="data.value"
          @value-changed="(e) => data.setValue(e.value)"
          :height="60"
        />
      </template>

      <template #statusTemplate="{ data }">
        <div class="status-badge" :class="`status-${data.value?.toLowerCase().replace(' ', '-')}`">
          {{ data.value }}
        </div>
      </template>

      <template #priorityTemplate="{ data }">
        <div class="priority-badge" :class="`priority-${data.value?.toLowerCase()}`">
          {{ data.value }}
        </div>
      </template>

      <template #assigneeTemplate="{ data }">
        <div class="assignee-cell">
          <div class="assignee-avatar">{{ getInitials(data.value) }}</div>
          <span class="assignee-name">{{ data.value }}</span>
        </div>
      </template>

      <template #dueDateTemplate="{ data }">
        <div class="due-date-cell" :class="getDueDateClass(data.value)">
          {{ formatDate(data.value) }}
        </div>
      </template>

      <template #progressTemplate="{ data }">
        <div class="progress-cell">
          <DxProgressBar
            :value="data.value"
            :show-status="false"
            :height="16"
            :class="getProgressClass(data.value)"
          />
          <span class="progress-text">{{ data.value }}%</span>
        </div>
      </template>

      <template #progressEditTemplate="{ data }">
        <DxSlider
          :value="data.value"
          @value-changed="(e) => data.setValue(e.value)"
          :min="0"
          :max="100"
          :step="5"
          :tooltip="{ enabled: true, position: 'top' }"
        />
      </template>

      <template #tagsTemplate="{ data }">
        <div class="tags-cell">
          <span
            v-for="tag in data.value"
            :key="tag"
            class="tag-chip"
          >
            {{ tag }}
          </span>
        </div>
      </template>

      <template #tagsEditTemplate="{ data }">
        <DxTagBox
          :value="data.value"
          @value-changed="(e) => data.setValue(e.value)"
          :data-source="availableTags"
          :accept-custom-value="true"
          :multi-tag="false"
          placeholder="Add tags..."
        />
      </template>

      <template #actionsTemplate="{ data }">
        <div class="actions-cell">
          <DxButton
            icon="trash"
            type="danger"
            styling-mode="text"
            :title="`Delete ${data.data.name}`"
            @click="deleteTask(data.data)"
          />
        </div>
      </template>
    </DxDataGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  DxLookup,
  DxTextArea,
  DxProgressBar,
  DxSlider,
  DxTagBox,
  DxButton
} from 'devextreme-vue'
import { DxDataGrid, DxColumn } from 'devextreme-vue/data-grid';
import type { WbsTask, TaskColumn } from '@/types/wbs-task'

interface Props {
  tasks: WbsTask[]
  columns: TaskColumn[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  taskUpdated: [task: WbsTask]
  taskDeleted: [taskId: number]
}>()

const dataGridRef = ref()

const editingConfig = {
  mode: 'cell',
  allowUpdating: true,
  allowDeleting: true,
  allowAdding: false,
  selectTextOnEditStart: true,
  startEditAction: 'click'
}

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
  { value: 'Sarah Wilson', text: 'Sarah Wilson' }
])

const availableTags = ref([
  'frontend', 'backend', 'database', 'security', 'vue', 'api', 'testing', 'documentation'
])

const gridColumns = computed(() => {
  return props.columns.map(col => ({
    dataField: col.id,
    caption: col.name,
    width: col.width,
    visible: col.visible,
    allowEditing: col.editable !== false,
    allowSorting: col.sortable !== false,
    allowFiltering: col.filterable !== false,
    dataType: col.type === 'date' || col.type === 'datetime' ? col.type : undefined,
    format: col.format
  }))
})

function onRowUpdated(e: any) {
  const updatedTask = e.data as WbsTask
  updatedTask.updatedAt = new Date()
  emit('taskUpdated', updatedTask)
}

function onRowRemoved(e: any) {
  emit('taskDeleted', e.data.id)
}

function onToolbarPreparing(e: any) {
  e.toolbarOptions.items.unshift({
    location: 'before',
    widget: 'dxButton',
    options: {
      text: 'Expand All',
      icon: 'expand',
      onClick: () => dataGridRef.value?.instance.expandAll()
    }
  }, {
    location: 'before',
    widget: 'dxButton',
    options: {
      text: 'Collapse All',
      icon: 'collapse',
      onClick: () => dataGridRef.value?.instance.collapseAll()
    }
  })
}

function deleteTask(task: WbsTask) {
  emit('taskDeleted', task.id)
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function formatDate(date?: Date): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function getDueDateClass(dueDate?: Date): string {
  if (!dueDate) return ''
  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'due-soon'
  return ''
}

function getProgressClass(progress: number): string {
  if (progress >= 80) return 'progress-high'
  if (progress >= 50) return 'progress-medium'
  if (progress >= 20) return 'progress-low'
  return 'progress-none'
}
</script>

<style scoped lang="scss">
.wbs-table-view {
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.dx-datagrid) {
  border: none;
  
  .dx-datagrid-headers {
    background: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
  }

  .dx-header-row .dx-datagrid-table .dx-row > td {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    font-weight: 600;
    color: #495057;
  }

  .dx-row-alt > td {
    background: #f8f9fa;
  }

  .dx-row:hover > td {
    background: #e3f2fd !important;
  }
}

.description-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;

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

.priority-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 60px;

  &.priority-low {
    background: #e7f3ff;
    color: #0066cc;
  }

  &.priority-medium {
    background: #fff3cd;
    color: #856404;
  }

  &.priority-high {
    background: #ffe6cc;
    color: #cc4400;
  }

  &.priority-critical {
    background: #f8d7da;
    color: #721c24;
  }
}

.assignee-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .assignee-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
  }

  .assignee-name {
    font-size: 13px;
  }
}

.due-date-cell {
  &.overdue {
    color: #dc3545;
    font-weight: 600;
  }

  &.due-soon {
    color: #fd7e14;
    font-weight: 600;
  }
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .progress-text {
    font-size: 12px;
    font-weight: 500;
    min-width: 30px;
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

.tags-cell {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;

  .tag-chip {
    display: inline-block;
    padding: 2px 6px;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
  }
}

.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>