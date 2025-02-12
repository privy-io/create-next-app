import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Spinner from './Spinner';
import { useRouter } from 'next/router';

interface CreatePageModalProps {
  walletAddress: string;
  onClose: () => void;
}

// Default items for new pages
const DEFAULT_ITEMS = [
  {
    id: 'terminal-1',
    type: 'terminal',
    order: 0,
    isPlugin: true,
    tokenGated: false
  },
  {
    id: 'private-chat-1',
    type: 'private-chat',
    order: 1,
    isPlugin: true,
    tokenGated: false
  },
  {
    id: 'twitter-1',
    type: 'twitter',
    url: '',
    order: 2,
    isPlugin: false
  },
  {
    id: 'telegram-1',
    type: 'telegram',
    url: '',
    order: 3,
    isPlugin: false
  }
];

export default function CreatePageModal({
  walletAddress,
  onClose
}: CreatePageModalProps) {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState('');

  const handleSubmit = async () => {
    if (!slug) {
      setSlugError('Please enter a custom URL');
      return;
    }

    setIsCheckingSlug(true);
    try {
      // First check if slug is available
      const checkResponse = await fetch(`/api/page-store?slug=${encodeURIComponent(slug)}`);
      const checkData = await checkResponse.json();
      
      if (checkData.mapping) {
        // If user owns this page, redirect to edit
        if (checkData.isOwner) {
          router.push(`/edit/${slug}`);
          return;
        }
        setSlugError('This URL is already taken');
        setIsCheckingSlug(false);
        return;
      }

      // Create new page with default items
      const response = await fetch('/api/page-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          walletAddress,
          isSetupWizard: false,
          createdAt: new Date().toISOString(),
          items: DEFAULT_ITEMS,
          title: 'My Page',
          description: 'A page for my community',
          designStyle: 'modern',
          fonts: {
            global: 'Inter',
            heading: 'inherit',
            paragraph: 'inherit',
            links: 'inherit'
          }
        }),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const error = await response.json();
        setSlugError(error.error || 'Failed to save custom URL');
        return;
      }

      // Redirect to edit page
      router.push(`/edit/${slug}`);
    } catch (error) {
      console.error('Error:', error);
      setSlugError('An error occurred. Please try again.');
    } finally {
      setIsCheckingSlug(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create Your Page</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">page.fun/</span>
              <Input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugError('');
                }}
                placeholder="your-custom-url"
                pattern="^[a-zA-Z0-9-]+$"
                title="Only letters, numbers, and hyphens allowed"
                required
              />
            </div>
            {slugError && (
              <p className="text-sm text-red-500">
                {slugError}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCheckingSlug}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCheckingSlug || !slug}
            >
              {isCheckingSlug ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Page'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 