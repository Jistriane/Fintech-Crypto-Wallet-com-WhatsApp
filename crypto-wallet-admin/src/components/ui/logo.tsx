import Image from 'next/image';
import { useTheme } from 'next-themes';
import { siteConfig } from '@/config/metadata';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 40, height = 40 }: LogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={className}>
      <Image
        src={isDark ? siteConfig.icons.logoWhite : siteConfig.icons.logo}
        alt={siteConfig.name}
        width={width}
        height={height}
        priority
      />
    </div>
  );
}
