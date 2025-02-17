import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SaveBarProps {
  isSaving: boolean;
  onSave: () => void;
  className?: string;
}

export function SaveBar({
  isSaving,
  onSave,
  className = ''
}: SaveBarProps) {
  const router = useRouter();
  const { page } = router.query;
  const [showJiggle, setShowJiggle] = useState(false);

  // Add jiggle animation when saving is complete
  useEffect(() => {
    if (!isSaving) {
      setShowJiggle(true);
      const timer = setTimeout(() => setShowJiggle(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${page}`)}
          disabled={isSaving}
        >
          Go to page
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Publish'}
        </Button>
      </div>
    </div>
  );
} 