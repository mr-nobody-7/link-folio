import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('rounded-md bg-gray-200 animate-pulse', className)} />;
}
