# Windows 95 UI Style Reference Guide

## Color Palette

```css
--win95-desktop: #008080           /* Teal desktop background */
--win95-window-bg: #c0c0c0         /* Gray window background */
--win95-title-bar: #000080         /* Dark blue title bar */
--win95-title-text: #ffffff        /* White title text */
--win95-button-face: #c0c0c0       /* Button face color */
--win95-button-highlight: #ffffff  /* Button highlight */
--win95-button-shadow: #808080     /* Button shadow */
--win95-button-dark-shadow: #000000 /* Button dark shadow */
--win95-text: #000000              /* Black text */
--win95-menu-highlight: #000080    /* Menu selection blue */
```

## Beveled Border Patterns

### Raised Border (Outward 3D Effect)
```css
border-width: 2px;
border-style: solid;
border-top-color: #ffffff;
border-left-color: #ffffff;
border-right-color: #000000;
border-bottom-color: #000000;
```

**Or with helper class:**
```tsx
<div className="win95-border-raised-outer">
  Content
</div>
```

### Raised Border (Button Style)
```css
border-width: 2px;
border-style: solid;
border-top-color: #ffffff;
border-left-color: #ffffff;
border-right-color: #808080;
border-bottom-color: #808080;
```

**Or with helper class:**
```tsx
<div className="win95-border-raised">
  Content
</div>
```

### Sunken Border (Inward 3D Effect)
```css
border-width: 2px;
border-style: solid;
border-top-color: #808080;
border-left-color: #808080;
border-right-color: #ffffff;
border-bottom-color: #ffffff;
```

**Or with helper class:**
```tsx
<div className="win95-border-sunken">
  Content
</div>
```

### Deep Sunken Border (Input Fields)
```css
border-width: 2px;
border-style: solid;
border-top-color: #000000;
border-left-color: #000000;
border-right-color: #ffffff;
border-bottom-color: #ffffff;
```

**Or with helper class:**
```tsx
<div className="win95-border-sunken-deep">
  Content
</div>
```

## Button Styles

### Standard Button
```tsx
<button className="win95-button">
  Click Me
</button>
```

**Custom inline style:**
```tsx
<button
  style={{
    background: '#c0c0c0',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
    padding: '2px 12px',
    fontSize: '11px',
    fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
  }}
>
  Button Text
</button>
```

### Pressed/Active Button
```css
border-top-color: #000000;
border-left-color: #000000;
border-right-color: #ffffff;
border-bottom-color: #ffffff;
padding: 3px 11px 1px 13px; /* Shift content down-right */
```

## Input Field Styles

### Text Input
```tsx
<input 
  type="text" 
  className="win95-input"
  placeholder="Enter text..."
/>
```

**Custom inline style:**
```tsx
<input
  type="text"
  style={{
    background: '#ffffff',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderTopColor: '#808080',
    borderLeftColor: '#808080',
    borderRightColor: '#ffffff',
    borderBottomColor: '#ffffff',
    padding: '3px 4px',
    fontSize: '11px',
    fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
  }}
/>
```

## Window Component

### Basic Usage
```tsx
import Window from "./win95/Window";

<Window title="My Application" width="600px" height="400px">
  <div className="p-4" style={{ background: '#c0c0c0' }}>
    Window content goes here
  </div>
</Window>
```

### Window Structure (Manual)
```tsx
<div 
  style={{ 
    background: '#c0c0c0',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
  }}
>
  {/* Title Bar */}
  <div 
    style={{
      background: 'linear-gradient(to right, #000080, #1084d0)',
      padding: '2px',
      minHeight: '18px',
    }}
  >
    <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}>
      Window Title
    </span>
  </div>
  
  {/* Content */}
  <div style={{ background: '#c0c0c0', padding: '8px' }}>
    Content
  </div>
</div>
```

## Common UI Elements

### Panel/Group Box
```tsx
<div
  style={{
    background: '#c0c0c0',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    padding: '8px',
  }}
>
  Panel content
</div>
```

### Separator Line
```tsx
<div 
  style={{
    height: '2px',
    borderTop: '1px solid #808080',
    borderBottom: '1px solid #ffffff',
    margin: '8px 0',
  }}
/>
```

### Menu Bar
```tsx
<div 
  style={{
    background: '#c0c0c0',
    borderBottom: '2px solid #ffffff',
    padding: '2px',
    display: 'flex',
    gap: '0',
  }}
>
  <a 
    href="#"
    style={{
      padding: '4px 8px',
      fontSize: '11px',
      color: '#000000',
      textDecoration: 'none',
    }}
    className="hover:bg-[#000080] hover:text-white"
  >
    File
  </a>
  <a 
    href="#"
    style={{
      padding: '4px 8px',
      fontSize: '11px',
      color: '#000000',
      textDecoration: 'none',
    }}
    className="hover:bg-[#000080] hover:text-white"
  >
    Edit
  </a>
</div>
```

## Typography

### Font Family
```css
font-family: 'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', 'Geneva', 'Verdana', sans-serif;
```

### Font Sizes
- **Window Title**: 11px, bold
- **Body Text**: 11px
- **Small Text**: 10px
- **Headers**: 12px-16px, bold

### Example Headings
```tsx
<h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
  Main Heading
</h1>

<h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000080' }}>
  Subheading
</h2>

<p style={{ fontSize: '11px', color: '#000000' }}>
  Body text
</p>
```

