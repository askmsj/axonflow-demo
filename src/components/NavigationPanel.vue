<template>
  <div class="navigation-panel">
    <!-- Organization/Workspace Context Header -->
    <div class="nav-header">
      <div class="context-selector">
        <div class="org-info">
          <div class="org-icon">
            <i class="dx-icon dx-icon-home"></i>
          </div>
          <div class="org-details">
            <span class="org-name">{{ currentOrg.name }}</span>
            <span class="workspace-name">{{ currentWorkspace.name }}</span>
          </div>
        </div>
        
        <DxButton
          icon="more"
          styling-mode="text"
          @click="showContextMenu"
          class="context-menu-btn"
          title="Switch organization or workspace"
        />
      </div>
    </div>

    <!-- Main Navigation Sections -->
    <div class="nav-content">
      <!-- Dashboard -->
      <div class="nav-section">
        <nav class="nav-items">
          <a href="#" class="nav-item" :class="{ active: activeItem === 'dashboard' }" @click="setActive('dashboard')">
            <i class="dx-icon dx-icon-datausage"></i>
            <span>Dashboard</span>
          </a>
          
          <a href="#" class="nav-item" :class="{ active: activeItem === 'today' }" @click="setActive('today')">
            <i class="dx-icon dx-icon-clock"></i>
            <span>Today</span>
            <span class="nav-badge" v-if="todayCount">{{ todayCount }}</span>
          </a>
        </nav>
      </div>


      <!-- Project Management -->
      <div class="nav-section">
        <!-- Project/Folder Tree as regular nav items -->
        <div class="project-tree-nav">
          <WbsFolderTree 
            :selected-folder-id="selectedFolderId"
            :include-subfolders="includeSubfolders"
            @folder-selected="onFolderSelected"
            @filter-mode-changed="onFilterModeChanged"
            @clear-selection="onClearSelection"
          />
        </div>
      </div>

      <!-- Views & Reports -->
      <div class="nav-section">
        <nav class="nav-items">
          <a href="#" class="nav-item" :class="{ active: activeItem === 'reports' }" @click="setActive('reports')">
            <i class="dx-icon dx-icon-chart"></i>
            <span>Views & Reports</span>
          </a>
        </nav>
      </div>

      <!-- Team & Collaboration -->
      <div class="nav-section">
        <div class="nav-section-header">
          <i class="dx-icon dx-icon-group"></i>
          <span>Team</span>
        </div>
        
        <nav class="nav-items">
          <a href="#" class="nav-item" :class="{ active: activeItem === 'team-members' }" @click="setActive('team-members')">
            <i class="dx-icon dx-icon-user"></i>
            <span>Team Members</span>
          </a>
          
          <a href="#" class="nav-item" :class="{ active: activeItem === 'permissions' }" @click="setActive('permissions')">
            <i class="dx-icon dx-icon-lock"></i>
            <span>Permissions</span>
          </a>
          
          <a href="#" class="nav-item" :class="{ active: activeItem === 'activity' }" @click="setActive('activity')">
            <i class="dx-icon dx-icon-clock"></i>
            <span>Activity Log</span>
          </a>
        </nav>
      </div>


      <!-- Settings -->
      <div class="nav-section">
        <div class="nav-section-header">
          <i class="dx-icon dx-icon-preferences"></i>
          <span>Settings</span>
        </div>
        
        <nav class="nav-items">
          <a href="#" class="nav-item" :class="{ active: activeItem === 'workspace-settings' }" @click="setActive('workspace-settings')">
            <i class="dx-icon dx-icon-spindown"></i>
            <span>Workspace</span>
          </a>
          
          <a href="#" class="nav-item" :class="{ active: activeItem === 'profile' }" @click="setActive('profile')">
            <i class="dx-icon dx-icon-user"></i>
            <span>Profile</span>
          </a>
        </nav>
      </div>
    </div>

    <!-- User Profile Footer -->
    <div class="nav-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <i class="dx-icon dx-icon-user"></i>
        </div>
        <div class="user-info">
          <span class="user-name">{{ currentUser.name }}</span>
          <span class="user-role">{{ currentUser.role }}</span>
        </div>
        <DxButton
          icon="runner"
          styling-mode="text"
          @click="signOut"
          title="Sign out"
          class="sign-out-btn"
        />
      </div>
    </div>

    <!-- Context Menu Popup -->
    <DxPopup
      v-model:visible="contextMenuVisible"
      title="Switch Context"
      :show-title="true"
      :width="400"
      :height="500"
      :close-on-outside-click="true"
    >
      <div class="context-menu-content">
        <div class="context-section">
          <h4>Organizations</h4>
          <div class="context-list">
            <div 
              v-for="org in availableOrgs" 
              :key="org.id"
              class="context-item"
              :class="{ active: org.id === currentOrg.id }"
              @click="selectOrganization(org)"
            >
              <i class="dx-icon dx-icon-home"></i>
              <span>{{ org.name }}</span>
              <i v-if="org.id === currentOrg.id" class="dx-icon dx-icon-check selected-icon"></i>
            </div>
          </div>
        </div>
        
        <div class="context-section">
          <h4>Workspaces</h4>
          <div class="context-list">
            <div 
              v-for="workspace in availableWorkspaces" 
              :key="workspace.id"
              class="context-item"
              :class="{ active: workspace.id === currentWorkspace.id }"
              @click="selectWorkspace(workspace)"
            >
              <i class="dx-icon dx-icon-folder"></i>
              <span>{{ workspace.name }}</span>
              <i v-if="workspace.id === currentWorkspace.id" class="dx-icon dx-icon-check selected-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </DxPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DxButton, DxPopup } from 'devextreme-vue'
