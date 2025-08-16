<template>
  <div class="column-manager">
    <div class="manager-header">
      <h4>Manage Columns</h4>
      <p class="header-subtitle">Customize which columns are visible and configure their properties.</p>
    </div>

    <div class="manager-content">
      <!-- Visible Columns Section -->
      <div class="section">
        <div class="section-header">
          <h5>Visible Columns</h5>
          <DxButton
            text="Add Custom Column"
            icon="plus"
            type="success"
            styling-mode="outlined"
            @click="showAddColumn = true"
          />
        </div>
        
        <DxSortable
          :data="visibleColumnsList"
          group="columns"
          @add="onColumnAdded"
          @remove="onColumnRemoved"
          @reorder="onColumnReordered"
        >
          <div class="columns-list visible-columns">
            <div
              v-for="column in visibleColumnsList"
              :key="column.id"
              class="column-item visible"
              :data-id="column.id"
            >
              <div class="column-handle">
                <i class="dx-icon dx-icon-menu"></i>
              </div>
              <div class="column-info">
                <div class="column-name">
                  {{ column.name }}
                  <span v-if="column.required" class="required-indicator">*</span>
                </div>
                <div class="column-meta">
                  <span class="column-type">{{ column.type }}</span>
                  <span v-if="column.width" class="column-width">{{ column.width }}px</span>
                </div>
              </div>
              <div class="column-actions">
                <DxButton
                  icon="edit"
                  styling-mode="text"
                  title="Edit column"
                  @click="editColumn(column)"
                />
                <DxButton
                  v-if="!column.required"
                  icon="eyeclose"
                  styling-mode="text"
                  title="Hide column"
                  @click="hideColumn(column)"
                />
              </div>
            </div>
          </div>
        </DxSortable>
      </div>

      <!-- Hidden Columns Section -->
      <div class="section">
        <div class="section-header">
          <h5>Hidden Columns</h5>
        </div>
        
        <DxSortable
          :data="hiddenColumnsList"
          group="columns"
          @add="onColumnAdded"
          @remove="onColumnRemoved"
        >
          <div class="columns-list hidden-columns">
            <div
              v-for="column in hiddenColumnsList"
              :key="column.id"
              class="column-item hidden"
              :data-id="column.id"
            >
              <div class="column-handle">
                <i class="dx-icon dx-icon-menu"></i>
              </div>
              <div class="column-info">
                <div class="column-name">{{ column.name }}</div>
                <div class="column-meta">
                  <span class="column-type">{{ column.type }}</span>
                </div>
              </div>
              <div class="column-actions">
                <DxButton
                  icon="edit"
                  styling-mode="text"
                  title="Edit column"
                  @click="editColumn(column)"
                />
                <DxButton
                  icon="eye"
                  styling-mode="text"
                  title="Show column"
                  @click="showColumn(column)"
                />
                <DxButton
                  v-if="!isSystemColumn(column)"
                  icon="trash"
                  styling-mode="text"
                  type="danger"
                  title="Delete column"
                  @click="deleteColumn(column)"
                />
              </div>
            </div>
          </div>
        </DxSortable>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="manager-footer">
      <DxButton
        text="Reset to Default"
        styling-mode="outlined"
        @click="resetToDefault"
      />
      <div class="footer-actions">
        <DxButton
          text="Cancel"
          @click="onCancel"
        />
        <DxButton
          text="Apply Changes"
          type="success"
          @click="applyChanges"
        />
      </div>
    </div>

    <!-- Add/Edit Column Dialog -->
    <DxPopup
      v-model:visible="showColumnDialog"
      :title="editingColumn ? 'Edit Column' : 'Add Custom Column'"
      :width="500"
      :height="600"
      :show-close-button="true"
    >
      <ColumnEditor
        :column="editingColumn"
        @save="onColumnSaved"
        @cancel="showColumnDialog = false"
      />
    </DxPopup>

    <!-- Confirmation Dialog -->
    <DxPopup
      v-model:visible="showConfirmation"
      title="Confirm Action"
      :width="400"
      :height="200"
      :show-close-button="true"
    >
      <div class="confirmation-content">
        <p>{{ confirmationMessage }}</p>
        <div class="confirmation-actions">
          <DxButton
            text="Cancel"
            @click="showConfirmation = false"
          />
          <DxButton
            text="Confirm"
            type="danger"
            @click="confirmAction"
          />
        </div>
      </div>
    </DxPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DxButton, DxSortable, DxPopup } from 'devextreme-vue'
