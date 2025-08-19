<template>
  <div class="folder-tree">
    <div class="tree-header">
      <h3>Project Structure</h3>
      <div class="tree-search">
        <DxTextBox
          v-model="searchTerm"
          placeholder="Search folders..."
          mode="search"
          @value-changed="onSearchChanged"
        />
      </div>
      
      <!-- Filter Controls -->
      <div v-if="selectedFolderId" class="filter-controls">
        <div class="filter-mode-toggle">
          <DxButton
            :text="includeSubfolders ? 'Include Subfolders' : 'This Folder Only'"
            :icon="includeSubfolders ? 'hierarchy' : 'folder'"
            type="normal"
            styling-mode="outlined"
            @click="toggleFilterMode"
            :title="includeSubfolders ? 'Click to show only tasks in this folder' : 'Click to include tasks from subfolders'"
          />
        </div>
        <div class="clear-selection">
          <DxButton
            text="Clear Filter"
            icon="clear"
            type="default"
            styling-mode="text"
            @click="clearSelection"
            title="Show all tasks"
          />
        </div>
      </div>
    </div>
    
    <div class="tree-content">
      <div class="tree-scroll-content">
        <div v-if="isLoading" class="loading-indicator">
          <DxLoadIndicator />
        </div>

        <div v-else-if="displayedFolders.length === 0" class="no-folders">
          <span>No folders found</span>
        </div>
        <!-- <div>{{displayedFolders.length}}</div>
        <div>isLoading: {{isLoading}}</div>
        <div>folderTree length: {{folderTree.length}}</div>
        <div>searchTerm: "{{searchTerm}}"</div>
        <div v-for="(folder, index) in displayedFolders" :key="`debug-${folder.id}-${index}`">
          Debug folder {{index}}: id={{folder.id}}, name="{{folder.name}}, type="{{folder.type}}", hasChildren={{folder.hasChildren}}
        </div> -->
        
        <WbsFolderTreeNode v-for="folder in displayedFolders"
                        :key="`node-${folder.id}`"
                        :node="folder"
                        :selected-folder-id="selectedFolderId"
                        @folder-selected="onFolderSelected"
                        @folder-expanded="onFolderExpanded" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { DxTextBox, DxLoadIndicator, DxButton } from 'devextreme-vue'
import WbsFolderTreeNode from './WbsFolderTreeNode.vue'
import folderService from '@/services/folderService'
import type { FolderTreeNode as FolderTreeNodeType } from '@/services/folderService'
import type { Folder } from '@/Models/generated/folder'

interface Props {
  selectedFolderId?: number | null
  includeSubfolders?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedFolderId: null,
  includeSubfolders: true
})

const emit = defineEmits<{
  folderSelected: [folder: FolderTreeNodeType | null]
  filterModeChanged: [includeSubfolders: boolean]
  clearSelection: []
}>()

const isLoading = ref(true)
const searchTerm = ref('')
const folders = ref<Folder[]>([])
const folderTree = ref<FolderTreeNodeType[]>([])
const expandedFolders = ref<Set<number>>(new Set())
const includeSubfolders = ref(props.includeSubfolders)

const displayedFolders = computed(() => {
  console.log('displayedFolders computed - searchTerm:', `"${searchTerm.value}"`, 'folderTree.length:', folderTree.value.length)
  if (searchTerm.value.trim()) {
    console.log('Using search filter')
    // Simple search implementation for demo
    const searchRecursive = (folders: FolderTreeNodeType[]): FolderTreeNodeType[] => {
      return folders.filter(folder => {
        const nameMatch = folder.name.toLowerCase().includes(searchTerm.value.toLowerCase())
        const childMatch = folder.children && searchRecursive(folder.children).length > 0
        return nameMatch || childMatch
      }).map(folder => ({
        ...folder,
        children: folder.children ? searchRecursive(folder.children) : []
      }))
    }
    return searchRecursive(folderTree.value)
  }
  console.log('Returning raw folderTree.value:', folderTree.value)
  return folderTree.value
})

onMounted(async () => {
  await loadFolders()
})