import WbsFolderTree from './WbsViews/WbsFolderTree.vue'
import type { FolderTreeNode } from '../services/folderService'
import workspaceService from '../services/workspaceService'
import userService from '../services/userService'

interface Organization {
  id: number
  name: string
  description?: string
}

interface Workspace {
  id: number
  name: string
  organizationId: number
  description?: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  avatarUrl?: string
}

const activeItem = ref('dashboard')
const contextMenuVisible = ref(false)
const selectedFolderId = ref<number | null>(null)
const includeSubfolders = ref(true)

// Mock data - replace with actual API calls
const currentOrg = ref<Organization>({
  id: 1,
  name: 'Acme Corporation',
  description: 'Main organization'
})

const currentWorkspace = ref<Workspace>({
  id: 1,
  name: 'Product Development',
  organizationId: 1,
  description: 'Main workspace'
})

const currentUser = ref<User>({
  id: 1,
  name: 'John Doe',
  email: 'john.doe@acme.com',
  role: 'Project Manager'
})

const availableOrgs = ref<Organization[]>([
  { id: 1, name: 'Acme Corporation' },
  { id: 2, name: 'Subsidiary Corp' }
])

const availableWorkspaces = ref<Workspace[]>([
  { id: 1, name: 'Product Development', organizationId: 1 },
  { id: 2, name: 'Marketing', organizationId: 1 },
  { id: 3, name: 'Operations', organizationId: 2 }
])


// Computed properties for badges/counters
const todayCount = computed(() => 12) // Replace with actual count

const emit = defineEmits<{
  navigationChanged: [item: string, data?: any]
  folderSelected: [folder: FolderTreeNode | null]
}>()

function setActive(item: string) {
  activeItem.value = item
  emit('navigationChanged', item)
}

function showContextMenu() {
  contextMenuVisible.value = true
}

function selectOrganization(org: Organization) {
  currentOrg.value = org
  // Load workspaces for selected organization
  loadWorkspaces(org.id)
  contextMenuVisible.value = false
}

function selectWorkspace(workspace: Workspace) {
  currentWorkspace.value = workspace
  contextMenuVisible.value = false
  // Emit workspace change event
  emit('navigationChanged', 'workspace-changed', workspace)
}

function onFolderSelected(folder: FolderTreeNode | null) {
  selectedFolderId.value = folder?.id || null
  emit('folderSelected', folder)
}

function onFilterModeChanged(includeSub: boolean) {
  includeSubfolders.value = includeSub
}

function onClearSelection() {
  selectedFolderId.value = null
  emit('folderSelected', null)
}

function createProject() {
  // Emit event to create new project
  emit('navigationChanged', 'create-project')
}

function signOut() {
  // Handle sign out
  emit('navigationChanged', 'sign-out')
}

async function loadWorkspaces(orgId: number) {
  try {
    // Replace with actual API call
    const workspaces = await workspaceService.getWorkspacesList()
    // Note: workspaces from service may not have organizationId, so we'll use mock data for now
    availableWorkspaces.value = availableWorkspaces.value.filter(w => w.organizationId === orgId)
  } catch (error) {
    console.error('Failed to load workspaces:', error)
  }
}

onMounted(async () => {
  // Load initial data
  try {
    await loadWorkspaces(currentOrg.value.id)
  } catch (error) {
    console.error('Failed to initialize navigation:', error)
  }
})
</script>

