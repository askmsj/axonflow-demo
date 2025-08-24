<template>
  <div class="main-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Sidebar Navigation -->
    <div 
      class="sidebar" 
      :style="{ width: sidebarWidth + 'px' }"
      ref="sidebarRef"
    >
      <!-- Collapse/Expand Toggle -->
      <div class="sidebar-toggle">
        <DxButton
          :icon="isSidebarCollapsed ? 'menu' : 'close'"
          styling-mode="text"
          @click="toggleSidebar"
          :title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          class="toggle-btn"
        />
      </div>

      <!-- Navigation Panel (only shown when expanded) -->
      <div v-if="!isSidebarCollapsed" class="navigation-container">
        <NavigationPanel 
          @navigation-changed="handleNavigationChanged"
          @folder-selected="handleFolderSelected"
        />
      </div>

      <!-- Collapsed Navigation Icons -->
      <div v-else class="collapsed-nav">
        <div class="collapsed-nav-item" title="Dashboard" @click="handleCollapsedNavClick('dashboard')">
          <i class="dx-icon dx-icon-datausage"></i>
        </div>
        <div class="collapsed-nav-item" title="Today" @click="handleCollapsedNavClick('today')">
          <i class="dx-icon dx-icon-clock"></i>
          <span class="nav-badge" v-if="todayCount">{{ todayCount }}</span>
        </div>
        <div class="collapsed-nav-item" title="Tasks" @click="handleCollapsedNavClick('projects')">
          <i class="dx-icon dx-icon-hierarchy"></i>
        </div>
      </div>

      <!-- Resize Handle -->
      <div 
        v-if="!isSidebarCollapsed"
        class="resize-handle"
        @mousedown="startResize"
        title="Drag to resize sidebar"
      ></div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Top Header Bar -->
      <header class="main-header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="breadcrumb" v-if="breadcrumb.length">
            <span 
              v-for="(item, index) in breadcrumb" 
              :key="index"
              class="breadcrumb-item"
            >
              {{ item }}
              <i v-if="index < breadcrumb.length - 1" class="dx-icon dx-icon-chevronright"></i>
            </span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="header-actions">
            <!-- Quick Add Button -->
            <DxButton
              text="Quick Add"
              icon="add"
              type="default"
              styling-mode="contained"
              @click="showQuickAdd"
            />
            
            <!-- View Mode Switcher -->
            <DxButtonGroup
              v-if="showViewSwitcher"
              :items="viewModes"
              key-expr="id"
              :selected-item-keys="[currentViewMode]"
              @selection-changed="onViewModeChanged"
              class="view-switcher"
            />

            <!-- Search -->
            <DxTextBox
              placeholder="Search tasks..."
              mode="search"
              @value-changed="onSearch"
              class="header-search"
            />
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="content-area">
        <!-- Task Manager Component -->
        <div v-if="currentView === 'task-manager'" class="task-manager-container">
          <WbsTaskManager 
            :title="selectedFolder ? selectedFolder.name : 'All Tasks'"
            :wbs-id="selectedWbsId"
            :folder-id="selectedFolder?.id"
            :view-mode="currentViewMode"
            @task-created="onTaskCreated"
            @task-updated="onTaskUpdated"
            @task-deleted="onTaskDeleted"
          />
        </div>

        <!-- Dashboard View -->
        <div v-else-if="currentView === 'dashboard'" class="dashboard-container">
          <div class="dashboard-header">
            <h2>Dashboard Overview</h2>
            <div class="date-filter">
              <DxSelectBox
                v-model:value="dashboardPeriod"
                :data-source="periodOptions"
                display-expr="text"
                value-expr="value"
                @value-changed="onPeriodChanged"
              />
            </div>
          </div>

          <!-- Quick Stats Row -->
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-icon projects">
                <i class="dx-icon dx-icon-hierarchy"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardStats.totalProjects }}</div>
                <div class="stat-label">Active Projects</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon tasks">
                <i class="dx-icon dx-icon-bulletlist"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardStats.totalTasks }}</div>
                <div class="stat-label">Total Tasks</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon team">
                <i class="dx-icon dx-icon-group"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardStats.activeEmployees }}</div>
                <div class="stat-label">Active Team</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon cost">
                <i class="dx-icon dx-icon-money"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">${{ formatCurrency(dashboardStats.totalCost) }}</div>
                <div class="stat-label">Total Cost</div>
              </div>
            </div>
          </div>

          <!-- Main Dashboard Grid -->
          <div class="dashboard-grid">
            <!-- Employee Efficiency Section -->
            <div class="dashboard-section">
              <div class="section-header">
                <h3>Employee Efficiency</h3>
                <DxButton text="View Details" styling-mode="text" @click="viewEmployeeDetails" />
              </div>
              <div class="employee-efficiency">
                <div v-for="employee in employeeEfficiency" :key="employee.id" class="efficiency-item">
                  <div class="employee-info">
                    <div class="employee-avatar">
                      <i class="dx-icon dx-icon-user"></i>
                    </div>
                    <div class="employee-details">
                      <div class="employee-name">{{ employee.name }}</div>
                      <div class="employee-role">{{ employee.role }}</div>
                    </div>
                  </div>
                  <div class="efficiency-metrics">
                    <div class="metric-item">
                      <span class="metric-label">Hours</span>
                      <span class="metric-value">{{ employee.hoursWorked }}h</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">Tasks</span>
                      <span class="metric-value">{{ employee.tasksCompleted }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">Efficiency</span>
                      <span class="metric-value efficiency-score" :class="getEfficiencyClass(employee.efficiency)">
                        {{ employee.efficiency }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Project Progress Section -->
            <div class="dashboard-section">
              <div class="section-header">
                <h3>Project Progress</h3>
                <DxButton text="View All" styling-mode="text" @click="viewAllProjects" />
              </div>
              <div class="project-progress">
                <div v-for="project in projectProgress" :key="project.id" class="progress-item">
                  <div class="project-info">
                    <div class="project-name">{{ project.name }}</div>
                    <div class="project-meta">
                      <span class="project-date">Due: {{ formatDate(project.dueDate) }}</span>
                      <span class="project-status" :class="project.status.toLowerCase()">{{ project.status }}</span>
                    </div>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: project.progress + '%' }"
                        :class="getProgressClass(project.progress)"
                      ></div>
                    </div>
                    <span class="progress-text">{{ project.progress }}%</span>
                  </div>
                  <div class="project-cost">
                    <span class="cost-label">Budget:</span>
                    <span class="cost-value">${{ formatCurrency(project.budget) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cost Analysis Section -->
            <div class="dashboard-section cost-section">
              <div class="section-header">
                <h3>Cost Analysis</h3>
                <DxButton text="Financial Report" styling-mode="text" @click="viewFinancialReport" />
              </div>
              <div class="cost-overview">
                <div class="cost-summary">
                  <div class="cost-item">
                    <div class="cost-category">
                      <i class="dx-icon dx-icon-chart"></i>
                      <span>Planned Budget</span>
                    </div>
                    <div class="cost-amount planned">${{ formatCurrency(costAnalysis.plannedBudget) }}</div>
                  </div>
                  <div class="cost-item">
                    <div class="cost-category">
                      <i class="dx-icon dx-icon-money"></i>
                      <span>Actual Spent</span>
                    </div>
                    <div class="cost-amount actual">${{ formatCurrency(costAnalysis.actualSpent) }}</div>
                  </div>
                  <div class="cost-item">
                    <div class="cost-category">
                      <i class="dx-icon dx-icon-clock"></i>
                      <span>Labor Cost</span>
                    </div>
                    <div class="cost-amount labor">${{ formatCurrency(costAnalysis.laborCost) }}</div>
                  </div>
                  <div class="cost-item">
                    <div class="cost-category">
                      <i class="dx-icon dx-icon-box"></i>
                      <span>Resources</span>
                    </div>
                    <div class="cost-amount resources">${{ formatCurrency(costAnalysis.resourceCost) }}</div>
                  </div>
                </div>
                <div class="cost-variance">
                  <div class="variance-item">
                    <span class="variance-label">Budget Variance:</span>
                    <span 
                      class="variance-value" 
                      :class="costAnalysis.variance >= 0 ? 'positive' : 'negative'"
                    >
                      {{ costAnalysis.variance >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(costAnalysis.variance)) }}
                    </span>
                  </div>
                  <div class="variance-item">
                    <span class="variance-label">Cost per Task:</span>
                    <span class="variance-value">${{ formatCurrency(costAnalysis.costPerTask) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activity Section -->
            <div class="dashboard-section activity-section">
              <div class="section-header">
                <h3>Recent Activity</h3>
                <DxButton text="View All" styling-mode="text" @click="viewAllActivity" />
              </div>
              <div class="activity-feed">
                <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                  <div class="activity-icon" :class="activity.type">
                    <i :class="`dx-icon dx-icon-${activity.icon}`"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">{{ activity.description }}</div>
                    <div class="activity-meta">
                      <span class="activity-user">{{ activity.user }}</span>
                      <span class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Private Inbox View -->
        <div v-else-if="currentView === 'inbox-private'" class="inbox-container">
          <div class="inbox-header">
            <div class="inbox-title">
              <i class="dx-icon dx-icon-user"></i>
              <h2>Private Inbox</h2>
            </div>
            <p>Personal tasks and notifications assigned specifically to you</p>
          </div>
          <div class="inbox-content">
            <div class="empty-state" v-if="privateInboxItems.length === 0">
              <i class="dx-icon dx-icon-user"></i>
              <h3>Private inbox is empty</h3>
              <p>You have no personal tasks pending.</p>
            </div>
            <div v-else class="inbox-items">
              <div v-for="item in privateInboxItems" :key="item.id" class="inbox-item">
                <div class="inbox-item-icon private">
                  <i :class="`dx-icon dx-icon-${item.icon}`"></i>
                </div>
                <div class="inbox-item-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <div class="inbox-item-meta">
                    <span class="inbox-priority" :class="item.priority">{{ item.priority }}</span>
                    <span class="inbox-date">{{ formatTimeAgo(item.createdAt) }}</span>
                  </div>
                </div>
                <div class="inbox-item-actions">
                  <DxButton text="Process" type="default" styling-mode="outlined" @click="processItem(item)" />
                  <DxButton icon="close" styling-mode="text" @click="dismissItem(item)" title="Dismiss" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Inbox View -->
        <div v-else-if="currentView === 'inbox-team'" class="inbox-container">
          <div class="inbox-header">
            <div class="inbox-title">
              <i class="dx-icon dx-icon-group"></i>
              <h2>Team Inbox</h2>
            </div>
            <p>Shared team notifications and collaborative tasks</p>
          </div>
          <div class="inbox-content">
            <div class="empty-state" v-if="teamInboxItems.length === 0">
              <i class="dx-icon dx-icon-group"></i>
              <h3>Team inbox is empty</h3>
              <p>No team activities at the moment.</p>
            </div>
            <div v-else class="inbox-items">
              <div v-for="item in teamInboxItems" :key="item.id" class="inbox-item">
                <div class="inbox-item-icon team">
                  <i :class="`dx-icon dx-icon-${item.icon}`"></i>
                </div>
                <div class="inbox-item-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <div class="inbox-item-meta">
                    <span class="inbox-from">From: {{ item.from }}</span>
                    <span class="inbox-date">{{ formatTimeAgo(item.createdAt) }}</span>
                  </div>
                </div>
                <div class="inbox-item-actions">
                  <DxButton text="View" type="default" styling-mode="outlined" @click="viewTeamItem(item)" />
                  <DxButton text="Reply" styling-mode="text" @click="replyToItem(item)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace Inbox View -->
        <div v-else-if="currentView === 'inbox-workspace'" class="inbox-container">
          <div class="inbox-header">
            <div class="inbox-title">
              <i class="dx-icon dx-icon-home"></i>
              <h2>Workspace Inbox</h2>
            </div>
            <p>Workspace-wide announcements and organizational updates</p>
          </div>
          <div class="inbox-content">
            <div class="empty-state" v-if="workspaceInboxItems.length === 0">
              <i class="dx-icon dx-icon-home"></i>
              <h3>Workspace inbox is empty</h3>
              <p>No workspace announcements.</p>
            </div>
            <div v-else class="inbox-items">
              <div v-for="item in workspaceInboxItems" :key="item.id" class="inbox-item">
                <div class="inbox-item-icon workspace">
                  <i :class="`dx-icon dx-icon-${item.icon}`"></i>
                </div>
                <div class="inbox-item-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <div class="inbox-item-meta">
                    <span class="inbox-category">{{ item.category }}</span>
                    <span class="inbox-date">{{ formatTimeAgo(item.createdAt) }}</span>
                  </div>
                </div>
                <div class="inbox-item-actions">
                  <DxButton text="Read More" type="default" styling-mode="outlined" @click="readWorkspaceItem(item)" />
                  <DxButton text="Archive" styling-mode="text" @click="archiveItem(item)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Views Placeholder -->
        <div v-else class="view-placeholder">
          <div class="placeholder-content">
            <i class="dx-icon dx-icon-box"></i>
            <h3>{{ pageTitle }}</h3>
            <p>This view is under development.</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Quick Add Modal -->
    <DxPopup
      v-model:visible="quickAddVisible"
      title="Quick Add Task"
      :width="500"
      :height="400"
      :close-on-outside-click="false"
    >
      <div class="quick-add-form">
        <div class="form-group">
          <label>Task Title *</label>
          <DxTextBox
            v-model:value="quickAddData.title"
            placeholder="Enter task title"
          />
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <DxTextArea
            v-model:value="quickAddData.description"
            placeholder="Enter task description"
            :height="80"
          />
        </div>
        
        <div class="form-group">
          <label>Priority</label>
          <DxSelectBox
            v-model:value="quickAddData.priority"
            :data-source="priorityOptions.dataSource"
            display-expr="text"
            value-expr="value"
          />
        </div>
        
        <div class="form-group">
          <label>Due Date</label>
          <DxDateBox
            v-model:value="quickAddData.dueDate"
            type="date"
          />
        </div>
        
        <div class="quick-add-actions">
          <DxButton
            text="Cancel"
            type="normal"
            styling-mode="outlined"
            @click="quickAddVisible = false"
          />
          <DxButton
            text="Add Task"
            type="default"
            @click="createQuickTask"
          />
        </div>
      </div>
    </DxPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  DxButton, 
  DxButtonGroup, 
  DxTextBox, 
  DxPopup,
  DxTextArea,
  DxSelectBox,
  DxDateBox
} from 'devextreme-vue'
import NavigationPanel from './NavigationPanel.vue'
import WbsTaskManager from './WbsViews/WbsTaskManager.vue'
import type { FolderTreeNode } from '../services/folderService'

interface ViewMode {
  id: string
  text: string
  icon: string
}

interface QuickAddData {
  title: string
  description: string
  priority: string
  dueDate: Date | null
}

// Sidebar state
const isSidebarCollapsed = ref(false)
const sidebarWidth = ref(320)
const minSidebarWidth = 250
const maxSidebarWidth = 500
const sidebarRef = ref<HTMLElement>()

// Navigation state
const currentView = ref('task-manager')
const selectedFolder = ref<FolderTreeNode | null>(null)
const selectedWbsId = ref(1)

// View mode state
const currentViewMode = ref('table')
const viewModes = ref<ViewMode[]>([
  { id: 'table', text: 'Table', icon: 'table' },
  { id: 'list', text: 'List', icon: 'bulletlist' },
  { id: 'kanban', text: 'Kanban', icon: 'column' },
  { id: 'calendar', text: 'Calendar', icon: 'event' }
])

// Quick add state
const quickAddVisible = ref(false)
const quickAddData = ref<QuickAddData>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: null
})

const priorityOptions = {
  dataSource: [
    { value: 'low', text: 'Low' },
    { value: 'medium', text: 'Medium' },
    { value: 'high', text: 'High' }
  ],
  displayExpr: 'text',
  valueExpr: 'value'
}

// Mock data
const todayCount = ref(12)
const projectCount = ref(8)
const teamCount = ref(15)

// Dashboard data
const dashboardPeriod = ref('week')
const periodOptions = [
  { value: 'week', text: 'This Week' },
  { value: 'month', text: 'This Month' },
  { value: 'quarter', text: 'This Quarter' },
  { value: 'year', text: 'This Year' }
]

const dashboardStats = ref({
  totalProjects: 12,
  totalTasks: 145,
  activeEmployees: 8,
  totalCost: 285000
})

const employeeEfficiency = ref([
  {
    id: 1,
    name: 'John Doe',
    role: 'Senior Developer',
    hoursWorked: 38,
    tasksCompleted: 12,
    efficiency: 94,
    hourlyRate: 85
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Project Manager',
    hoursWorked: 42,
    tasksCompleted: 8,
    efficiency: 87,
    hourlyRate: 90
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'UI/UX Designer',
    hoursWorked: 35,
    tasksCompleted: 15,
    efficiency: 91,
    hourlyRate: 70
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    role: 'Frontend Developer',
    hoursWorked: 40,
    tasksCompleted: 18,
    efficiency: 96,
    hourlyRate: 75
  }
])

const projectProgress = ref([
  {
    id: 1,
    name: 'E-commerce Platform',
    progress: 75,
    status: 'On Track',
    dueDate: new Date('2024-03-15'),
    budget: 120000,
    spent: 89000
  },
  {
    id: 2,
    name: 'Mobile App Development',
    progress: 45,
    status: 'At Risk',
    dueDate: new Date('2024-04-20'),
    budget: 85000,
    spent: 42000
  },
  {
    id: 3,
    name: 'Dashboard Analytics',
    progress: 90,
    status: 'On Track',
    dueDate: new Date('2024-02-28'),
    budget: 65000,
    spent: 58000
  },
  {
    id: 4,
    name: 'Security Audit',
    progress: 30,
    status: 'Delayed',
    dueDate: new Date('2024-05-10'),
    budget: 45000,
    spent: 15000
  }
])

const costAnalysis = ref({
  plannedBudget: 315000,
  actualSpent: 204000,
  laborCost: 156000,
  resourceCost: 48000,
  variance: -111000,
  costPerTask: 1407
})

const recentActivity = ref([
  {
    id: 1,
    type: 'task',
    icon: 'check',
    description: 'Task "User Authentication" completed',
    user: 'John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
  },
  {
    id: 2,
    type: 'project',
    icon: 'hierarchy',
    description: 'New project "API Gateway" created',
    user: 'Jane Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  },
  {
    id: 3,
    type: 'cost',
    icon: 'money',
    description: 'Budget updated for E-commerce Platform',
    user: 'Sarah Wilson',
    timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
  },
  {
    id: 4,
    type: 'team',
    icon: 'user',
    description: 'Mike Johnson assigned to Mobile App project',
    user: 'Jane Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
  }
])

// Inbox data for different types
const privateInboxItems = ref([
  {
    id: 1,
    title: 'Task Assignment: Update User Profile',
    description: 'You have been assigned to update the user profile component',
    icon: 'bulletlist',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 2,
    title: 'Code Review Required',
    description: 'Please review the authentication module pull request',
    icon: 'check',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
  },
  {
    id: 3,
    title: 'Meeting Reminder',
    description: 'Sprint planning meeting in 15 minutes',
    icon: 'clock',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  }
])

const teamInboxItems = ref([
  {
    id: 1,
    title: 'New Team Member Joined',
    description: 'Alex Thompson has joined the development team',
    icon: 'user',
    from: 'HR Department',
    createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    id: 2,
    title: 'Sprint Retrospective Notes',
    description: 'Team retrospective meeting notes are now available',
    icon: 'doc',
    from: 'Scrum Master',
    createdAt: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
  },
  {
    id: 3,
    title: 'Team Performance Update',
    description: 'Monthly team performance metrics have been published',
    icon: 'chart',
    from: 'Project Manager',
    createdAt: new Date(Date.now() - 1000 * 60 * 240) // 4 hours ago
  },
  {
    id: 4,
    title: 'Code Standards Updated',
    description: 'New coding standards and best practices document',
    icon: 'preferences',
    from: 'Tech Lead',
    createdAt: new Date(Date.now() - 1000 * 60 * 300) // 5 hours ago
  },
  {
    id: 5,
    title: 'Team Building Event',
    description: 'Virtual team building event scheduled for next Friday',
    icon: 'event',
    from: 'Team Lead',
    createdAt: new Date(Date.now() - 1000 * 60 * 360) // 6 hours ago
  },
  {
    id: 6,
    title: 'Knowledge Sharing Session',
    description: 'Tech talk on microservices architecture next week',
    icon: 'hierarchy',
    from: 'Senior Developer',
    createdAt: new Date(Date.now() - 1000 * 60 * 420) // 7 hours ago
  },
  {
    id: 7,
    title: 'Project Milestone Achieved',
    description: 'Successfully completed Phase 1 of the mobile app project',
    icon: 'check',
    from: 'Project Manager',
    createdAt: new Date(Date.now() - 1000 * 60 * 480) // 8 hours ago
  },
  {
    id: 8,
    title: 'Resource Request',
    description: 'Additional development resources requested for Q2',
    icon: 'group',
    from: 'Department Head',
    createdAt: new Date(Date.now() - 1000 * 60 * 540) // 9 hours ago
  }
])

const workspaceInboxItems = ref([
  {
    id: 1,
    title: 'New Company Policy',
    description: 'Updated remote work policy effective immediately',
    icon: 'doc',
    category: 'Policy',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 2,
    title: 'System Maintenance',
    description: 'Scheduled maintenance window this weekend',
    icon: 'preferences',
    category: 'IT',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  }
])

// Computed properties
const pageTitle = computed(() => {
  switch (currentView.value) {
    case 'task-manager':
      return selectedFolder.value ? selectedFolder.value.name : 'All Tasks'
    case 'dashboard':
      return 'Dashboard'
    case 'inbox':
      return 'Inbox'
    case 'inbox-private':
      return 'Private Inbox'
    case 'inbox-team':
      return 'Team Inbox'
    case 'inbox-workspace':
      return 'Workspace Inbox'
    case 'today':
      return 'Today'
    case 'upcoming':
      return 'Upcoming'
    case 'starred':
      return 'Starred'
    default:
      return 'Project Manager'
  }
})

const breadcrumb = computed(() => {
  if (!selectedFolder.value) return []
  
  const crumbs = []
  let current = selectedFolder.value
  
  while (current) {
    crumbs.unshift(current.name)
    current = current.parent // Assuming parent relationship exists
  }
  
  return crumbs
})

const showViewSwitcher = computed(() => {
  return ['task-manager'].includes(currentView.value)
})

// Resize functionality
let isResizing = false

function startResize(event: MouseEvent) {
  isResizing = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  event.preventDefault()
}

function handleResize(event: MouseEvent) {
  if (!isResizing) return
  
  const newWidth = event.clientX
  if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
    sidebarWidth.value = newWidth
  }
}

function stopResize() {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Navigation functions
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  
  if (isSidebarCollapsed.value) {
    sidebarWidth.value = 60
  } else {
    sidebarWidth.value = 320
  }
}

function handleNavigationChanged(item: string, data?: any) {
  currentView.value = item
  
  if (item === 'workspace-changed') {
    // Handle workspace change
    console.log('Workspace changed to:', data)
  }
}

function handleFolderSelected(folder: FolderTreeNode | null) {
  selectedFolder.value = folder
  currentView.value = 'task-manager'
  selectedWbsId.value = folder?.id || 1
}

function handleCollapsedNavClick(item: string) {
  currentView.value = item
  
  // Optionally expand sidebar when clicked
  if (item === 'projects') {
    isSidebarCollapsed.value = false
    sidebarWidth.value = 320
  }
}

// View mode functions
function onViewModeChanged(e: any) {
  if (e.addedItems?.length) {
    currentViewMode.value = e.addedItems[0].id
  }
}

// Search function
function onSearch(e: any) {
  const searchTerm = e.value
  console.log('Search:', searchTerm)
  // Implement search functionality
}

// Quick add functions
function showQuickAdd() {
  quickAddData.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null
  }
  quickAddVisible.value = true
}

