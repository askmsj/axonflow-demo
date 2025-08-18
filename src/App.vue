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

