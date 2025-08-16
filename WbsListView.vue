<template>
  <div class="wbs-list-view">
    <!-- List Header with controls -->
    <div class="list-header">
      <div class="header-left">
        <DxSelectBox
          :data-source="groupByOptions"
          value-expr="value"
          display-expr="text"
          :value="groupBy"
          @value-changed="onGroupByChanged"
          placeholder="Group by..."
          :width="150"
        />
        <DxSelectBox
          :data-source="sortOptions"
          value-expr="value"
          display-expr="text"
          :value="sortBy"
          @value-changed="onSortChanged"
          placeholder="Sort by..."
          :width="150"
        />
      </div>
      <div class="header-right">
        <DxTextBox
          v-model:value="searchText"
          placeholder="Search tasks..."
          mode="search"
          :width="250"
        />
      </div>
    </div>

    <!-- List Content -->
    <div class="list-content">
      <DxScrollView
        direction="vertical"
        :show-scrollbar="'onHover'"
        class="task-scroll-container"
      >
        <!-- Grouped Tasks -->
        <div v-if="groupBy && groupedTasks.length > 0" class="grouped-tasks">
          <div
            v-for="group in groupedTasks"
            :key="group.key"
            class="task-group"
          >
            <div class="group-header" @click="toggleGroup(group.key)">
              <DxButton
                :icon="group.expanded ? 'chevrondown' : 'chevronright'"
                styling-mode="text"
                :width="20"
                :height="20"
              />
              <h3 class="group-title">{{ group.title }}</h3>
              <span class="group-count">({{ group.items.length }})</span>
            </div>
            <div v-show="group.expanded" class="group-items">
              <TaskListItem
                v-for="task in group.items"
                :key="task.id"
                :task="task"
                :columns="visibleColumns"
                @task-updated="onTaskUpdated"
                @task-deleted="onTaskDeleted"
                @task-clicked="onTaskClicked"
              />
            </div>
          </div>
        </div>

        <!-- Flat Task List -->
        <div v-else class="flat-tasks">
          <TaskListItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            :columns="visibleColumns"
            @task-updated="onTaskUpdated"
            @task-deleted="onTaskDeleted"
            @task-clicked="onTaskClicked"
          />
        </div>
      </DxScrollView>
    </div>

    <!-- Task Detail Panel -->
    <DxDrawer
      v-model:opened="showTaskDetail"
      :width="400"
      position="right"
      reveal-mode="slide"
      open-state-mode="push"
      class="task-detail-drawer"
    >
      <TaskDetailPanel
        v-if="selectedTask"
        :task="selectedTask"
        :columns="columns"
        @task-updated="onTaskUpdated"
        @close="showTaskDetail = false"
      />
    </DxDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  DxSelectBox,
  DxTextBox,
  DxScrollView,
  DxButton,
  DxDrawer
} from 'devextreme-vue'
import TaskListItem from './TaskListItem.vue'
import TaskDetailPanel from './TaskDetailPanel.vue'
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

const searchText = ref('')
const groupBy = ref<string | null>(null)
const sortBy = ref('name')
const selectedTask = ref<WbsTask | null>(null)
const showTaskDetail = ref(false)
const expandedGroups = ref<Set<string>>(new Set())

const groupByOptions = [
  { value: null, text: 'No grouping' },
  { value: 'status', text: 'Status' },
  { value: 'priority', text: 'Priority' },
  { value: 'assignee', text: 'Assignee' },
  { value: 'dueDate', text: 'Due Date' }
]

const sortOptions = [
  { value: 'name', text: 'Name' },
  { value: 'priority', text: 'Priority' },
  { value: 'dueDate', text: 'Due Date' },
  { value: 'status', text: 'Status' },
  { value: 'progress', text: 'Progress' },
  { value: 'createdAt', text: 'Created Date' }
]

const visibleColumns = computed(() => 
  props.columns.filter(col => col.visible)
)

