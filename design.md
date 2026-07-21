## Overview

Create a modern, brutalist-inspired file manager interface with a dark theme, featuring fuchsia/purple accent colors, glassmorphism effects, and sophisticated micro-interactions. The design should feel premium, technical, and futuristic while maintaining excellent usability.

## Core Design Philosophy

- **Aesthetic**: Brutalist-meets-glassmorphism with cyberpunk influences
- **Primary Colors**: Black background (#0a0a0a) with fuchsia/purple accents (#f472b6)
- **Typography**: Dual font system - Syne for display headers, Space Grotesk for monospace elements
- **Visual Effects**: Subtle noise overlay, grid patterns, brutal shadows, and glow effects

## Layout Structure

### Main Container

- Background: `bg-[#0a0a0a]` (near-black)
- Text color: `text-white`
- Selection highlight: `selection:bg-fuchsia-500/30`
- Global overlays:
  - Noise texture overlay (3% opacity)
  - Grid pattern background (60px grid, 3% white lines)

### Header Section

- Centered layout with icon + title
- Icon container: 12x12, border `border-fuchsia-500/30`, bg `bg-fuchsia-500/10`
- Title: "GlovedFiles" using `font-display` (Syne), 4xl, bold, uppercase, tight tracking
- Subtitle: `font-mono-industrial` (Space Grotesk), small text, `text-white/50`

## Component Specifications

### Upload Zone

- **Container**: Dashed border (2px), `border-white/20` hover `border-white/40`
- **Active state**: `border-fuchsia-500 bg-fuchsia-500/5`
- **Icon**: 20x20 container, border `border-white/10`, bg `bg-white/5`
- **Typography**:
  - Main text: `font-display`, 2xl-3xl, bold, uppercase
  - Helper text: `font-mono-industrial`, xs, `text-white/50`
- **Micro-interactions**: Corner decorations that appear on hover, drag state animations

### File Item Cards (Desktop)

- **Base**: Border `border-white/10`, bg `bg-white/5`, backdrop blur
- **Hover state**: `border-fuchsia-500/50 bg-fuchsia-500/5`
- **Temporary files**: Orange accents instead of fuchsia
- **Header**: File icon (10x10) + filename + metadata
- **Actions**: Icon buttons that appear on hover with gradient overlays
- **Shadows**: `brutal-shadow-sm` (3px offset, fuchsia shadow)

### File Item List (Mobile)

- **Responsive design** with clamp() for fluid sizing
- **Grid layout**: 2-column on tablets, 1 column on phones
- **Action buttons**: Full-width 2x2 grid
- **Typography scales**: Responsive font sizes using clamp()

### Filter System

- **Search bar**: Icon left, clear button right, `font-mono-industrial`
- **Filter panel**: Dropdown with backdrop blur on mobile, inline on desktop
- **Filter pills**: Border + background, active state with fuchsia accents
- **Active indicators**: Small fuchsia dots on active filters

### Progress Overlay

- **Full screen**: Fixed overlay with `bg-black/80 backdrop-blur-sm`
- **Modal**: Rounded corners, border `border-fuchsia-500/30`, bg `bg-fuchsia-500/5`
- **Progress bar**: Gradient fill `from-fuchsia-500 to-purple-600`
- **Animations**: Spinning ring, pulsing icon, shimmer effect

## Typography System

### Font Classes

```css
.font-display {
  font-family: 'Syne', sans-serif;
}

.font-mono-industrial {
  font-family: 'Space Grotesk', monospace;
}
```

### Usage Patterns

- **Headers**: `font-display`, uppercase, tight tracking, bold weights
- **UI Elements**: `font-mono-industrial`, normal tracking, medium weights
- **Metadata**: `font-mono-industrial`, small/extra-small, reduced opacity

## Color Palette

### Primary Colors

- **Background**: `#0a0a0a` (near-black)
- **Primary accent**: `#f472b6` (fuchsia-500)
- **Secondary accent**: `#a855f7` (purple-600)
- **Temporary accent**: `#fb923c` (orange-400)

### Opacity Scale

- **White overlays**: `/5`, `/10`, `/20`, `/30`, `/50`, `/70`
- **Fuchsia overlays**: `/10`, `/20`, `/30`, `/40`, `/50`
- **Orange overlays**: `/10`, `/20`, `/30`, `/40`, `/50`

## Visual Effects

### Shadows

```css
.brutal-shadow {
  box-shadow: 6px 6px 0 rgba(236, 72, 153, 0.8);
}

.brutal-shadow-sm {
  box-shadow: 3px 3px 0 rgba(236, 72, 153, 0.6);
}
```

### Glow Effects

```css
.glow-line {
  box-shadow:
    0 0 20px rgba(236, 72, 153, 0.5),
    0 0 40px rgba(236, 72, 153, 0.2);
}
```

### Background Textures

- **Noise overlay**: SVG noise pattern, 3% opacity
- **Grid pattern**: 60px grid, subtle white lines

## Animation Patterns

### Page Load

- Staggered animations using `animation-delay`
- Fade in from bottom with slight blur
- Sequential component reveals

### Micro-interactions

- **Buttons**: Translate + shadow reduction on click
- **Hover states**: Color transitions, scale transforms
- **Loading states**: Spin animations, pulse effects
- **Drag states**: Border color changes, background shifts

### Transitions

- **Duration**: 200-300ms for UI, 500ms for page elements
- **Easing**: `ease-out` for most transitions
- **Properties**: Transform, opacity, color, border-color

## Responsive Design

### Breakpoints

- **Mobile**: Default styles, single column
- **Tablet**: `sm:` prefix, 2-column layouts
- **Desktop**: `lg:` prefix, 3-column layouts, full features

### Mobile Adaptations

- **Typography**: Fluid sizing with clamp()
- **Layout**: Stack vertically, simplify interactions
- **Touch targets**: Minimum 44px tap targets
- **Dialogs**: Full-screen overlays on mobile

## Interactive States

### Button States

- **Default**: Border `border-white/10`, bg `bg-white/5`
- **Hover**: Border `border-fuchsia-500`, bg `bg-fuchsia-500/10`
- **Active**: Transform translate, reduced shadow
- **Disabled**: `opacity-50`, `pointer-events-none`

### Form Elements

- **Inputs**: `font-mono-industrial`, transparent backgrounds
- **Focus**: `border-fuchsia-500`, `bg-fuchsia-500/5`
- **Validation**: Red accents for errors, green for success

## Accessibility Considerations

- **Contrast ratios**: Minimum WCAG AA compliance
- **Focus states**: Visible fuchsia outlines
- **Screen readers**: Proper ARIA labels and roles
- **Keyboard navigation**: Full keyboard accessibility
- **Reduced motion**: Respect prefers-reduced-motion

## Implementation Notes

### CSS Architecture

- Use Tailwind utility classes primarily
- Custom CSS for complex animations and effects
- CSS custom properties for theme consistency
- Layer utilities for organization

### Performance

- Optimize animations for 60fps
- Use transform and opacity for smooth animations
- Lazy load heavy components
- Minimize layout thrashing

### Browser Support

- Modern browsers (ES2020+)
- CSS Grid and Flexbox
- CSS custom properties
- Backdrop filters (with fallbacks)

## Component Library Integration

### Required Components

- Button (with brutal shadow variants)
- Input/TextField (with monospace styling)
- Dialog/Modal (with glassmorphism)
- Progress indicators
- Icon system (Lucide icons)

### Custom Utilities

- `.brutal-shadow` and `.brutal-shadow-sm`
- `.font-display` and `.font-mono-industrial`
- `.noise-overlay` and `.grid-pattern`
- `.glow-line` for emphasis

This design system creates a cohesive, premium interface that feels both technical and modern, with careful attention to detail in typography, spacing, and micro-interactions. The brutalist elements provide character while the glassmorphism effects add sophistication.