import ColumnEditor from './ColumnEditor.vue'
import type { TaskColumn } from '@/types/wbs-task'

interface Props {
  columns: TaskColumn[]
  visibleColumns: TaskColumn[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  columnsUpdated: [columns: TaskColumn[]]
  cancel: []
}>()

const workingColumns = ref<TaskColumn[]>([...props.columns])
const showColumnDialog = ref(false)
const showAddColumn = ref(false)
const editingColumn = ref<TaskColumn | null>(null)
const showConfirmation = ref(false)
const confirmationMessage = ref('')
const pendingAction = ref<(() => void) | null>(null)

const systemColumns = ['name', 'id', 'createdAt', 'updatedAt']

const visibleColumnsList = computed(() =>
  workingColumns.value.filter(col => col.visible)
)

const hiddenColumnsList = computed(() =>
  workingColumns.value.filter(col => !col.visible)
)

function editColumn(column: TaskColumn) {
  editingColumn.value = { ...column }
  showColumnDialog.value = true
  showAddColumn.value = false
}

function hideColumn(column: TaskColumn) {
  if (column.required) return
  
  const index = workingColumns.value.findIndex(col => col.id === column.id)
  if (index >= 0) {
    workingColumns.value[index] = { ...column, visible: false }
  }
}

function showColumn(column: TaskColumn) {
  const index = workingColumns.value.findIndex(col => col.id === column.id)
  if (index >= 0) {
    workingColumns.value[index] = { ...column, visible: true }
  }
}

function deleteColumn(column: TaskColumn) {
  confirmationMessage.value = `Are you sure you want to delete the "${column.name}" column? This action cannot be undone.`
  pendingAction.value = () => {
    const index = workingColumns.value.findIndex(col => col.id === column.id)
    if (index >= 0) {
      workingColumns.value.splice(index, 1)
    }
    showConfirmation.value = false
  }
  showConfirmation.value = true
}

function confirmAction() {
  if (pendingAction.value) {
    pendingAction.value()
    pendingAction.value = null
  }
}

function onColumnAdded(e: any) {
  const columnId = e.itemData
  const column = workingColumns.value.find(col => col.id === columnId)
  if (column) {
    column.visible = e.toIndex !== undefined
  }
}

function onColumnRemoved(e: any) {
  const columnId = e.itemData
  const column = workingColumns.value.find(col => col.id === columnId)
  if (column) {
    column.visible = false
  }
}

function onColumnReordered(e: any) {
  const visibleCols = visibleColumnsList.value
  const [movedColumn] = visibleCols.splice(e.fromIndex, 1)
  visibleCols.splice(e.toIndex, 0, movedColumn)
  
  // Update the working columns order
  const newColumns = [...hiddenColumnsList.value, ...visibleCols]
  workingColumns.value = newColumns
}

function onColumnSaved(column: TaskColumn) {
  if (editingColumn.value) {
    // Update existing column
    const index = workingColumns.value.findIndex(col => col.id === editingColumn.value!.id)
    if (index >= 0) {
      workingColumns.value[index] = column
    }
  } else {
    // Add new column
    workingColumns.value.push(column)
  }
  
  showColumnDialog.value = false
  editingColumn.value = null
}

function isSystemColumn(column: TaskColumn): boolean {
  return systemColumns.includes(column.id)
}

function resetToDefault() {
  confirmationMessage.value = 'Are you sure you want to reset all columns to their default configuration? This will remove all custom columns and reset visibility settings.'
  pendingAction.value = () => {
    // Reset to default columns
    workingColumns.value = getDefaultColumns()
    showConfirmation.value = false
  }
  showConfirmation.value = true
}

function getDefaultColumns(): TaskColumn[] {
  return [
    { id: 'name', name: 'Task Name', type: 'text', visible: true, width: 200, required: true },
    { id: 'description', name: 'Description', type: 'text', visible: true, width: 300 },
    { id: 'status', name: 'Status', type: 'select', visible: true, width: 120, options: ['Not Started', 'In Progress', 'Completed', 'On Hold'] },
    { id: 'priority', name: 'Priority', type: 'select', visible: true, width: 100, options: ['Low', 'Medium', 'High', 'Critical'] },
    { id: 'assignee', name: 'Assignee', type: 'select', visible: true, width: 150 },
    { id: 'startDate', name: 'Start Date', type: 'date', visible: true, width: 120 },
    { id: 'dueDate', name: 'Due Date', type: 'date', visible: true, width: 120 },
    { id: 'estimatedHours', name: 'Est. Hours', type: 'number', visible: true, width: 100 },
    { id: 'actualHours', name: 'Actual Hours', type: 'number', visible: false, width: 100 },
    { id: 'progress', name: 'Progress %', type: 'number', visible: true, width: 100 },
    { id: 'tags', name: 'Tags', type: 'tags', visible: false, width: 150 },
    { id: 'createdAt', name: 'Created', type: 'datetime', visible: false, width: 140 },
    { id: 'updatedAt', name: 'Updated', type: 'datetime', visible: false, width: 140 }
  ]
}

function applyChanges() {
  emit('columnsUpdated', workingColumns.value)
}

function onCancel() {
  emit('cancel')
}

// Watch for showAddColumn to open the dialog
function openAddColumnDialog() {
  editingColumn.value = null
  showColumnDialog.value = true
}

// Handle the add column button
if (showAddColumn.value) {
  openAddColumnDialog()
}
</script>

<style scoped lang="scss">
.column-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.manager-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;

