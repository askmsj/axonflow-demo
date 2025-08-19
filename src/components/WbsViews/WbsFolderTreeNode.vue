<template>
  <div class="tree-node" :class="{ 'selected': isSelected }">
    <!-- <div>Debug: node.id = {{node.id}}</div> -->
    <div 
      class="node-content" 
      :style="{ paddingLeft: `${(node.level || 0) * 20 + 12}px` }"
      @click="onNodeClick"
    >
      <div class="node-icon">
        <i 
          v-if="node.hasChildren"
          class="expand-icon"
          :class="{ 'expanded': node.expanded }"
          @click.stop="toggleExpanded"
        >
          ▶
        </i>
        <i 
          v-else
          class="leaf-icon"
        >
          ◦
        </i>
      </div>
      
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
        <div v-if="!node.accessible" class="access-indicator" title="Limited access">
          <i class="dx-icon dx-icon-lock"></i>
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
    case 'project':
      return 'dx-icon dx-icon-folder'
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
  padding: 6px 12px 6px 0;
  cursor: pointer;
  border-radius: 4px;
  margin: 1px 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
}

.selected .node-content {
  background-color: #e3f2fd;
  color: #1976d2;
  
  &:hover {
    background-color: #e3f2fd;
  }
}

.node-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.expand-icon {
  font-size: 10px;
  color: #666;
  transition: transform 0.2s ease;
  cursor: pointer;
  
  &.expanded {
    transform: rotate(90deg);
  }
  
  &:hover {
    color: #333;
  }
}

.leaf-icon {
  font-size: 8px;
  color: #ccc;
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
