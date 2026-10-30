/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#18362B',
    tint: '#22634C',
    background: '#F5F7F2',
    foreground: '#18362B',
    card: '#FFFFFF',
    cardForeground: '#18362B',
    primary: '#22634C',
    primaryForeground: '#FFFFFF',
    secondary: '#E8EFE8',
    secondaryForeground: '#244637',
    muted: '#EEF2EC',
    mutedForeground: '#75847A',
    accent: '#DDF26A',
    accentForeground: '#23351C',
    destructive: '#C64438',
    destructiveForeground: '#FFFFFF',
    border: '#E3E9E1',
    input: '#E3E9E1',
  },
  dark: {
    text: '#E7F0E7',
    tint: '#A9D96E',
    background: '#101C17',
    foreground: '#E7F0E7',
    card: '#192820',
    cardForeground: '#E7F0E7',
    primary: '#A9D96E',
    primaryForeground: '#18301F',
    secondary: '#26392F',
    secondaryForeground: '#E7F0E7',
    muted: '#223229',
    mutedForeground: '#A0B0A3',
    accent: '#334623',
    accentForeground: '#DDF26A',
    destructive: '#E67D70',
    destructiveForeground: '#231513',
    border: '#2B3C32',
    input: '#34483B',
  },
  radius: 18,
};

export default colors;
