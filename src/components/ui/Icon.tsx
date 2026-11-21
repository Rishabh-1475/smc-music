import React from 'react';

const ICONS: Record<string, { d: string; fill?: boolean }> = {
  play: { d: 'M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z', fill: true },
  pause: { d: 'M7 4.8h3.4v14.4H7zM13.6 4.8H17v14.4h-3.4z', fill: true },
  next: { d: 'M5.5 5.4v13.2a.5.5 0 0 0 .8.4l9-6.6a.5.5 0 0 0 0-.8l-9-6.6a.5.5 0 0 0-.8.4zM17 5h2.2v14H17z', fill: true },
  prev: { d: 'M18.5 5.4v13.2a.5.5 0 0 1-.8.4l-9-6.6a.5.5 0 0 1 0-.8l9-6.6a.5.5 0 0 1 .8.4zM7 5H4.8v14H7z', fill: true },
  shuffle: { d: 'M16 3.5h4.5V8M4 20 20.5 3.5M20.5 16v4.5H16M14.5 15 20.5 21M4 4l5 5' },
  repeat: { d: 'M17 2.5l3.5 3.5L17 9.5M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5M7 21.5 3.5 18 7 14.5M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5' },
  heart: { d: 'M12 20.2s-7.6-4.6-9.3-9.4A5.1 5.1 0 0 1 12 6.3a5.1 5.1 0 0 1 9.3 4.5C19.6 15.6 12 20.2 12 20.2z' },
  volume: { d: 'M4 9.5v5h3.6L12.5 18.6V5.4L7.6 9.5H4zM15.8 9a4.2 4.2 0 0 1 0 6M18.4 6.4a8 8 0 0 1 0 11.2' },
  volumeLow: { d: 'M4 9.5v5h3.6L12.5 18.6V5.4L7.6 9.5H4zM15.8 9a4.2 4.2 0 0 1 0 6' },
  mute: { d: 'M4 9.5v5h3.6L12.5 18.6V5.4L7.6 9.5H4zM16.5 9.5l4.5 5M21 9.5l-4.5 5' },
  mic: { d: 'M12 3.2a3 3 0 0 0-3 3v5.6a3 3 0 0 0 6 0V6.2a3 3 0 0 0-3-3zM5.5 11.4a6.5 6.5 0 0 0 13 0M12 18v3' },
  search: { d: 'M11 4.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zM20 20l-4.2-4.2' },
  home: { d: 'M3.5 11 12 4l8.5 7M6 9.6V20h12V9.6M10 20v-5.2h4V20' },
  library: { d: 'M4.5 5h3.2v14H4.5zM10 5h3.2v14H10zM15.4 7.2l3-.8 3 11.6-3 .8z' },
  astra: { d: 'M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9zM18.6 16.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z' },
  queue: { d: 'M4 6h12M4 11h12M4 16h6M15 14l6 3.5-6 3.5z' },
  x: { d: 'M6 6l12 12M18 6 6 18' },
  send: { d: 'M4 12 20 4l-4.5 16-3.5-6.5L4 12zM12 13.5 20 4' },
  check: { d: 'M5 12.5l4.5 4.5L19 7.5' },
  bolt: { d: 'M13 3 5 13.5h6L10 21l8-10.5h-6z' },
  wave: { d: 'M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M22 12h-1' },
  retry: { d: 'M20 11a8 8 0 1 0-2.3 5.7M20 4.5V11h-6.5' },
  plus: { d: 'M12 5v14M5 12h14' },
  external: { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3' },
  maximize: { d: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3' }
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 20, className = '', ...rest }: IconProps) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={icon.fill ? 'currentColor' : 'none'}
      stroke={icon.fill ? 'none' : 'currentColor'}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={icon.d} />
    </svg>
  );
}