const filteredTasks = computed(() => {
  let filtered = props.tasks

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(task =>
      task.name.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search) ||
      task.assignee?.toLowerCase().includes(search) ||
      task.tags?.some(tag => tag.toLowerCase().includes(search))
    )
  }

  // Sort tasks
  return filtered.sort((a, b) => {
    const aVal = a[sortBy.value as keyof WbsTask]
    const bVal = b[sortBy.value as keyof WbsTask]
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal)
    }
    if (aVal instanceof Date && bVal instanceof Date) {
      return aVal.getTime() - bVal.getTime()
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal
    }
    return 0
  })
})

const groupedTasks = computed(() => {
  if (!groupBy.value) return []

  const groups = new Map<string, WbsTask[]>()
  
  filteredTasks.value.forEach(task => {
    let groupKey = ''
    let groupTitle = ''

    switch (groupBy.value) {
      case 'status':
        groupKey = task.status || 'No Status'
        groupTitle = groupKey
        break
      case 'priority':
        groupKey = task.priority || 'No Priority'
        groupTitle = groupKey
        break
      case 'assignee':
        groupKey = task.assignee || 'Unassigned'
        groupTitle = groupKey
        break
      case 'dueDate':
        if (task.dueDate) {
          const today = new Date()
          const due = new Date(task.dueDate)
          const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          if (diffDays < 0) {
            groupKey = 'overdue'
            groupTitle = 'Overdue'
          } else if (diffDays <= 7) {
            groupKey = 'this-week'
            groupTitle = 'This Week'
          } else if (diffDays <= 30) {
            groupKey = 'this-month'
            groupTitle = 'This Month'
          } else {
            groupKey = 'later'
            groupTitle = 'Later'
          }
        } else {
          groupKey = 'no-due-date'
          groupTitle = 'No Due Date'
        }
        break
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(task)
  })

  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    title: items.length > 0 ? (groupBy.value === 'dueDate' ? key.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : items[0][groupBy.value as keyof WbsTask] as string || 'Unknown') : 'Unknown',
    items,
    expanded: expandedGroups.value.has(key)
  }))
})

function onGroupByChanged(e: any) {
  groupBy.value = e.value
  // Expand all groups by default when grouping changes
  if (groupBy.value) {
    expandedGroups.value = new Set(groupedTasks.value.map(g => g.key))
  }
}

function onSortChanged(e: any) {
  sortBy.value = e.value
}

function toggleGroup(groupKey: string) {
  if (expandedGroups.value.has(groupKey)) {
    expandedGroups.value.delete(groupKey)
  } else {
    expandedGroups.value.add(groupKey)
  }
}

function onTaskUpdated(task: WbsTask) {
  emit('taskUpdated', task)
}

function onTaskDeleted(taskId: number) {
  emit('taskDeleted', taskId)
  if (selectedTask.value?.id === taskId) {
    selectedTask.value = null
    showTaskDetail.value = false
  }
}

function onTaskClicked(task: WbsTask) {
  selectedTask.value = task
  showTaskDetail.value = true
}

// Initialize expanded groups
watch(groupedTasks, (newGroups) => {
  if (newGroups.length > 0 && expandedGroups.value.size === 0) {
    expandedGroups.value = new Set(newGroups.map(g => g.key))
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.wbs-list-view {
  height: 100%;
/*  //display: flex;*/
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;

  .header-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
  }
}

.list-content {
  flex: 1;
  overflow: hidden;
  
  .task-scroll-container {
    height: 100%;
  }
}

.grouped-tasks {
  .task-group {
    margin-bottom: 8px;

    .group-header {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background: #f1f3f4;
      border-bottom: 1px solid #e9ecef;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #e9ecef;
      }

      .group-title {
        margin: 0 8px 0 4px;
        font-size: 14px;
        font-weight: 600;
        color: #495057;
      }

      .group-count {
        font-size: 12px;
        color: #6c757d;
        background: white;
        padding: 2px 8px;
        border-radius: 12px;
      }
    }

    .group-items {
      background: white;
    }
  }
}

.flat-tasks {
  background: white;
}

:deep(.task-detail-drawer) {
  .dx-drawer-content {
    background: #f8f9fa;
    border-left: 1px solid #e9ecef;
  }
}
</style>