async function loadFolders() {
  try {
    isLoading.value = true
    console.log('loadFolders started')
    // TODO: Implement API call to load folders
    // For now, using static demo data
    // folders.value = await folderService.getFolders()
    // folderTree.value = folderService.buildFolderTree(folders.value)
    
    // Static demo data
    folderTree.value = [
      {
        id: 1,
        name: 'Project Alpha',
        type: 'project',
        description: 'Main application project',
        level: 0,
        hasChildren: true,
        expanded: true,
        accessible: true,
        children: [
          {
            id: 2,
            name: 'Frontend Development',
            type: 'folder',
            description: 'UI and client-side components',
            level: 1,
            hasChildren: true,
            expanded: false,
            accessible: true,
            children: [
              { 
                id: 3, 
                name: 'Components', 
                type: 'subfolder',
                description: 'Reusable Vue components',
                level: 2,
                hasChildren: false,
                expanded: false, 
                accessible: true,
                children: [] 
              },
              { 
                id: 4, 
                name: 'Views', 
                type: 'subfolder',
                description: 'Application views and pages',
                level: 2,
                hasChildren: false,
                expanded: false, 
                accessible: true,
                children: [] 
              }
            ]
          },
          {
            id: 5,
            name: 'Backend Development',
            type: 'folder',
            description: 'Server-side logic and APIs',
            level: 1,
            hasChildren: true,
            expanded: false,
            accessible: true,
            children: [
              { 
                id: 6, 
                name: 'API Controllers', 
                type: 'subfolder',
                description: 'REST API endpoints',
                level: 2,
                hasChildren: false,
                expanded: false, 
                accessible: true,
                children: [] 
              },
              { 
                id: 7, 
                name: 'Database', 
                type: 'subfolder',
                description: 'Data models and migrations',
                level: 2,
                hasChildren: false,
                expanded: false, 
                accessible: false,
                children: [] 
              }
            ]
          }
        ]
      },
      {
        id: 8,
        name: 'Project Beta',
        type: 'project',
        description: 'Research and development project',
        level: 0,
        hasChildren: true,
        expanded: false,
        accessible: true,
        children: [
          { 
            id: 9, 
            name: 'Research', 
            type: 'folder',
            description: 'Research documentation and findings',
            level: 1,
            hasChildren: false,
            expanded: false, 
            accessible: true,
            children: [] 
          },
          { 
            id: 10, 
            name: 'Prototyping', 
            type: 'folder',
            description: 'Experimental prototypes',
            level: 1,
            hasChildren: false,
            expanded: false, 
            accessible: true,
            children: [] 
          }
        ]
      }
    ]
    console.log('folderTree.value set:', folderTree.value)
  } catch (error) {
    console.error('Error loading folders:', error)
  } finally {
    isLoading.value = false
    console.log('loadFolders finished, isLoading:', isLoading.value)
  }
}

function onFolderSelected(folder: FolderTreeNodeType) {
  emit('folderSelected', folder)
}

function onFolderExpanded(folderId: number, expanded: boolean) {
  if (expanded) {
    expandedFolders.value.add(folderId)
  } else {
    expandedFolders.value.delete(folderId)
  }
  
  const updateExpansion = (nodes: FolderTreeNodeType[]) => {
    nodes.forEach(node => {
      if (node.id === folderId) {
        node.expanded = expanded
      }
      if (node.children) {
        updateExpansion(node.children)
      }
    })
  }
  
  updateExpansion(folderTree.value)
}

function onSearchChanged() {
}

function toggleFilterMode() {
  includeSubfolders.value = !includeSubfolders.value
  emit('filterModeChanged', includeSubfolders.value)
}

function clearSelection() {
  emit('clearSelection')
}

watch(() => props.selectedFolderId, (newValue) => {
  if (newValue === null) {
    emit('folderSelected', null)
  }
})

watch(() => props.includeSubfolders, (newValue) => {
  includeSubfolders.value = newValue
})
</script>

<style scoped lang="scss">
.folder-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-right: 1px solid #e1e5e9;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
  }
}

.tree-search {
  :deep(.dx-texteditor) {
    border-radius: 6px;
  }
}

.filter-controls {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .filter-mode-toggle {
    :deep(.dx-button) {
      font-size: 12px;
      width: 100%;
    }
  }
  
  .clear-selection {
    :deep(.dx-button) {
      font-size: 11px;
      color: #6c757d;
      
      &:hover {
        color: #495057;
      }
    }
  }
}

.tree-content {
  flex: 1;
  overflow: hidden;
}

.tree-scroll-content {
  height: 100%;
  overflow-y: auto;
  padding: 8px 0;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

.no-folders {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  color: #6c757d;
  font-style: italic;
}

:deep(.dx-scrollview-content) {
  padding: 8px 0;
}
</style>
