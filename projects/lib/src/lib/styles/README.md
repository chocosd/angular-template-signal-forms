# Signal Template Forms - Styles

This directory contains the SCSS stylesheets for Signal Template Forms.

## Usage

### 1. Import the main stylesheet

In your global styles file (e.g., `styles.scss`):

```scss
@import "signal-template-forms/src/lib/styles/forms.scss";
```

### 2. Customize CSS Variables

Override the default theme by setting CSS custom properties:

```scss
:root {
  --signal-form-primary-color: #007bff;
  --signal-form-border-radius: 8px;
  --signal-form-width: 800px;
  --signal-form-error-color: #dc3545;
}
```

### 3. Available CSS Custom Properties

- `--signal-form-padding`: Form container padding
- `--signal-form-width`: Default form width
- `--signal-form-border-radius`: Border radius for form elements
- `--signal-form-bg`: Background color
- `--signal-form-text`: Text color
- `--signal-form-outline-focus`: Focus outline color
- `--signal-form-error-color`: Error message color
- `--signal-form-button-primary-bg`: Primary button background
- And many more...

### 4. Dark Mode Support

You can create a dark theme by overriding variables in a dark mode context:

```scss
@media (prefers-color-scheme: dark) {
  :root {
    --signal-form-bg: #1a1a1a;
    --signal-form-text: #ffffff;
    --signal-form-border-color: #404040;
  }
}
```
