# Theme System Documentation

## Overview

The Rupomoti project now features a comprehensive theme system with the following capabilities:

1. **Light Mode Main Site**: The main customer-facing site is always in light mode
2. **Admin Theme Toggle**: Admin dashboard can toggle between light and dark themes
3. **Custom Color Management**: Super admins can customize theme colors
4. **Theme Isolation**: Admin and main site themes are completely isolated

## Architecture

### Main Site Theme
- **Always Light**: The main site is forced to stay in light mode
- **Brand Colors**: Uses the elegant pearl essence color palette
- **No System Override**: System dark mode preference is ignored for main site

### Admin Theme
- **Toggle Support**: Light/Dark mode toggle for admin dashboard only
- **Permission Based**: Only Super Admins and developers can change themes
- **Isolated Storage**: Admin theme preferences stored separately from main site

### Custom Colors
- **Dynamic Colors**: 8 customizable theme colors
- **Real-time Updates**: Colors update immediately when changed
- **Persistent Storage**: Custom colors saved to localStorage
- **Fallback Support**: Always falls back to default brand colors

## Usage

### For Components

#### Using Theme Colors
```tsx
// Use predefined theme colors
<div className="bg-theme-primary text-white">Primary Background</div>
<div className="bg-theme-secondary">Secondary Background</div>
<div className="text-theme-accent">Accent Text</div>

// Use brand gradients
<div className="gradient-brand p-4">Brand Gradient</div>
<div className="gradient-accent p-4">Accent Gradient</div>
```

#### Using Custom Colors Hook
```tsx
import { useCustomColors, useCustomColor } from '@/hooks/useCustomColors'

function MyComponent() {
  const customColors = useCustomColors()
  const primaryColor = useCustomColor('color-primary', '#4A2E21')
  
  return (
    <div style={{ backgroundColor: primaryColor }}>
      Custom colored content
    </div>
  )
}
```

#### Checking Admin Context
```tsx
import { useIsAdminContext } from '@/hooks/useCustomColors'

function MyComponent() {
  const isAdmin = useIsAdminContext()
  
  if (isAdmin) {
    // Show admin-specific features
    return <AdminFeatures />
  }
  
  return <PublicFeatures />
}
```

### Available CSS Classes

#### Background Colors
- `.bg-theme-primary` - Primary brand color
- `.bg-theme-secondary` - Secondary brand color
- `.bg-theme-accent` - Accent color
- `.bg-theme-success` - Success color
- `.bg-theme-warning` - Warning color
- `.bg-theme-danger` - Danger color
- `.bg-theme-info` - Info color
- `.bg-theme-purple` - Purple color

#### Text Colors
- `.text-theme-primary` - Primary text color
- `.text-theme-secondary` - Secondary text color
- `.text-theme-accent` - Accent text color

#### Custom Colors
- `.bg-custom-primary` - Custom primary background
- `.bg-custom-secondary` - Custom secondary background
- `.bg-custom-accent` - Custom accent background
- `.text-custom-primary` - Custom primary text
- `.text-custom-secondary` - Custom secondary text
- `.border-custom` - Custom border color

#### Gradients
- `.gradient-brand` - Brand gradient (primary → secondary)
- `.gradient-accent` - Accent gradient (accent → secondary)
- `.gradient-custom` - Custom gradient (custom primary → custom accent)

### CSS Custom Properties

The following CSS custom properties are available:

#### Brand Colors
```css
--color-primary: #4A2E21;      /* Cocoa Brown */
--color-secondary: #C8B38A;    /* Champagne */
--color-accent: #E8CBAF;       /* Pearl Accent */
--color-success: #10B981;      /* Success Green */
--color-warning: #F59E0B;      /* Warning Amber */
--color-danger: #EF4444;       /* Danger Red */
--color-info: #3B82F6;         /* Info Blue */
--color-purple: #8B5CF6;       /* Purple */
```

#### Custom Colors (Configurable)
```css
--custom-bg-primary: var(--color-primary);
--custom-bg-secondary: var(--color-secondary);
--custom-bg-accent: var(--color-accent);
--custom-text-primary: #FFFFFF;
--custom-text-secondary: #000000;
--custom-border: var(--color-accent);
```