<style scoped lang="scss">
@import '../styles/variables';

.navigation-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 320px;
  background: $color-white;
  border-right: 1px solid $color-gray-200;
  overflow: hidden;
  
  .dx-icon {
    font-size: 16px;
    line-height: 1;
  }
}

.nav-header {
  padding: $spacing-lg;
  border-bottom: 1px solid $color-gray-200;
  background: $color-gray-50;
}

.context-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  
  &:hover {
    background: $color-gray-100;
    border-radius: $border-radius-md;
  }
}

.org-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex: 1;
  padding: $spacing-sm $spacing-md;
}

.org-icon {
  width: 40px;
  height: 40px;
  background: $color-primary-500;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
}

.org-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.org-name {
  font-weight: $font-weight-semibold;
  color: $color-gray-900;
  font-size: $font-size-sm;
}

.workspace-name {
  font-size: $font-size-xs;
  color: $color-gray-600;
}

.context-menu-btn {
  :deep(.dx-button) {
    background: transparent;
    border: none;
  }
}

.nav-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-sm 0;
}

.nav-section {
  &:last-child {
    margin-bottom: 0;
  }
}

.nav-section-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs $spacing-lg;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $color-gray-700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: $spacing-xs;
  
  .section-action {
    margin-left: auto;
    
    :deep(.dx-button) {
      background: transparent;
      border: none;
      color: $color-gray-500;
      
      &:hover {
        color: $color-primary-500;
      }
    }
  }
}

.nav-items {
  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    color: $color-gray-700;
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
    font-size: $font-size-sm;
    
    &:hover {
      background: $color-gray-50;
      color: $color-gray-900;
    }
    
    &.active {
      background: $color-primary-50;
      color: $color-primary-700;
      font-weight: $font-weight-medium;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 3px;
        background: $color-primary-500;
      }
    }
    
    .nav-badge {
      background: $color-primary-500;
      color: $color-white;
      font-size: $font-size-xs;
      padding: 2px 6px;
      border-radius: $border-radius-full;
      margin-left: auto;
      min-width: 18px;
      text-align: center;
      font-weight: $font-weight-medium;
    }
  }
}


.project-tree-nav {
  :deep(.folder-tree) {
    border-right: none;
    background: transparent;
    
    .tree-header {
      display: none; // Hide the tree header completely
    }
    
    .tree-content {
      padding: 0;
    }
    
    // Make tree nodes look like regular nav items
    .tree-node {
      .node-content {
        padding: $spacing-sm $spacing-lg;
        margin: 0;
        border-radius: 0;
        transition: all 0.2s ease;
        
        &:hover {
          background: $color-gray-50;
        }
      }
      
      &.selected .node-content {
        background: $color-primary-50;
        color: $color-primary-700;
        font-weight: $font-weight-medium;
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: $color-primary-500;
        }
        
        &:hover {
          background: $color-primary-50;
        }
      }
      
      // Style badges like nav badges
      .badge-indicator {
        background: $color-primary-500;
        color: $color-white;
        font-size: $font-size-xs;
        padding: 2px 6px;
        border-radius: $border-radius-full;
        min-width: 18px;
        text-align: center;
        font-weight: $font-weight-medium;
      }
    }
  }
}

.nav-footer {
  border-top: 1px solid $color-gray-200;
  padding: $spacing-sm $spacing-lg;
  background: $color-gray-50;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: $color-gray-300;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-gray-600;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-name {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $color-gray-900;
}

.user-role {
  font-size: 10px;
  color: $color-gray-600;
}

.sign-out-btn {
  :deep(.dx-button) {
    background: transparent;
    border: none;
    color: $color-gray-500;
    
    &:hover {
      color: $color-red-500;
    }
  }
}

// Context Menu Popup Styles
.context-menu-content {
  padding: $spacing-lg;
}

.context-section {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    margin: 0 0 $spacing-sm 0;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-gray-700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.context-list {
  .context-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: $font-size-sm;
    
    &:hover {
      background: $color-gray-50;
    }
    
    &.active {
      background: $color-primary-50;
      color: $color-primary-700;
    }
    
    .selected-icon {
      margin-left: auto;
      color: $color-primary-500;
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .navigation-panel {
    width: 280px;
  }
  
  .org-name {
    font-size: $font-size-xs;
  }
  
  .workspace-name {
    font-size: 10px;
  }
  
  .nav-items .nav-item {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
  }
}
</style>