function createQuickTask() {
  if (!quickAddData.value.title.trim()) {
    // Simple validation - you could add toast notification here
    alert('Task title is required')
    return
  }
  
  console.log('Creating quick task:', quickAddData.value)
  
  // Emit task creation
  onTaskCreated({
    ...quickAddData.value,
    id: Date.now(), // Temporary ID
    status: 'new',
    createdAt: new Date()
  })
  
  quickAddVisible.value = false
}

// Task event handlers
function onTaskCreated(task: any) {
  console.log('Task created:', task)
}

function onTaskUpdated(task: any) {
  console.log('Task updated:', task)
}

function onTaskDeleted(taskId: any) {
  console.log('Task deleted:', taskId)
}

// Dashboard helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

function getEfficiencyClass(efficiency: number): string {
  if (efficiency >= 90) return 'excellent'
  if (efficiency >= 80) return 'good'
  if (efficiency >= 70) return 'average'
  return 'poor'
}

function getProgressClass(progress: number): string {
  if (progress >= 80) return 'high'
  if (progress >= 50) return 'medium'
  return 'low'
}

// Dashboard event handlers
function onPeriodChanged() {
  // Refresh dashboard data based on selected period
  console.log('Period changed to:', dashboardPeriod.value)
  // TODO: Implement API call to refresh data
}

