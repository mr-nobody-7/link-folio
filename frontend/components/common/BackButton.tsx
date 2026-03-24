'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BackButtonProps = {
  className?: string;
};

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => router.back()}
      className={cn('border-[#ec5c33]/35 text-[#504d46] hover:bg-[#ec5c33]/5', className)}
    >
      Go back
    </Button>
  );
}
