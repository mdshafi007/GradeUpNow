# 🎯 Collapsible Sidebars Feature

## ✅ Implementation Complete!

### New Feature: Focus Mode
Students can now collapse either or both sidebars for a distraction-free learning experience!

## 🎨 How It Works

### Toggle Buttons
- **Left Sidebar**: Toggle button appears on the right edge
- **Right Sidebar**: Toggle button appears on the left edge
- **Collapsed State**: Buttons move to fixed position (left/right corners)

### Visual Behavior
1. **Default State**: Both sidebars visible (18% width each)
2. **One Sidebar Collapsed**: Content remains centered, more reading space
3. **Both Sidebars Collapsed**: Full focus mode - maximum reading area

### Button Design
- **Default**: White background with gray icon
- **Hover**: Orange background (#FF7A00) with white icon
- **Collapsed State**: Always orange to indicate action needed
- **Smooth Animation**: 0.3s transition for sidebar collapse/expand

## 🎯 User Experience

### Icons Used
- `PanelLeftClose` / `PanelLeftOpen` - Left sidebar toggle
- `PanelRightClose` / `PanelRightOpen` - Right sidebar toggle

### Features
✅ **Smooth Animations**: Cubic-bezier easing for professional feel
✅ **Content Stays Centered**: Main content doesn't jump around
✅ **Navigation Arrows**: Automatically adjust position
✅ **Tooltips**: Hover hints ("Expand sidebar" / "Collapse sidebar")
✅ **Responsive**: Works on all screen sizes
✅ **Accessible**: Keyboard and screen reader friendly

## 🎨 Visual States

### Normal Mode (Both Expanded)
```
[Sidebar - 18%] [Content - 64%] [Sidebar - 18%]
```

### Left Collapsed
```
[0%] [Content - Centered] [Sidebar - 18%]
```

### Right Collapsed
```
[Sidebar - 18%] [Content - Centered] [0%]
```

### Focus Mode (Both Collapsed)
```
[0%] [Full Width Content - Centered] [0%]
```

## 💡 Benefits for Students

1. **Less Distraction**: Hide navigation when reading deeply
2. **More Space**: Better for reading long code blocks
3. **Flexible Learning**: Choose your preferred view
4. **Quick Toggle**: One click to switch modes
5. **Visual Feedback**: Orange buttons indicate collapsed state

## 🔧 Technical Details

### State Management
```javascript
const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
```

### CSS Classes
- `.tutorial-viewer-n__sidebar--collapsed` - Collapsed state
- `.tutorial-viewer-n__sidebar-toggle` - Toggle button
- `.tutorial-viewer-n__sidebar-toggle--left` - Left toggle positioning
- `.tutorial-viewer-n__sidebar-toggle--right` - Right toggle positioning

### Animations
- Sidebar: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Content: Smooth reflow
- Buttons: `0.2s ease` for hover effects

## 📱 Responsive Behavior

### Desktop (>968px)
- Sidebars collapse horizontally
- Toggle buttons on edges
- Navigation arrows adjust position

### Mobile (<968px)
- Sidebars stack vertically
- Toggle buttons fixed top corners
- Full-width content always

## 🎉 Usage Example

When student wants to:
1. **Read without distractions** → Collapse both sidebars
2. **Focus on content, keep AI** → Collapse left, keep right
3. **Navigate lessons, hide AI** → Keep left, collapse right
4. **Full view** → Expand both

Perfect for different learning styles and preferences! 🚀