function viewEmployeeDetails() {
  console.log('Viewing employee details')
  // TODO: Navigate to employee details view
}

function viewAllProjects() {
  console.log('Viewing all projects')
  // TODO: Navigate to projects view
}

function viewFinancialReport() {
  console.log('Viewing financial report')
  // TODO: Navigate to financial report
}

function viewAllActivity() {
  console.log('Viewing all activity')
  // TODO: Navigate to activity log
}

// Inbox action handlers
function processItem(item: any) {
  console.log('Processing item:', item)
  // Remove item from private inbox after processing
  const index = privateInboxItems.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    privateInboxItems.value.splice(index, 1)
  }
  // TODO: Implement actual processing logic
}

function dismissItem(item: any) {
  console.log('Dismissing item:', item)
  // Remove item from private inbox
  const index = privateInboxItems.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    privateInboxItems.value.splice(index, 1)
  }
}

function viewTeamItem(item: any) {
  console.log('Viewing team item:', item)
  // TODO: Navigate to detailed team item view
}

function replyToItem(item: any) {
  console.log('Replying to item:', item)
  // TODO: Open reply dialog/modal
}

function readWorkspaceItem(item: any) {
  console.log('Reading workspace item:', item)
  // TODO: Navigate to detailed workspace item view
}

function archiveItem(item: any) {
  console.log('Archiving item:', item)
  // Remove item from workspace inbox after archiving
  const index = workspaceInboxItems.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    workspaceInboxItems.value.splice(index, 1)
  }
}

