import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

export default function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn('rounded-md bg-gray-200 animate-pulse', className)}
    />
  );
}
