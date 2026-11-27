import { useCallback, useEffect, useState } from 'react';

export type AccentId = 'raspberry' | 'sage' | 'caramel' | 'coral' | 'teal' | 'ink';
export type WallpaperId = 'aurora' | 'sage' | 'sunset' | 'dusk' | 'rose' | 'paper';

interface AccentTone {
  accent: string;
  strong: string;
  soft: string;
}

interface AccentPreset {
  id: AccentId;
  name: string;
  swatch: string;
  light: AccentTone;
  dark: AccentTone;
}

export const accentPresets: AccentPreset[] = [
  {
    id: 'raspberry',
    name: 'Raspberry',
    swatch: '#E84A5F',
    light: { accent: '232 74 95', strong: '209 51 72', soft: '255 206 171' },
    dark: { accent: '255 132 124', strong: '232 74 95', soft: '76 55 54' },
  },
  {
    id: 'sage',
    name: 'Sage',
    swatch: '#96B49E',
    light: { accent: '98 133 109', strong: '79 107 88', soft: '205 224 210' },
    dark: { accent: '150 180 158', strong: '123 159 134', soft: '52 74 62' },
  },
  {
    id: 'caramel',
    name: 'Caramel',
    swatch: '#B57A4C',
    light: { accent: '181 122 76', strong: '150 99 63', soft: '246 220 184' },
    dark: { accent: '255 206 171', strong: '240 180 135', soft: '76 60 46' },
  },
  {
    id: 'coral',
    name: 'Coral',
    swatch: '#FF847C',
    light: { accent: '226 96 89', strong: '198 74 68', soft: '255 208 203' },
    dark: { accent: '255 180 173', strong: '255 132 124', soft: '80 48 46' },
  },
  {
    id: 'teal',
    name: 'Teal',
    swatch: '#4D786C',
    light: { accent: '77 120 108', strong: '65 97 88', soft: '195 222 213' },
    dark: { accent: '123 174 158', strong: '97 148 133', soft: '47 66 61' },
  },
  {
    id: 'ink',
    name: 'Ink',
    swatch: '#2A363B',
    light: { accent: '74 91 95', strong: '42 54 59', soft: '216 222 222' },
    dark: { accent: '183 193 194', strong: '139 153 156', soft: '48 60 64' },
  },
];

export const wallpapers: { id: WallpaperId; name: string; description: string }[] = [
  { id: 'aurora', name: 'Aurora', description: 'Sage, cream and coral light' },
  { id: 'sage', name: 'Meadow', description: 'Quiet sage washes' },
  { id: 'sunset', name: 'Sunset', description: 'Warm cream and coral' },
  { id: 'dusk', name: 'Dusk', description: 'Deep teal evening' },
  { id: 'rose', name: 'Rose', description: 'Soft raspberry haze' },
  { id: 'paper', name: 'Paper', description: 'Minimal warm canvas' },
];

const ACCENT_KEY = 'arcivo-accent';
const WALLPAPER_KEY = 'arcivo-wallpaper';

function readAccent(): AccentId {
  if (typeof localStorage === 'undefined') return 'raspberry';
  const stored = localStorage.getItem(ACCENT_KEY);
  return accentPresets.some((preset) => preset.id === stored) ? (stored as AccentId) : 'raspberry';
}

function readWallpaper(): WallpaperId {
  if (typeof localStorage === 'undefined') return 'aurora';
  const stored = localStorage.getItem(WALLPAPER_KEY);
  return wallpapers.some((wallpaper) => wallpaper.id === stored)
    ? (stored as WallpaperId)
    : 'aurora';
}

export function useAppearance() {
  const [accent, setAccentState] = useState<AccentId>(readAccent);
  const [wallpaper, setWallpaperState] = useState<WallpaperId>(readWallpaper);
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  // The theme class is owned by useTheme; track it so accents can follow light/dark.
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() =>
      setIsDark(root.classList.contains('dark')),
    );
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const preset = accentPresets.find((item) => item.id === accent) ?? accentPresets[0];
    const tone = isDark ? preset.dark : preset.light;
    const root = document.documentElement;
    root.style.setProperty('--app-accent', tone.accent);
    root.style.setProperty('--app-accent-strong', tone.strong);
    root.style.setProperty('--app-accent-soft', tone.soft);
  }, [accent, isDark]);

  useEffect(() => {
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  useEffect(() => {
    localStorage.setItem(WALLPAPER_KEY, wallpaper);
  }, [wallpaper]);

  const setAccent = useCallback((next: AccentId) => setAccentState(next), []);
  const setWallpaper = useCallback((next: WallpaperId) => setWallpaperState(next), []);

  return { accent, setAccent, wallpaper, setWallpaper };
}
