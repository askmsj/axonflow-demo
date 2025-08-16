# WBS Task Manager Demo

A Vue 3 + DevExpress task management application featuring multiple view modes including Table, List, Kanban, and Calendar views.

## 🚀 Features

- ✅ **Table View** - Spreadsheet-like interface with inline editing
- ✅ **List View** - Hierarchical task list with grouping
- ✅ **Kanban Board** - Drag-and-drop task management
- ✅ **Calendar View** - Timeline-based task scheduling
- ✅ **Dynamic Columns** - Customizable field management
- ✅ **Task CRUD** - Complete task lifecycle management
- ✅ **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **DevExpress** - Professional UI components
- **Vite** - Next generation frontend tooling
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Enhanced CSS with variables and mixins

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd wbs-task-manager-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Build for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── WbsViews/
│       ├── WbsTaskManager.vue     # Main container component
│       ├── WbsTableView.vue       # Spreadsheet view
│       ├── WbsListView.vue        # Hierarchical list
│       ├── WbsKanbanView.vue      # Kanban board
│       ├── WbsCalendarView.vue    # Calendar timeline
│       ├── AddTaskForm.vue        # Task creation form
│       ├── ColumnManager.vue      # Column customization
│       ├── TaskDetailPanel.vue    # Task details sidebar
│       ├── TaskListItem.vue       # List view item
│       ├── KanbanCard.vue         # Kanban task card
│       ├── QuickAddTaskForm.vue   # Quick task creation
│       ├── DynamicField.vue       # Dynamic form field
│       ├── FieldRenderer.vue      # Field value renderer
│       └── ColumnEditor.vue       # Column editor dialog
├── types/
│   └── wbs-task.ts               # TypeScript interfaces
├── App.vue                       # Root component
└── main.js                       # Application entry point
```

## 🎯 Usage

### View Modes

1. **Table View** - Best for data entry and bulk editing
2. **List View** - Ideal for hierarchical task organization
3. **Kanban View** - Perfect for workflow visualization
4. **Calendar View** - Great for timeline planning

### Task Management

- **Create** - Use "Add Task" button or quick add forms
- **Edit** - Click on any field in table view or use detail panel
- **Delete** - Right-click tasks or use action buttons
- **Move** - Drag and drop tasks in Kanban and List views

### Column Customization

- Click "Manage Columns" to show/hide fields
- Drag columns to reorder in table view
- Add custom fields for project-specific data

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code (when configured)
- `npm run format` - Format code (when configured)

### Adding New Features

1. Create new components in `src/components/WbsViews/`
2. Add TypeScript interfaces in `src/types/wbs-task.ts`
3. Update the main `WbsTaskManager.vue` to integrate new features

## 🌐 Demo

### Local Demo
After running `npm run dev`, you can:
- Create sample tasks
- Switch between different views
- Test drag-and-drop functionality
- Customize columns and fields

### Sharing with Claude.ai Web
1. Push this repository to GitHub
2. Share the GitHub URL with Claude.ai
3. Claude can then review the live code and suggest improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

For more detailed documentation about DevExpress components, visit:
- [DevExpress Vue Documentation](https://js.devexpress.com/Vue/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)