#### Gradients
```css
--gradient-brand: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
--gradient-accent: linear-gradient(135deg, var(--color-accent), var(--color-secondary));
--gradient-custom: linear-gradient(135deg, var(--custom-bg-primary), var(--custom-bg-accent));
```

## Admin Features

### Theme Toggle
- **Location**: Admin dashboard top bar
- **Permissions**: Super Admin or Development mode only
- **Scope**: Only affects admin dashboard
- **Persistence**: Saved to localStorage as 'admin-theme-preference'

### Custom Color Manager
- **Location**: Admin dashboard top bar (palette icon)
- **Features**:
  - Color picker for 8 theme colors
  - Real-time preview
  - Reset to defaults
  - Hex code input
  - Visual color swatches
- **Permissions**: Super Admin or Development mode only
- **Persistence**: Saved to localStorage as 'admin-custom-colors'

### Color Customization UI
```tsx
import { CustomColorManager } from '@/components/admin/CustomColorManager'

// Already included in admin layout
// Appears as palette icon in top bar
```

## Technical Implementation

### Theme Isolation
The system uses CSS attribute selectors to isolate admin themes:

```css
/* Main site - always light */
body:not([data-admin-theme-container]) {
  --background: 28 80% 98% !important;
  --foreground: 28 34% 21% !important;
}

/* Admin light theme */
[data-admin-theme-container].admin-light {
  --background: 28 80% 98%;
  --foreground: 28 34% 21%;
}

/* Admin dark theme */
[data-admin-theme-container].admin-dark {
  --background: 28 34% 10%;
  --foreground: 40 43% 88%;
}
```

### Storage Keys
- `main-site-theme`: Always 'light' (forced)
- `admin-theme-preference`: 'light' | 'dark'
- `admin-custom-colors`: JSON object with color values

### Provider Hierarchy
```tsx
<ThemeProvider defaultTheme="light" storageKey="main-site-theme">
  <AdminThemeProvider>
    {/* Admin content with isolated theme */}
  </AdminThemeProvider>
  {/* Main site content - always light */}
</ThemeProvider>
```

## Migration Notes

### From Previous Version
1. **System Theme**: No longer follows system preference for main site
2. **Dark Mode**: Main site dark mode is completely disabled
3. **Admin Independence**: Admin theme changes don't affect main site
4. **Custom Colors**: New feature - customize colors via admin panel

### Breaking Changes
- Main site will always be light mode regardless of user preference
- Previous dark mode settings for main site are ignored
- Admin theme is now stored separately

## Best Practices

### For Developers
1. Use theme classes instead of hardcoded colors
2. Test components in both admin light and dark modes
3. Ensure custom colors have proper contrast ratios
4. Use semantic color names (primary, secondary, etc.)

### For Super Admins
1. Test color changes across different components
2. Ensure sufficient contrast for accessibility
3. Consider brand consistency when customizing colors
4. Use the reset function if colors become problematic

## Troubleshooting

### Common Issues

#### Main site showing dark mode
- Check that elements don't have `data-admin-theme-container` attribute
- Verify CSS custom properties are not being overridden
- Clear localStorage if needed

#### Admin theme not changing
- Verify Super Admin permissions
- Check browser console for errors
- Ensure `data-admin-theme-container` attribute is present

#### Custom colors not applying
- Check localStorage for 'admin-custom-colors'
- Verify colors are valid hex codes
- Try resetting to defaults and reapplying

### Debug Commands
```javascript
// Check current theme storage
localStorage.getItem('admin-theme-preference')
localStorage.getItem('admin-custom-colors')

// Reset admin theme
localStorage.removeItem('admin-theme-preference')
localStorage.removeItem('admin-custom-colors')

// Check CSS custom properties
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
```

## Future Enhancements

1. **Theme Presets**: Predefined color schemes
2. **Export/Import**: Share custom color schemes
3. **User Preferences**: Per-user theme settings
4. **Accessibility**: High contrast mode support
5. **Brand Themes**: Multiple brand color options