// Lifecycle
onMounted(() => {
  // Initialize layout
})

onUnmounted(() => {
  // Cleanup resize listeners
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
@import '../styles/variables';

.main-layout {
  display: flex;
  height: 100vh;
  background: $color-gray-50;
  overflow: hidden;
  
  .dx-icon {
    font-size: 16px;
    line-height: 1;
  }
  
  &.sidebar-collapsed {
    .sidebar {
      .navigation-container {
        display: none;
      }
    }
  }
}

.sidebar {
  position: relative;
  background: $color-white;
  border-right: 1px solid $color-gray-200;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  min-width: 60px;
  z-index: 100;
}

.sidebar-toggle {
  padding: $spacing-md;
  border-bottom: 1px solid $color-gray-200;
  display: flex;
  justify-content: flex-end;
  
  .toggle-btn {
    :deep(.dx-button) {
      background: transparent;
      border: none;
      color: $color-gray-600;
      
      &:hover {
        background: $color-gray-100;
        color: $color-gray-900;
      }
    }
  }
}

.navigation-container {
  flex: 1;
  overflow: hidden;
}

.collapsed-nav {
  flex: 1;
  padding: $spacing-md 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  align-items: center;
}

.collapsed-nav-item {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-md;
  cursor: pointer;
  color: $color-gray-600;
  transition: all 0.2s ease;
  
  &:hover {
    background: $color-gray-100;
    color: $color-gray-900;
  }
  
  .nav-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: $color-primary-500;
    color: $color-white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: $border-radius-full;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: $font-weight-medium;
  }
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -2px;
  width: 4px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  z-index: 10;
  
  &:hover {
    background: $color-primary-300;
  }
  
  &:active {
    background: $color-primary-500;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background: $color-white;
  border-bottom: 1px solid $color-gray-200;
  padding: $spacing-lg $spacing-xl;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: $shadow-sm;
  z-index: 50;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.page-title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-gray-900;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-gray-600;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.view-switcher {
  :deep(.dx-buttongroup) {
    .dx-button {
      font-size: $font-size-sm;
      padding: $spacing-sm $spacing-md;
    }
  }
}

.header-search {
  width: 300px;
  
  :deep(.dx-texteditor) {
    border-radius: $border-radius-md;
  }
}

.content-area {
  flex: 1;
  overflow: hidden;
  padding: $spacing-xl;
  background: $color-gray-50;
}

.task-manager-container,
.dashboard-container,
.inbox-container {
  height: 100%;
  background: $color-white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-xl $spacing-xl $spacing-lg $spacing-xl;
  
  h2 {
    margin: 0;
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    color: $color-gray-900;
  }
  
  .date-filter {
    width: 160px;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-lg;
  padding: 0 $spacing-xl $spacing-xl $spacing-xl;
}

.stat-card {
  background: $color-white;
  border: 1px solid $color-gray-200;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  box-shadow: $shadow-sm;
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: $color-white;
    
    &.projects {
      background: $color-primary-500;
    }
    
    &.tasks {
      background: #10b981;
    }
    
    &.team {
      background: #f59e0b;
    }
    
    &.cost {
      background: #ef4444;
    }
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-value {
    font-size: 1.875rem;
    font-weight: $font-weight-bold;
    color: $color-gray-900;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: $font-size-sm;
    color: $color-gray-600;
    font-weight: $font-weight-medium;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-xl;
  padding: 0 $spacing-xl $spacing-xl $spacing-xl;
  
  .dashboard-section {
    background: $color-white;
    border: 1px solid $color-gray-200;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    overflow: hidden;
    
    &.cost-section,
    &.activity-section {
      grid-column: span 1;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $color-gray-200;
  background: $color-gray-50;
  
  h3 {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-gray-900;
  }
}

// Employee Efficiency Styles
.employee-efficiency {
  padding: $spacing-lg;
}

.efficiency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 1px solid $color-gray-100;
  
  &:last-child {
    border-bottom: none;
  }
}

.employee-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex: 1;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  background: $color-gray-300;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-gray-600;
}

.employee-details {
  .employee-name {
    font-weight: $font-weight-medium;
    color: $color-gray-900;
    font-size: $font-size-sm;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .employee-role {
    font-size: $font-size-xs;
    color: $color-gray-600;
  }
}

.efficiency-metrics {
  display: flex;
  gap: $spacing-lg;
  
  .metric-item {
    text-align: center;
    
    .metric-label {
      display: block;
      font-size: $font-size-xs;
      color: $color-gray-600;
      margin-bottom: 4px;
    }
    
    .metric-value {
      font-weight: $font-weight-semibold;
      color: $color-gray-900;
      font-size: $font-size-sm;
      
      &.efficiency-score {
        &.excellent {
          color: #10b981;
        }
        
        &.good {
          color: #22d3ee;
        }
        
        &.average {
          color: #f59e0b;
        }
        
        &.poor {
          color: #ef4444;
        }
      }
    }
  }
}

// Project Progress Styles
.project-progress {
  padding: $spacing-lg;
}

.progress-item {
  padding: $spacing-md 0;
  border-bottom: 1px solid $color-gray-100;
  
  &:last-child {
    border-bottom: none;
  }
}

.project-info {
  margin-bottom: $spacing-sm;
  
  .project-name {
    font-weight: $font-weight-medium;
    color: $color-gray-900;
    font-size: $font-size-sm;
    margin-bottom: 4px;
  }
  
  .project-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .project-date {
      font-size: $font-size-xs;
      color: $color-gray-600;
    }
    
    .project-status {
      font-size: $font-size-xs;
      padding: 2px 8px;
      border-radius: $border-radius-md;
      font-weight: $font-weight-medium;
      
      &.on-track {
        background: #d1fae5;
        color: #065f46;
      }
      
      &.at-risk {
        background: #fef3c7;
        color: #92400e;
      }
      
      &.delayed {
        background: #fee2e2;
        color: #991b1b;
      }
    }
  }
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: $color-gray-200;
  border-radius: $border-radius-md;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    border-radius: $border-radius-md;
    transition: width 0.3s ease;
    
    &.high {
      background: #10b981;
    }
    
    &.medium {
      background: #f59e0b;
    }
    
    &.low {
      background: #ef4444;
    }
  }
}

.progress-text {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $color-gray-600;
  min-width: 35px;
}

.project-cost {
  display: flex;
  justify-content: space-between;
  
  .cost-label {
    font-size: $font-size-xs;
    color: $color-gray-600;
  }
  
  .cost-value {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $color-gray-900;
  }
}

// Cost Analysis Styles
.cost-overview {
  padding: $spacing-lg;
}

.cost-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: $color-gray-50;
  border-radius: $border-radius-md;
  
  .cost-category {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    color: $color-gray-700;
    
    .dx-icon {
      font-size: 16px;
    }
  }
  
  .cost-amount {
    font-weight: $font-weight-semibold;
    
    &.planned {
      color: $color-primary-600;
    }
    
    &.actual {
      color: #ef4444;
    }
    
    &.labor {
      color: #10b981;
    }
    
    &.resources {
      color: #f59e0b;
    }
  }
}

.cost-variance {
  padding-top: $spacing-md;
  border-top: 1px solid $color-gray-200;
  
  .variance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-xs 0;
    
    .variance-label {
      font-size: $font-size-sm;
      color: $color-gray-700;
    }
    
    .variance-value {
      font-weight: $font-weight-semibold;
      
      &.positive {
        color: #10b981;
      }
      
      &.negative {
        color: #ef4444;
      }
    }
  }
}

// Activity Feed Styles
.activity-feed {
  padding: $spacing-lg;
}

.activity-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $color-gray-100;
  
  &:last-child {
    border-bottom: none;
  }
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  font-size: 14px;
  flex-shrink: 0;
  
  &.task {
    background: #10b981;
  }
  
  &.project {
    background: $color-primary-500;
  }
  
  &.cost {
    background: #ef4444;
  }
  
  &.team {
    background: #f59e0b;
  }
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: $font-size-sm;
  color: $color-gray-900;
  line-height: 1.4;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  gap: $spacing-sm;
  
  .activity-user {
    font-size: $font-size-xs;
    color: $color-primary-600;
    font-weight: $font-weight-medium;
  }
  
  .activity-time {
    font-size: $font-size-xs;
    color: $color-gray-500;
  }
}

.inbox-container {
  display: flex;
  flex-direction: column;
}

.inbox-header {
  padding: $spacing-xl;
  border-bottom: 1px solid $color-gray-200;
  
  h2 {
    margin: 0 0 $spacing-sm 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-gray-900;
  }
  
  p {
    margin: 0;
    color: $color-gray-600;
  }
}

.inbox-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-xl;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: $color-gray-500;
  
  .dx-icon {
    font-size: 4rem;
    margin-bottom: $spacing-lg;
  }
  
  h3 {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
  }
  
  p {
    margin: 0;
    font-size: $font-size-sm;
  }
}

