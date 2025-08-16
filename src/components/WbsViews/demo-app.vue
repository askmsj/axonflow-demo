<template>
  <div class="demo-app">
    <!-- Demo Header -->
    <header class="demo-header">
      <h1>🎯 WBS Task Manager</h1>
      <p>Interactive Vue.js task management with multiple view modes</p>
      <div class="demo-badges">
        <span class="badge">Vue 3</span>
        <span class="badge">TypeScript</span>
        <span class="badge">DevExtreme</span>
        <span class="badge">Responsive</span>
      </div>
    </header>

    <!-- Live Demo -->
    <main class="demo-content">
      <WbsTaskManager 
        title="Sample Project Tasks"
        :wbs-id="1"
        @task-created="onTaskCreated"
        @task-updated="onTaskUpdated"
        @task-deleted="onTaskDeleted"
      />
    </main>

    <!-- Demo Footer -->
    <footer class="demo-footer">
      <p>Try switching between Table, List, Kanban, and Calendar views!</p>
      <p>✨ Create, edit, and manage tasks • 🎨 Customize columns • 📱 Responsive design</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WbsTaskManager from './components/WbsTaskManager.vue'

const notifications = ref([])

function onTaskCreated(task) {
  console.log('✅ Task created:', task.name)
  showNotification(`Created task: ${task.name}`, 'success')
}

function onTaskUpdated(task) {
  console.log('📝 Task updated:', task.name)
  showNotification(`Updated task: ${task.name}`, 'info')
}

function onTaskDeleted(taskId) {
  console.log('🗑️ Task deleted:', taskId)
  showNotification(`Deleted task #${taskId}`, 'warning')
}

function showNotification(message, type) {
  notifications.value.push({ message, type, id: Date.now() })
  setTimeout(() => {
    notifications.value.shift()
  }, 3000)
}
</script>

<style>
/* Global Demo Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: #f8f9fa;
}

.demo-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.demo-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.demo-badges {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.demo-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.demo-footer {
  background: #2c3e50;
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.demo-footer p {
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .demo-header {
    padding: 1.5rem 1rem;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .demo-content {
    padding: 1rem;
  }
}
</style>