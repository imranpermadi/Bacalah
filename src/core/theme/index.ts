export const colors = {
  sunny: '#FFD93D',
  sunnyDark: '#E0B000',
  sky: '#6EC6FF',
  skyDark: '#3A9BDC',
  mint: '#7EE0B5',
  mintDark: '#3DB88A',
  coral: '#FF8FA3',
  coralDark: '#E0607A',
  lavender: '#C3A6FF',
  lavenderDark: '#9370DB',
  peach: '#FFB877',
  peachDark: '#E08A3C',
  bg: '#FFF9E8',
  card: '#FFFFFF',
  ink: '#2B2D42',
  inkSoft: '#6B6F89',
  line: '#EFE6C8',
  success: '#3DB88A',
  hint: '#FFB877',
};

/** Pasangan [warna, warna tepi 3D] untuk gelembung. */
export const bubblePalette: [string, string][] = [
  [colors.sunny, colors.sunnyDark],
  [colors.sky, colors.skyDark],
  [colors.mint, colors.mintDark],
  [colors.coral, colors.coralDark],
  [colors.lavender, colors.lavenderDark],
  [colors.peach, colors.peachDark],
];

export const fonts = {
  regular: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
};

export const radius = { sm: 12, md: 20, lg: 28, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

/** Gaya tombol timbul 3D taktil. */
export const raised = (borderColor: string) => ({
  borderBottomWidth: 4,
  borderBottomColor: borderColor,
});

export const levelMeta = [
  { level: 1, title: 'Huruf A–Z', emoji: '🔤', color: colors.sunny },
  { level: 2, title: 'Suku Kata', emoji: '🧩', color: colors.sky },
  { level: 3, title: 'Kata 2 Suku', emoji: '📕', color: colors.mint },
  { level: 4, title: 'Suku Tertutup', emoji: '🏠', color: colors.coral },
  { level: 5, title: 'NG, NY, AU', emoji: '🌸', color: colors.lavender },
  { level: 6, title: 'Kalimat', emoji: '📖', color: colors.peach },
];