  h4 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }

  .header-subtitle {
    margin: 0;
    font-size: 14px;
    color: #6c757d;
  }
}

.manager-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.section {
  margin-bottom: 32px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h5 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #495057;
    }
  }
}

.columns-list {
  min-height: 60px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 8px;

  &.visible-columns {
    background: rgba(40, 167, 69, 0.05);
    border-color: #28a745;
  }

  &.hidden-columns {
    background: rgba(108, 117, 125, 0.05);
    border-color: #6c757d;
  }

  &:empty::before {
    content: 'Drop columns here';
    display: block;
    text-align: center;
    color: #6c757d;
    font-style: italic;
    padding: 20px;
  }
}

.column-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: move;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: #007bff;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.visible {
    border-left: 4px solid #28a745;
  }

  &.hidden {
    border-left: 4px solid #6c757d;
    opacity: 0.7;
  }
}

.column-handle {
  color: #6c757d;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.column-info {
  flex: 1;

  .column-name {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 2px;

    .required-indicator {
      color: #dc3545;
      margin-left: 4px;
    }
  }

  .column-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: #6c757d;

    .column-type {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .column-width {
      background: #e3f2fd;
      color: #1565c0;
      padding: 2px 6px;
      border-radius: 10px;
    }
  }
}

.column-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;

  .column-item:hover & {
    opacity: 1;
  }
}

.manager-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}

.confirmation-content {
  padding: 20px;
  text-align: center;

  p {
    margin-bottom: 20px;
    color: #495057;
  }

  .confirmation-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

:deep(.dx-sortable-source-hidden) {
  display: none !important;
}

:deep(.dx-sortable-placeholder) {
  background: rgba(0, 123, 255, 0.1);
  border: 2px dashed #007bff;
  margin-bottom: 8px;
  height: 60px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007bff;
  font-weight: 500;

  &::before {
    content: 'Drop here';
  }
}
</style>