<template>
  <div class="tree-node" :class="{ 'selected': isSelected }">
    <!-- <div>Debug: node.id = {{node.id}}</div> -->
    <div 
      class="node-content" 
      :style="{ paddingLeft: `${calculatePaddingLeft()}px` }"
      @click="onNodeClick"
    >
      <div class="node-type-icon">
        <i :class="getTypeIcon(node.type || 'folder')"></i>
      </div>
      
      <div class="node-label">
        <span class="node-name">{{ node.name }}</span>
        <span v-if="node.description" class="node-description">
          {{ node.description }}
        </span>
      </div>
      
      <div class="node-actions">
        <div v-if="node.badgeCount" class="badge-indicator">
          {{ node.badgeCount }}
        </div>
        <div v-if="!node.accessible" class="access-indicator" title="Limited access">
          <i class="dx-icon dx-icon-lock"></i>
        </div>
        <div v-if="node.hasChildren" class="expand-icon" @click.stop="toggleExpanded">
          <i :class="{ 'expanded': node.expanded }">▶</i>
        </div>
      </div>
    </div>
    
    <div v-if="node.expanded && node.children" class="node-children">
      <WbsFolderTreeNode
        v-for="child in node.children"
        :key="`child-${child.id}`"
        :node="child"
        :selected-folder-id="selectedFolderId"
        @folder-selected="onChildFolderSelected"
        @folder-expanded="onChildFolderExpanded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FolderTreeNode } from '@/services/folderService'

interface Props {
  node: FolderTreeNode
  selectedFolderId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedFolderId: null
})

const emit = defineEmits<{
  folderSelected: [folder: FolderTreeNode]
  folderExpanded: [folderId: number, expanded: boolean]
}>()

const isSelected = computed(() => {
  return props.selectedFolderId === props.node.id
})


function calculatePaddingLeft(): number {
  // Standard navigation item padding with indentation for tree levels
  return (props.node.level || 0) * 16 + 16
}

function onNodeClick() {
  emit('folderSelected', props.node)
}

function toggleExpanded() {
  if (props.node.hasChildren) {
    const newExpanded = !props.node.expanded
    props.node.expanded = newExpanded
    emit('folderExpanded', props.node.id!, newExpanded)
  }
}

function onChildFolderSelected(folder: FolderTreeNode) {
  emit('folderSelected', folder)
}

function onChildFolderExpanded(folderId: number, expanded: boolean) {
  emit('folderExpanded', folderId, expanded)
}

function getTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'inbox':
      // Use specific icons based on the node name
      if (props.node.name.toLowerCase().includes('private')) {
        return 'dx-icon dx-icon-user'
      } else if (props.node.name.toLowerCase().includes('team')) {
        return 'dx-icon dx-icon-group'
      } else if (props.node.name.toLowerCase().includes('workspace')) {
        return 'dx-icon dx-icon-home'
      }
      return 'dx-icon dx-icon-message'
    case 'project':
      return 'dx-icon dx-icon-box'
    case 'folder':
      return 'dx-icon dx-icon-folder'
    case 'subfolder':
      return 'dx-icon dx-icon-folder'
    case 'task':
      return 'dx-icon dx-icon-tasks'
    default:
      return 'dx-icon dx-icon-doc'
  }
}
</script>

<style scoped lang="scss">
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 16px 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #495057;

  &:hover {
    background-color: #f8f9fa;
    color: #212529;
  }
}

.selected .node-content {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
  
  &:hover {
    background-color: #e3f2fd;
  }
}

.expand-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 4px;
  
  i {
    font-size: 10px;
    color: #666;
    transition: transform 0.2s ease;
    
    &.expanded {
      transform: rotate(90deg);
    }
    
    &:hover {
      color: #333;
    }
  }
}

.node-type-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #666;
}

.node-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-description {
  font-size: 11px;
  color: #6c757d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.node-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.badge-indicator {
  background: #0078d4;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 12px;
  margin-right: 4px;
  min-width: 16px;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.access-indicator {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffc107;
  
  i {
    font-size: 12px;
  }
}

.node-children {
  // Children are positioned using padding in parent content
}
</style>
