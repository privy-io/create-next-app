import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SaveBarProps {
  isSaving: boolean;
  isAuthenticated: boolean;
  canEdit: boolean;
  onSave: () => void;
  onConnect: () => void;
  className?: string;
}

export function SaveBar({
  isSaving,
  isAuthenticated,
  canEdit,
  onSave,
  onConnect,
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
    <div className={`sticky bottom-0 w-full px-6 py-3 bg-background border-t flex justify-between space-x-2 ${className}`}>
      <div>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 text-muted-foreground hover:text-foreground ${showJiggle ? 'animate-wiggle' : ''}`}
          onClick={() => window.open(`/${page}`, '_blank')}
        >
          {page}.page.fun
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/')}
          disabled={isSaving}
        >
          Cancel
        </Button>
        
        {!isAuthenticated ? (
          <Button onClick={onConnect} size="sm">
            Connect Wallet to Save
          </Button>
        ) : !canEdit ? (
          <Button disabled>
            Not Authorized to Edit
          </Button>
        ) : (
          <Button
            onClick={onSave}
            size="sm"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Publish'}
          </Button>
        )}
      </div>
    </div>
  );
} 