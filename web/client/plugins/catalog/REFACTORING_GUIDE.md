# Catalog Component Refactoring

## Architecture Overview

The catalog UI has been refactored into a modular, reusable component structure following React best practices. This document explains the organization and usage of each component.

## Directory Structure

```
plugins/catalog/
├── components/
│   ├── CatalogWrapper.jsx          # Root container with panel/dialog modes
│   ├── CatalogHeader.jsx           # Header with title and controls
│   ├── CatalogServiceBar.jsx       # Service selection and search
│   ├── CatalogToolbar.jsx          # Action bar with filters and selection
│   ├── CatalogLayerList.jsx        # Scrollable layer cards container
│   ├── CatalogPagination.jsx       # Footer pagination controls
│   ├── CatalogContentView.jsx      # Combined content area
│   └── CatalogLoadingView.jsx      # Loading state component
├── hooks/
│   ├── useCatalogSelection.js      # Layer selection state management
│   └── useCatalogPagination.js     # Pagination calculations
└── containers/
    ├── Catalog.jsx                  # Main container (Redux connected)
    └── CatalogRefactoredExample.jsx # Implementation example
```

## Component Breakdown

### 1. CatalogWrapper
**Purpose**: Root container handling panel vs dialog mode styling
**Props**:
- `isPanel`: boolean - Panel or dialog display mode
- `active`: boolean - Visibility state
- `dockStyle`: object - Docking styles for panel mode
- `children`: React nodes

### 2. CatalogHeader
**Purpose**: Consistent header across modes with back button and close
**Props**:
- `mode`: 'view' | 'edit' - Current catalog mode
- `isPanel`: boolean - Display mode
- `onBackClick`: function - Back button handler
- `onClose`: function - Close button handler
- `children`: React nodes - Additional header content

### 3. CatalogServiceBar
**Purpose**: Service selection and search input section
**Props**:
- `isPanel`: boolean - Adapts layout based on mode
- `ServiceSelectComponent`: Component - Service selector
- `SearchInputComponent`: Component - Search input
- `serviceSelectProps`: object - Props for service select
- `searchInputProps`: object - Props for search input

### 4. CatalogToolbar
**Purpose**: Action bar with layer count, selection, and filters
**Props**:
- `isPanel`: boolean - Layout adaptation
- `total`: number - Total layers count
- `isAllSelected`: boolean - All layers selected state
- `isIndeterminate`: boolean - Partial selection state
- `selectedCount`: number - Number of selected layers
- `onSelectAll`: function - Select all handler
- `onAddSelected`: function - Add selected layers handler
- `onToggleFilters`: function - Toggle filters handler

### 5. CatalogLayerList
**Purpose**: Scrollable container for layer cards with loading overlay
**Props**:
- `records`: array - Layer records to display
- `isPanel`: boolean - Layout mode
- `loading`: boolean - Loading overlay state
- `renderCard`: function - Card renderer function
- `selectedLayers`: array - Currently selected layers
- `onToggleLayer`: function - Layer selection toggle

### 6. CatalogPagination
**Purpose**: Footer pagination controls
**Props**:
- `visible`: boolean - Show/hide pagination
- `currentPage`: number - Active page
- `totalPages`: number - Total page count
- `onPageChange`: function - Page change handler
- `PaginationComponent`: Component - Pagination UI component

### 7. CatalogContentView
**Purpose**: Combined view of toolbar, layer list, and pagination
**Props**: Combination of props from Toolbar, LayerList, and Pagination

### 8. CatalogLoadingView
**Purpose**: Full-height loading indicator
**Props**:
- `message`: string - Loading message (optional)

## Custom Hooks

### useCatalogSelection
**Purpose**: Manages layer selection state
**Returns**:
```javascript
{
  selectedLayers,      // Array of selected layers
  isAllSelected,       // Boolean - all selected
  isIndeterminate,     // Boolean - partial selection
  handleToggleLayer,   // Function(record, checked)
  handleSelectAll,     // Function(checked)
  clearSelection       // Function()
}
```

### useCatalogPagination
**Purpose**: Calculates pagination data from API result
**Parameters**: 
- `result`: object - API search result
- `pageSize`: number - Items per page
**Returns**:
```javascript
{
  currentPage,  // Current page number
  totalPages,   // Total page count
  total,        // Total records
  startIndex    // Start index of current page
}
```

## Usage Example

```jsx
import CatalogWrapper from '../components/CatalogWrapper';
import CatalogHeader from '../components/CatalogHeader';
import CatalogContentView from '../components/CatalogContentView';
import { useCatalogSelection } from '../hooks/useCatalogSelection';
import { useCatalogPagination } from '../hooks/useCatalogPagination';

const MyCatalog = (props) => {
  const {
    selectedLayers,
    handleToggleLayer,
    handleSelectAll,
    isAllSelected,
    isIndeterminate
  } = useCatalogSelection(records);

  const pagination = useCatalogPagination(result, pageSize);

  return (
    <CatalogWrapper isPanel={true} active={true}>
      <CatalogHeader
        mode="view"
        isPanel={true}
        onClose={closeCatalog}
      />
      
      <CatalogContentView
        isPanel={true}
        loading={loading}
        records={records}
        total={pagination.total}
        selectedLayers={selectedLayers}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onToggleLayer={handleToggleLayer}
        renderCard={({ record, isChecked, onToggle }) => (
          <LayerCard 
            record={record} 
            checked={isChecked}
            onCheck={onToggle}
          />
        )}
        paginationProps={pagination}
      />
    </CatalogWrapper>
  );
};
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each component has a single, clear responsibility
2. **Reusability**: Components can be used independently or combined
3. **Testability**: Smaller components are easier to test in isolation
4. **Maintainability**: Changes to one component don't affect others
5. **Composition**: Easy to compose components in different layouts
6. **Custom Hooks**: Reusable logic separated from UI
7. **Type Safety**: Clear prop interfaces make TypeScript integration easier
8. **Performance**: Smaller components optimize re-rendering

## Responsive Modes

The catalog supports two display modes:

### Panel Mode (`isPanel={true}`)
- Vertical layout
- Sidebar-style display
- Service bar separate from header
- Stacked components

### Dialog Mode (`isPanel={false}`)
- Horizontal layout
- Modal/popup style
- Service bar integrated in header
- Grid-based layer display
- Filter sidebar toggle

## Migration Guide

To migrate from the old monolithic component:

1. Replace the large JSX block with `CatalogWrapper`
2. Extract header logic to `CatalogHeader`
3. Move service selection to `CatalogServiceBar`
4. Use `useCatalogSelection` hook for selection state
5. Use `useCatalogPagination` hook for pagination logic
6. Wrap content area with `CatalogContentView`
7. Pass your LayerCard to `renderCard` prop
8. Connect Redux props as before

See `CatalogRefactoredExample.jsx` for a complete implementation.
