// Professional Theme Variables with Light and Dark Mode Support
export const lightTheme = {
  // Base Colors
  colors: {
    // Background colors
    bg: '#FFFFFF',
    surface: '#F7F7F8',
    
    // Text colors
    text: '#0F172A',           // slate-900
    textMuted: '#475569',      // slate-600
    textLight: '#64748B',      // slate-500
    
    // Border colors
    border: '#E5E7EB',         // gray-200
    borderLight: '#F3F4F6',    // gray-100
    borderDark: '#D1D5DB',     // gray-300
    
    // Primary colors (professional dark)
    primary: '#111827',        // near-black for professional accent
    primaryContrast: '#FFFFFF',
    primaryHover: '#1F2937',   // gray-800
    primaryLight: '#374151',   // gray-700
    
    // Accent colors (subtle blue)
    accent: '#2563EB',         // blue-600
    accentContrast: '#FFFFFF',
    accentHover: '#1D4ED8',    // blue-700
    accentLight: '#3B82F6',    // blue-500
    
    // Focus colors
    focus: '#93C5FD',          // blue-300 for accessible focus ring
    focusRing: 'rgba(147, 197, 253, 0.5)',
    
    // Status colors
    danger: '#DC2626',         // red-600 (errors only)
    dangerLight: '#FEF2F2',    // red-50
    dangerBorder: '#FECACA',   // red-200
    
    success: '#16A34A',        // green-600
    successLight: '#F0FDF4',   // green-50
    successBorder: '#BBF7D0',  // green-200
    
    warning: '#D97706',        // amber-600
    warningLight: '#FFFBEB',   // amber-50
    warningBorder: '#FED7AA',  // amber-200
    
    info: '#0EA5E9',           // sky-500
    infoLight: '#F0F9FF',      // sky-50
    infoBorder: '#BAE6FD',     // sky-200
    
    // Gray scale
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Sidebar colors
    sidebarBg: '#0066cc',      // red-600
    sidebarText: '#FFFFFF',
    sidebarHover: 'rgba(255, 255, 255, 0.1)',
    sidebarActive: 'rgba(255, 255, 255, 0.2)',
    
    // Surface hover
    surfaceHover: '#F3F4F6',   // gray-100
  },
};

export const darkTheme = {
  // Base Colors
  colors: {
    // Background colors
    bg: '#0F172A',             // slate-900
    surface: '#1E293B',        // slate-800
    
    // Text colors
    text: '#F8FAFC',           // slate-50
    textMuted: '#CBD5E1',      // slate-300
    textLight: '#94A3B8',      // slate-400
    
    // Border colors
    border: '#334155',         // slate-700
    borderLight: '#475569',    // slate-600
    borderDark: '#1E293B',     // slate-800
    
    // Primary colors (bright for dark mode)
    primary: '#3B82F6',        // blue-500
    primaryContrast: '#FFFFFF',
    primaryHover: '#2563EB',   // blue-600
    primaryLight: '#60A5FA',   // blue-400
    
    // Accent colors (bright blue)
    accent: '#06B6D4',         // cyan-500
    accentContrast: '#FFFFFF',
    accentHover: '#0891B2',    // cyan-600
    accentLight: '#22D3EE',    // cyan-400
    
    // Focus colors
    focus: '#60A5FA',          // blue-400 for accessible focus ring
    focusRing: 'rgba(96, 165, 250, 0.5)',
    
    // Status colors (adjusted for dark mode)
    danger: '#EF4444',         // red-500
    dangerLight: '#7F1D1D',    // red-900
    dangerBorder: '#991B1B',   // red-800
    
    success: '#22C55E',        // green-500
    successLight: '#14532D',   // green-900
    successBorder: '#166534',  // green-800
    
    warning: '#F59E0B',        // amber-500
    warningLight: '#78350F',   // amber-900
    warningBorder: '#92400E',  // amber-800
    
    info: '#06B6D4',           // cyan-500
    infoLight: '#164E63',      // cyan-900
    infoBorder: '#155E75',     // cyan-800
    
    // Neutral grays (inverted for dark mode)// Gray scale
    gray50: '#0F172A',
    gray100: '#1E293B',
    gray200: '#334155',
    gray300: '#475569',
    gray400: '#64748B',
    gray500: '#94A3B8',
    gray600: '#CBD5E1',
    gray700: '#E2E8F0',
    gray800: '#F1F5F9',
    gray900: '#F8FAFC',
    
    // Sidebar colors
    sidebarBg: '#7C2D12',      // red-800 (darker for dark mode)
    sidebarText: '#F8FAFC',    // slate-50
    sidebarHover: 'rgba(248, 250, 252, 0.1)',
    sidebarActive: 'rgba(248, 250, 252, 0.2)',
    
    // Surface hover
    surfaceHover: '#334155',   // slate-700
  },
};

