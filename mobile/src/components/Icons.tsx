// Figma のアイコン（Material Icons など）を、色と大きさを変えられる部品にしたものです。
// 形のデータ（path の d）は Figma から書き出した SVG をそのまま使っています。

import Svg, { Path } from 'react-native-svg';

export type IconProps = {
  color: string;
  size?: number;
};

// ---- タブバー ----

export function HomeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6.19L17 10.69V18.5H15V12.5H9V18.5H7V10.69L12 6.19ZM12 3.5L2 12.5H5V20.5H11V14.5H13V20.5H19V12.5H22L12 3.5Z" fill={color} />
    </Svg>
  );
}

export function MapIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM10 5.47L14 6.87V18.53L10 17.13V5.47ZM5 6.46L8 5.45V17.15L5 18.31V6.46ZM19 17.54L16 18.55V6.86L19 5.7V17.54Z" fill={color} />
    </Svg>
  );
}

export function BookmarkIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3ZM17 18L12 15.82L7 18V5H17V18Z" fill={color} />
    </Svg>
  );
}

export function AccountIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.35 18.5C8.66 17.56 10.26 17 12 17C13.74 17 15.34 17.56 16.65 18.5C15.34 19.44 13.74 20 12 20C10.26 20 8.66 19.44 7.35 18.5ZM18.14 17.12C16.45 15.8 14.32 15 12 15C9.68 15 7.55 15.8 5.86 17.12C4.7 15.73 4 13.95 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 13.95 19.3 15.73 18.14 17.12Z" fill={color} />
      <Path d="M12 6C10.07 6 8.5 7.57 8.5 9.5C8.5 11.43 10.07 13 12 13C13.93 13 15.5 11.43 15.5 9.5C15.5 7.57 13.93 6 12 6ZM12 11C11.17 11 10.5 10.33 10.5 9.5C10.5 8.67 11.17 8 12 8C12.83 8 13.5 8.67 13.5 9.5C13.5 10.33 12.83 11 12 11Z" fill={color} />
    </Svg>
  );
}

// ---- ヘッダー・操作 ----

export function BackIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill={color} />
    </Svg>
  );
}

export function CloseIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill={color} />
    </Svg>
  );
}

export function SearchIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15.755 14.255H14.965L14.685 13.985C15.665 12.845 16.255 11.365 16.255 9.755C16.255 6.165 13.345 3.255 9.755 3.255C6.165 3.255 3.255 6.165 3.255 9.755C3.255 13.345 6.165 16.255 9.755 16.255C11.365 16.255 12.845 15.665 13.985 14.685L14.255 14.965V15.755L19.255 20.745L20.745 19.255L15.755 14.255ZM9.755 14.255C7.265 14.255 5.255 12.245 5.255 9.755C5.255 7.265 7.265 5.255 9.755 5.255C12.245 5.255 14.255 7.265 14.255 9.755C14.255 12.245 12.245 14.255 9.755 14.255Z" fill={color} />
    </Svg>
  );
}

export function ChevronRightIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M7.5 15L12.5 10L7.5 5" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronDownIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M5 7.5L10 12.5L15 7.5" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ExternalLinkIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13.3333 6.66667V2.66667H9.33333M13.3333 2.66667L7.33333 8.66667M12 9.33333V12.6667C12 12.8435 11.9298 13.013 11.8047 13.1381C11.6797 13.2631 11.5101 13.3333 11.3333 13.3333H3.33333C3.15652 13.3333 2.98695 13.2631 2.86193 13.1381C2.7369 13.013 2.66667 12.8435 2.66667 12.6667V4.66667C2.66667 4.48986 2.7369 4.32029 2.86193 4.19526C2.98695 4.07024 3.15652 4 3.33333 4H6.66667"
        stroke={color}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---- 地図 ----

// お店のピン（28 × 34）
export function PinIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={(size * 34) / 28} viewBox="0 0 28 34" fill="none">
      <Path d="M14 32.8667C14 32.8667 25.3333 22.3267 25.3333 13.6C25.3333 10.5942 24.1393 7.71154 22.0139 5.58612C19.8885 3.46071 17.0058 2.26667 14 2.26667C10.9942 2.26667 8.11154 3.46071 5.98612 5.58612C3.86071 7.71154 2.66667 10.5942 2.66667 13.6C2.66667 22.3267 14 32.8667 14 32.8667Z" fill={color} />
      <Path d="M14 18.1333C16.5037 18.1333 18.5333 16.1037 18.5333 13.6C18.5333 11.0963 16.5037 9.06667 14 9.06667C11.4963 9.06667 9.46667 11.0963 9.46667 13.6C9.46667 16.1037 11.4963 18.1333 14 18.1333Z" fill="#FFFFFF" />
    </Svg>
  );
}
