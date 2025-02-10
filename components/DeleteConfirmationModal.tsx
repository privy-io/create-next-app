import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Spinner from './Spinner';

interface DeleteConfirmationModalProps {
  slug: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  slug,
  onConfirm,
  onCancel
}: DeleteConfirmationModalProps) {
  const [confirmSlug, setConfirmSlug] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (confirmSlug !== slug) {
      setError('The URL does not match');
      return;
    }
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Page</h2>
          <button onClick={onCancel} disabled={isDeleting}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-red-600">
            <p className="font-medium">Warning: This action cannot be undone</p>
            <p className="text-sm mt-1">
              This will permanently delete your page at page.fun/{slug} and all associated data.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Please type <span className="font-medium">{slug}</span> to confirm
            </label>
            <Input
              type="text"
              value={confirmSlug}
              onChange={(e) => {
                setConfirmSlug(e.target.value);
                setError('');
              }}
              placeholder={slug}
              className="w-full"
              disabled={isDeleting}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!confirmSlug || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Page'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 