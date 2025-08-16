# WBS Task Manager - Interactive Demo Setup

## Quick Demo Setup for Claude.ai Web

### Method 1: CodeSandbox (Easiest)

1. **Create New Sandbox**:
   - Go to https://codesandbox.io
   - Choose "Vue 3" template
   - Name it "WBS Task Manager Demo"

2. **Upload Files**:
   - Extract your ZIP file
   - Upload components to `/src/components/WbsViews/`
   - Upload `WbsTaskManager.vue` to `/src/components/`
   - Upload `wbs-task.ts` to `/src/types/`

3. **Install Dependencies** (in Dependencies tab):
   ```
   devextreme@23.2.0
   devextreme-vue@23.2.0
   @microsoft/signalr@8.0.7
   mitt@3.0.0
   ```

4. **Update main.js**:
   ```javascript
   import { createApp } from 'vue'
   import App from './App.vue'
   import 'devextreme/dist/css/dx.fluent.saas.light.compact.css'

   createApp(App).mount('#app')
   ```

5. **Update App.vue**:
   ```vue
   <template>
     <div id="app">
       <WbsTaskManager 
         title="WBS Task Demo"
         :wbs-id="1"
       />
     </div>
   </template>

   <script setup>
   import WbsTaskManager from './components/WbsTaskManager.vue'
   </script>

   <style>
   html, body, #app {
     height: 100%;
     margin: 0;
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   }
   </style>
   ```

### Method 2: Vue SFC Playground

1. **Go to**: https://play.vuejs.org
2. **Create single-file demo** by combining components
3. **Add external CDN links**:
   ```html
   <link rel="stylesheet" href="https://cdn3.devexpress.com/jslib/23.2.3/css/dx.fluent.saas.light.compact.css">
   <script src="https://cdn3.devexpress.com/jslib/23.2.3/js/dx.all.js"></script>
   ```

### Method 3: JSFiddle (Simple Demo)

1. **Go to**: https://jsfiddle.net
2. **Create simplified version** with core functionality
3. **Use CDN links** for dependencies
4. **Show single view mode** (e.g., just table view)

## Pre-built Demo Files

### Simplified App.vue for Demo
```vue
<template>
  <div class="demo-container">
    <h1>WBS Task Manager Demo</h1>
    <p>Interactive task management with multiple view modes</p>
    
    <WbsTaskManager 
      title="Sample Project Tasks"
      :wbs-id="1"
      @task-created="onTaskCreated"
      @task-updated="onTaskUpdated"
      @task-deleted="onTaskDeleted"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WbsTaskManager from './components/WbsTaskManager.vue'

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
.demo-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 8px;
}

p {
  color: #6c757d;
  margin-bottom: 24px;
}
</style>
```

### Package.json for Demo
```json
{
  "name": "wbs-task-manager-demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "devextreme": "^23.2.0",
    "devextreme-vue": "^23.2.0",
    "@microsoft/signalr": "^8.0.7",
    "mitt": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "vite": "^4.4.0"
  }
}
```

## Sharing with Claude.ai Web

Once you have the demo running:

1. **Copy the sandbox URL** (e.g., https://codesandbox.io/s/wbs-demo-xyz123)
2. **Share with Claude.ai** by saying:
   ```
   "I have an interactive Vue.js task management demo at [URL]. 
   Can you review the code and suggest improvements?"
   ```

3. **Claude can then**:
   - View the live demo
   - Inspect the source code
   - Suggest improvements
   - Help with features
   - Debug issues

## Demo Features to Highlight

- ✅ **Table View** with inline editing
- ✅ **List View** with grouping
- ✅ **Kanban Board** with drag-and-drop
- ✅ **Calendar View** with scheduling
- ✅ **Dynamic Columns** management
- ✅ **Task CRUD** operations
- ✅ **Responsive Design**

## Tips for Best Demo Experience

1. **Start with Table View** - most familiar to users
2. **Show View Switching** - demonstrate the power
3. **Add Sample Data** - make it look realistic
4. **Enable Interactions** - let users create/edit tasks
5. **Show Column Management** - highlight flexibility