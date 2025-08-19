<template>
  <div class="wbs-tasks-view">
    <!-- Header Section -->
    <div class="view-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link :to="{ name: 'workspace_home', params: { workspaceId } }" class="breadcrumb-link">
            {{ workspaceName }}
          </router-link>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-current">WBS Tasks</span>
        </div>
        <h1 class="view-title">WBS Task Management</h1>
        <p class="view-description">
          Manage your work breakdown structure tasks with multiple view modes and dynamic columns
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <DxLoadIndicator :visible="true" />
      <p>Loading WBS data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <i class="dx-icon dx-icon-warning"></i>
        <h3>Error Loading Data</h3>
        <p>{{ error }}</p>
        <DxButton
          text="Retry"
          type="success"
          @click="loadData"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="view-content">
      <WbsTaskManager
        :title="currentWbsTitle"
        :wbs-id="currentWbsId"
        @task-created="onTaskCreated"
        @task-updated="onTaskUpdated" 
        @task-deleted="onTaskDeleted"
      />
    </div>

    <!-- Toast Notifications -->
    <DxToast
      v-model:visible="showToast"
      :message="toastMessage"
      :type="toastType"
      :display-time="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DxLoadIndicator, DxButton, DxToast } from 'devextreme-vue'
import WbsTaskManager from './WbsTaskManager.vue'
import { useUserStore } from '@/stores/user-data'
import apiClient from '@/services/apiClient'
import type { WbsTask } from '@/types/wbs-task'

const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const error = ref<string | null>(null)
const currentWbsId = ref<number>(0)
const currentWbsTitle = ref('All Tasks')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('success')

const workspaceId = computed(() => route.params.workspaceId as string)
const workspaceName = computed(() => {
  return userStore.currentWorkspace?.name || 'Workspace'
})

onMounted(async () => {
  await loadData()
})

watch(() => route.params.workspaceId, async (newWorkspaceId) => {
  if (newWorkspaceId) {
    await loadData()
  }
})

async function loadData() {
  loading.value = true
  error.value = null
  
  try {
    // Load default WBS for the workspace or get the first available WBS
    const response = await apiClient.get(`/api/wbs?workspaceId=${workspaceId.value}`)
    const wbsList = response.data
    
    if (wbsList && wbsList.length > 0) {
      // Use the first WBS as default, or implement logic to select default WBS
      const defaultWbs = wbsList[0]
      currentWbsId.value = defaultWbs.id
      currentWbsTitle.value = defaultWbs.name || 'WBS Tasks'
    } else {
      // No WBS found, create a default one or show appropriate message
      currentWbsId.value = 0
      currentWbsTitle.value = 'No WBS Available'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Failed to load WBS data'
    console.error('Failed to load WBS data:', err)
  } finally {
    loading.value = false
  }
}

function onTaskCreated(task: WbsTask) {
  showNotification('Task created successfully', 'success')
  
  // Here you could also call an API to persist the task
  // try {
  //   await apiClient.post('/api/tasks', task)
  // } catch (err) {
  //   showNotification('Failed to save task', 'error')
  // }
}

function onTaskUpdated(task: WbsTask) {
  showNotification('Task updated successfully', 'success')
  
  // Here you could also call an API to update the task
  // try {
  //   await apiClient.put(`/api/tasks/${task.id}`, task)
  // } catch (err) {
  //   showNotification('Failed to update task', 'error')
  // }
}

function onTaskDeleted(taskId: number) {
  showNotification('Task deleted successfully', 'success')
  
  // Here you could also call an API to delete the task
  // try {
  //   await apiClient.delete(`/api/tasks/${taskId}`)
  // } catch (err) {
  //   showNotification('Failed to delete task', 'error')
  // }
}

function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}
</script>

<style scoped lang="scss">
.wbs-tasks-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.view-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .header-content {
    padding: 24px 32px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #6c757d;

    .breadcrumb-link {
      color: #007bff;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3;
        text-decoration: underline;
      }
    }

    .breadcrumb-separator {
      margin: 0 8px;
      color: #dee2e6;
    }

    .breadcrumb-current {
      font-weight: 500;
      color: #495057;
    }
  }

  .view-title {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1.2;
  }

  .view-description {
    margin: 0;
    font-size: 16px;
    color: #6c757d;
    line-height: 1.4;
  }
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #6c757d;

  p {
    margin: 0;
    font-size: 16px;
  }
}

.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;

  .error-content {
    text-align: center;
    max-width: 400px;

    i {
      font-size: 48px;
      color: #dc3545;
      margin-bottom: 16px;
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }

    p {
      margin: 0 0 24px 0;
      font-size: 14px;
      color: #6c757d;
      line-height: 1.5;
    }
  }
}

.view-content {
  flex: 1;
  overflow: hidden;
  padding: 0 32px 32px 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

// Responsive adjustments
@media (max-width: 768px) {
  .view-header .header-content {
    padding: 16px 20px;
  }

  .view-content {
    padding: 0 20px 20px 20px;
  }

  .view-header .view-title {
    font-size: 24px;
  }

  .view-header .view-description {
    font-size: 14px;
  }
}

// Toast positioning
:deep(.dx-toast) {
  .dx-toast-content {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>