.inbox-items {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.inbox-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $color-gray-50;
  border-radius: $border-radius-md;
  border: 1px solid $color-gray-200;
  
  &:hover {
    border-color: $color-primary-300;
  }
}

.inbox-item-icon {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  font-size: 18px;
  flex-shrink: 0;
  
  &.private {
    background: $color-primary-500;
  }
  
  &.team {
    background: #10b981;
  }
  
  &.workspace {
    background: #f59e0b;
  }
}

.inbox-item-content {
  flex: 1;
  
  h4 {
    margin: 0 0 $spacing-xs 0;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    color: $color-gray-900;
  }
  
  p {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-gray-600;
  }
}

.inbox-item-meta {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-top: $spacing-xs;
  
  .inbox-priority {
    font-size: $font-size-xs;
    padding: 2px 8px;
    border-radius: $border-radius-md;
    font-weight: $font-weight-medium;
    text-transform: uppercase;
    
    &.high {
      background: #fee2e2;
      color: #991b1b;
    }
    
    &.medium {
      background: #fef3c7;
      color: #92400e;
    }
    
    &.low {
      background: #d1fae5;
      color: #065f46;
    }
  }
  
  .inbox-from,
  .inbox-category {
    font-size: $font-size-xs;
    color: $color-primary-600;
    font-weight: $font-weight-medium;
  }
  
  .inbox-date {
    font-size: $font-size-xs;
    color: $color-gray-500;
  }
}

.inbox-item-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.view-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.placeholder-content {
  text-align: center;
  color: $color-gray-500;
  
  .dx-icon {
    font-size: 4rem;
    margin-bottom: $spacing-lg;
  }
  
  h3 {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
  }
  
  p {
    margin: 0;
    font-size: $font-size-sm;
  }
}

.quick-add-form {
  padding: $spacing-lg;
  
  .form-group {
    margin-bottom: $spacing-lg;
    
    label {
      display: block;
      margin-bottom: $spacing-sm;
      font-weight: $font-weight-medium;
      color: $color-gray-700;
      font-size: $font-size-sm;
    }
  }
}

.quick-add-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-xl;
}

// Responsive Design
@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    gap: $spacing-lg;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $spacing-md;
  }
  
  .header-search {
    width: 100%;
    order: -1;
  }
  
  .content-area {
    padding: $spacing-md;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    padding: $spacing-md;
  }
}
</style>