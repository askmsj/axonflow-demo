<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>WBS Task Manager Demo</h1>
      <p>Interactive task management with multiple view modes - Table, List, Kanban, and Calendar</p>
    </header>
    
    <main>
      <WbsTaskManager 
        title="Sample Project Tasks"
        :wbs-id="1"
        @task-created="onTaskCreated"
        @task-updated="onTaskUpdated"
        @task-deleted="onTaskDeleted"
      />
    </main>
  </div>
</template>

<script setup>
import WbsTaskManager from './components/WbsViews/WbsTaskManager.vue'

function onTaskCreated(task) {
  console.log('Task created:', task)
}

function onTaskUpdated(task) {
  console.log('Task updated:', task)
}

function onTaskDeleted(taskId) {
  console.log('Task deleted:', taskId)
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8f9fa;
}

.demo-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.demo-header h1 {
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-size: 2.5rem;
  font-weight: 600;
}

.demo-header p {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

main {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-height: 600px;
}

/* DevExpress theme customizations */
.dx-theme-fluent-saas-light {
  --dx-color-primary: #0078d4;
  --dx-color-success: #107c10;
  --dx-color-warning: #ff8c00;
  --dx-color-danger: #d13438;
}
</style>