// Default theme (light)
export const theme = lightTheme;
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.6',
      loose: '1.8',
    },
  },
  
  // Spacing (8px scale)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    focus: '0 0 0 3px rgba(147, 197, 253, 0.5)',
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease-out',
    base: '0.2s ease-out',
    slow: '0.3s ease-out',
    bounce: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

// CSS Variables for global use with theme support
export const generateCSSVariables = (currentTheme) => `
  :root {
    /* Colors */
    --bg: ${currentTheme.colors.bg};
    --surface: ${currentTheme.colors.surface};
    --text: ${currentTheme.colors.text};
    --text-muted: ${currentTheme.colors.textMuted};
    --text-light: ${currentTheme.colors.textLight};
    --border: ${currentTheme.colors.border};
    --border-light: ${currentTheme.colors.borderLight};
    --border-dark: ${currentTheme.colors.borderDark};
    
    --primary: ${currentTheme.colors.primary};
    --primary-contrast: ${currentTheme.colors.primaryContrast};
    --primary-hover: ${currentTheme.colors.primaryHover};
    --primary-light: ${currentTheme.colors.primaryLight};
    
    --accent: ${currentTheme.colors.accent};
    --accent-contrast: ${currentTheme.colors.accentContrast};
    --accent-hover: ${currentTheme.colors.accentHover};
    --accent-light: ${currentTheme.colors.accentLight};
    
    --focus: ${currentTheme.colors.focus};
    --focus-ring: ${currentTheme.colors.focusRing};
    
    --danger: ${currentTheme.colors.danger};
    --danger-light: ${currentTheme.colors.dangerLight};
    --danger-border: ${currentTheme.colors.dangerBorder};
    
    --success: ${currentTheme.colors.success};
    --success-light: ${currentTheme.colors.successLight};
    --success-border: ${currentTheme.colors.successBorder};
    
    --warning: ${currentTheme.colors.warning};
    --warning-light: ${currentTheme.colors.warningLight};
    --warning-border: ${currentTheme.colors.warningBorder};
    
    --info: ${currentTheme.colors.info};
    --info-light: ${currentTheme.colors.infoLight};
    --info-border: ${currentTheme.colors.infoBorder};
    
    /* Sidebar */
    --sidebar-bg: ${currentTheme.colors.sidebarBg};
    --sidebar-text: ${currentTheme.colors.sidebarText};
    --sidebar-hover: ${currentTheme.colors.sidebarHover};
    --sidebar-active: ${currentTheme.colors.sidebarActive};
    
    /* Surface */
    --surface-hover: ${currentTheme.colors.surfaceHover};
    --background: ${currentTheme.colors.bg};
    
    /* Typography */
    --font-family-primary: ${currentTheme.typography.fontFamily.primary};
    --font-family-mono: ${currentTheme.typography.fontFamily.mono};
    
    /* Spacing */
    --spacing-1: ${currentTheme.spacing[1]};
    --spacing-2: ${currentTheme.spacing[2]};
    --spacing-3: ${currentTheme.spacing[3]};
    --spacing-4: ${currentTheme.spacing[4]};
    --spacing-5: ${currentTheme.spacing[5]};
    --spacing-6: ${currentTheme.spacing[6]};
    --spacing-8: ${currentTheme.spacing[8]};
    --spacing-10: ${currentTheme.spacing[10]};
    --spacing-12: ${currentTheme.spacing[12]};
    --spacing-16: ${currentTheme.spacing[16]};
    --spacing-20: ${currentTheme.spacing[20]};
    --spacing-24: ${currentTheme.spacing[24]};
    
    /* Border Radius */
    --radius-sm: ${currentTheme.borderRadius.sm};
    --radius-base: ${currentTheme.borderRadius.base};
    --radius-md: ${currentTheme.borderRadius.md};
    --radius-lg: ${currentTheme.borderRadius.lg};
    --radius-xl: ${currentTheme.borderRadius.xl};
    --radius-2xl: ${currentTheme.borderRadius['2xl']};
    --radius-full: ${currentTheme.borderRadius.full};
    
    /* Shadows */
    --shadow-sm: ${currentTheme.shadows.sm};
    --shadow-base: ${currentTheme.shadows.base};
    --shadow-md: ${currentTheme.shadows.md};
    --shadow-lg: ${currentTheme.shadows.lg};
    --shadow-xl: ${currentTheme.shadows.xl};
    --shadow-2xl: ${currentTheme.shadows['2xl']};
    --shadow-focus: ${currentTheme.shadows.focus};
    
    /* Transitions */
    --transition-fast: ${currentTheme.transitions.fast};
    --transition-base: ${currentTheme.transitions.base};
    --transition-slow: ${currentTheme.transitions.slow};
    --transition-bounce: ${currentTheme.transitions.bounce};
  }
`;

// Default CSS variables for backward compatibility
export const cssVariables = generateCSSVariables(lightTheme);

export default theme;