## Icons and Graphics

### Simple Icon Box
```tsx
<div 
  style={{
    width: '32px',
    height: '32px',
    background: '#c0c0c0',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <span style={{ fontSize: '16px' }}>?</span>
</div>
```

### Error Icon
```tsx
<div 
  style={{
    width: '48px',
    height: '48px',
    background: '#ff0000',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderTopColor: '#ff8080',
    borderLeftColor: '#ff8080',
    borderRightColor: '#800000',
    borderBottomColor: '#800000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
  }}
>
  !
</div>
```

## Dialog Box Patterns

### Message Box
```tsx
<Window title="Message" width="400px" height="auto">
  <div style={{ background: '#c0c0c0', padding: '16px' }}>
    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
      {/* Icon */}
      <div style={{ fontSize: '32px' }}>ℹ️</div>
      
      {/* Message */}
      <div>
        <p style={{ fontSize: '11px', color: '#000000' }}>
          This is a message dialog box.
        </p>
      </div>
    </div>
    
    {/* Separator */}
    <div 
      style={{
        height: '2px',
        borderTop: '1px solid #808080',
        borderBottom: '1px solid #ffffff',
        margin: '8px 0',
      }}
    />
    
    {/* Buttons */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
      <button className="win95-button">OK</button>
      <button className="win95-button">Cancel</button>
    </div>
  </div>
</Window>
```

### Confirmation Dialog
```tsx
<Window title="Confirm" width="350px" height="auto">
  <div style={{ background: '#c0c0c0', padding: '16px', textAlign: 'center' }}>
    <p style={{ fontSize: '11px', color: '#000000', marginBottom: '16px' }}>
      Are you sure you want to continue?
    </p>
    
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
      <button className="win95-button">Yes</button>
      <button className="win95-button">No</button>
    </div>
  </div>
</Window>
```

## Taskbar

### Standard Taskbar Structure
```tsx
<div 
  style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28px',
    background: '#c0c0c0',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    gap: '4px',
  }}
>
  {/* Start Button */}
  <button className="win95-button" style={{ height: '22px' }}>
    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Start</span>
  </button>
  
  {/* Clock */}
  <div 
    style={{
      marginLeft: 'auto',
      padding: '0 8px',
      fontSize: '11px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderTopColor: '#808080',
      borderLeftColor: '#808080',
      borderRightColor: '#ffffff',
      borderBottomColor: '#ffffff',
    }}
  >
    12:00 PM
  </div>
</div>
```

## Image Rendering

### Pixelated Images
```tsx
<img 
  src="image.jpg" 
  alt="Pixelated"
  style={{ 
    imageRendering: 'pixelated',
  }}
/>
```

## Best Practices

1. **No Rounded Corners**: Always use `border-radius: 0` or don't set it at all
2. **No Box Shadows**: Windows 95 used beveled borders, not shadows
3. **No Gradients**: Except for title bars which can have a subtle blue gradient
4. **Font Sizes**: Keep between 10px-12px for most UI elements
5. **Spacing**: Use tight spacing (2px-8px) rather than large gaps
6. **Colors**: Stick to the palette - avoid modern colors
7. **Transitions**: Remove all CSS transitions and animations (already handled globally)

## Quick Copy-Paste Examples

### Standard Window with Content
```tsx
<div className="size-full flex items-center justify-center p-8">
  <Window title="My Window" width="600px" height="400px">
    <div className="p-4" style={{ background: '#c0c0c0' }}>
      <p style={{ fontSize: '11px', color: '#000000', marginBottom: '8px' }}>
        Window content here
      </p>
      
      <button className="win95-button">
        Click Me
      </button>
    </div>
  </Window>
</div>
```

### Form Example
```tsx
<Window title="Form" width="400px" height="auto">
  <div className="p-4" style={{ background: '#c0c0c0' }}>
    <div style={{ marginBottom: '8px' }}>
      <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>
        Name:
      </label>
      <input 
        type="text" 
        className="win95-input"
        style={{ width: '100%' }}
      />
    </div>
    
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>
        Description:
      </label>
      <textarea 
        className="win95-input"
        rows={4}
        style={{ width: '100%' }}
      />
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
      <button className="win95-button">OK</button>
      <button className="win95-button">Cancel</button>
    </div>
  </div>
</Window>
```

### Card/Panel Grid
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
  <div
    style={{
      background: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderTopColor: '#808080',
      borderLeftColor: '#808080',
      borderRightColor: '#ffffff',
      borderBottomColor: '#ffffff',
      padding: '8px',
    }}
  >
    <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
      Card 1
    </h3>
    <p style={{ fontSize: '10px' }}>Content</p>
  </div>
  
  <div
    style={{
      background: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderTopColor: '#808080',
      borderLeftColor: '#808080',
      borderRightColor: '#ffffff',
      borderBottomColor: '#ffffff',
      padding: '8px',
    }}
  >
    <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
      Card 2
    </h3>
    <p style={{ fontSize: '10px' }}>Content</p>
  </div>
</div>
```

## Global Theme Application

To enable Windows 95 theme globally, add to `<body>`:
```tsx
useEffect(() => {
  document.body.classList.add('win95-theme');
  return () => {
    document.body.classList.remove('win95-theme');
  };
}, []);
```

This removes all transitions, animations, rounded corners, and box shadows automatically.
