import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Spinner from './Spinner';
import { X, ChevronRight, ChevronLeft, Twitter, MessageCircle, BarChart3, Video, Instagram, Mail, MessageSquare, Terminal, HardDrive, MessageSquareMore } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { LucideIcon } from 'lucide-react';

type TokenBalance = {
  mint: string;
  amount: number;
  decimals: number;
  tokenName?: string;
  symbol?: string;
  image?: string;
};

type ItemType = 'twitter' | 'telegram' | 'dexscreener' | 'tiktok' | 'instagram' | 'email' | 'discord' | 'private-chat' | 'terminal' | 'filesystem';

type PageItem = {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
  requiredAmount?: number;
};

interface SetupWizardProps {
  onClose: () => void;
  walletAddress: string;
  onComplete: () => void;
  existingSlug?: string | null;
  existingData?: {
    connectedToken?: string;
    title?: string;
    description?: string;
    image?: string;
    items?: PageItem[];
  };
}

type SocialLink = {
  type: 'twitter' | 'telegram' | 'dexscreener' | 'tiktok' | 'instagram' | 'email' | 'discord';
  url: string;
};

type Plugin = {
  id: 'terminal' | 'filesystem' | 'private-chat' | 'telegram';
  name: string;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

const TEMPLATES = [
  { id: 'default', name: 'Default', image: '/templates/default.png' },
  { id: 'minimal', name: 'Minimal', image: '/templates/minimal.png' },
  { id: 'dark', name: 'Dark Mode', image: '/templates/dark.png' },
];

const PLUGINS: Plugin[] = [
  {
    id: 'private-chat',
    name: 'Private Chat',
    description: 'Private, encrypted chat for users to reach you.',
    icon: MessageSquareMore
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'A place to post alpha, updates, and more.',
    icon: Terminal
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Upload videos, images and txt files only accessible to token holders',
    icon: HardDrive,
    comingSoon: true
  },
  {
    id: 'telegram',
    name: 'Telegram Channel',
    description: 'Create a token-gated Telegram channel for your community',
    icon: MessageSquareMore,
    comingSoon: false,
  },
];

// Add type for token metadata
type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
};

// Add type for token gating configuration
type TokenGateConfig = {
  pluginId: string;
  requiredAmount: number;
};

export default function SetupWizard({ onClose, walletAddress, onComplete, existingSlug, existingData }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [slug, setSlug] = useState(existingSlug || '');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [currentUserSlug, setCurrentUserSlug] = useState<string | null>(existingSlug || null);
  const [selectedToken, setSelectedToken] = useState<string | null>(existingData?.connectedToken || null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    existingData?.items?.filter(item => !item.isPlugin).map(item => ({
      type: item.type as SocialLink['type'],
      url: item.url || ''
    })) || []
  );
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(
    existingData?.items?.filter(item => item.isPlugin).map(item => item.type) || []
  );
  const [title, setTitle] = useState(existingData?.title || '');
  const [description, setDescription] = useState(existingData?.description || '');

  // Add state for token metadata
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null);

  // Add state for token gating
  const [tokenGatedPlugins, setTokenGatedPlugins] = useState<string[]>(
    existingData?.items?.filter(item => item.isPlugin && item.tokenGated).map(item => item.type) || []
  );

  // Update state to include required amounts
  const [tokenGateConfigs, setTokenGateConfigs] = useState<TokenGateConfig[]>(
    existingData?.items?.filter(item => item.isPlugin && item.tokenGated && item.requiredAmount)
      .map(item => ({
        pluginId: item.type,
        requiredAmount: item.requiredAmount || 1
      })) || []
  );

  const checkSlugAvailability = async () => {
    if (!slug) {
      setSlugError('Please enter a custom URL');
      return false;
    }

    // If this is the same slug the user is currently setting up, allow it
    if (currentUserSlug === slug) {
      setSlugError('This will update your existing page');
      return true;
    }

    setIsCheckingSlug(true);
    try {
      const response = await fetch(`/api/page-store?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      if (data.mapping) {
        // Check if this page belongs to the current user using the isOwner flag
        if (data.isOwner) {
          setCurrentUserSlug(slug);
          setSlugError('This will update your existing page');
          return true;
        }
        setSlugError('This URL is already taken');
        return false;
      }
      
      setSlugError('');
      return true;
    } catch (error) {
      console.error('Error checking URL availability:', error);
      setSlugError('Error checking URL availability');
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const fetchTokens = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch(`/api/tokens?address=${walletAddress}`);
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Add function to fetch token metadata
  const fetchTokenMetadata = async (tokenAddress: string) => {
    try {
      const response = await fetch(`/api/tokens/metadata?address=${tokenAddress}`);
      const data = await response.json();
      if (data.metadata) {
        setTokenMetadata(data.metadata);
        // Pre-fill title and description if they're empty
        if (!title) setTitle(data.metadata.name);
        if (!description && data.metadata.description) {
          setDescription(data.metadata.description);
        }
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error);
    }
  };

  // Update token selection handler
  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    fetchTokenMetadata(tokenAddress);
  };

  // Add helper function to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const handleNext = async () => {
    if (step === 1) {
      const isAvailable = await checkSlugAvailability();
      if (!isAvailable) return;

      // If this is a page we already own, skip the POST request
      if (currentUserSlug === slug) {
        setStep(step + 1);
        return;
      }

      // Store the page mapping
      try {
        const response = await fetch('/api/page-store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            walletAddress,
            isSetupWizard: true
          }),
          credentials: 'same-origin',
        });

        if (!response.ok) {
          const error = await response.json();
          setSlugError(error.error || 'Failed to save custom URL');
          return;
        }
        
        // Set the current user slug after successful creation
        setCurrentUserSlug(slug);
      } catch (error) {
        console.error('Error saving slug:', error);
        setSlugError('Failed to save custom URL');
        return;
      }

      setStep(step + 1);
      return;
    }

    // Add token connection after step 2
    if (step === 2 && selectedToken) {
      try {
        const response = await fetch('/api/page-store', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            connectedToken: selectedToken
          }),
          credentials: 'same-origin'
        });

        if (!response.ok) {
          console.error('Failed to connect token to page');
          // Optionally show error to user
          return;
        }
      } catch (error) {
        console.error('Error connecting token:', error);
        // Optionally show error to user
        return;
      }
    }

    if (step === 5) {
      setIsSubmitting(true);
      try {
        // Prepare the socials array with order numbers
        const orderedSocials = socialLinks.map((social, index) => ({
          ...social,
          id: `${social.type}-${Math.random().toString(36).substr(2, 9)}`,
          order: index
        }));

        // Prepare the plugins array with token gating information and required amounts
        const orderedPlugins = selectedPlugins.map((pluginId, index) => ({
          type: pluginId,
          order: index,
          tokenGated: tokenGatedPlugins.includes(pluginId),
          requiredAmount: tokenGateConfigs.find(c => c.pluginId === pluginId)?.requiredAmount
        }));

        // Save all configuration
        const response = await fetch('/api/page-store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            walletAddress,
            title,
            description,
            image: tokenMetadata?.image || null,
            items: [...orderedSocials, ...orderedPlugins],
            connectedToken: selectedToken,
            isSetupWizard: false  // This is final setup, not initial
          }),
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error('Failed to save page configuration');
        }

        await onComplete();
      } catch (error) {
        console.error('Error saving configuration:', error);
        // Show error to user
        alert('Failed to save your page configuration. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Choose Your Page URL</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">page.fun/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="your-custom-url"
                  pattern="^[a-zA-Z0-9-]+$"
                  title="Only letters, numbers, and hyphens allowed"
                  required
                />
              </div>
              {slugError && (
                <p className={`text-sm ${
                  slugError === 'This will update your existing page' 
                    ? 'text-amber-600 bg-amber-50 p-2 rounded border border-amber-200'
                    : 'text-red-500'
                }`}>
                  {slugError}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Connect a Token (Optional)</h2>
            <div className="space-y-4">
              {!tokens.length ? (
                <Button 
                  onClick={fetchTokens}
                  disabled={isLoadingTokens}
                >
                  {isLoadingTokens ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : null}
                  Fetch Tokens
                </Button>
              ) : (
                <>
                  <Select 
                    value={selectedToken || ''} 
                    onValueChange={handleTokenSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.mint} value={token.mint}>
                          {token.tokenName || 'Unknown Token'} 
                          {token.symbol && ` (${token.symbol})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Add token image preview */}
                  {tokenMetadata?.image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Token Image:</p>
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <img
                          src={tokenMetadata.image}
                          alt={tokenMetadata.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Hide image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {selectedToken && tokenMetadata && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">{tokenMetadata.name}</h3>
                {tokenMetadata.description && (
                  <p className="text-sm text-gray-600">{tokenMetadata.description}</p>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Page Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={tokenMetadata?.name || "Enter page title"}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={tokenMetadata?.description || "Enter page description"}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Add Social Links</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { type: 'twitter', icon: Twitter, label: 'Twitter' },
                { type: 'telegram', icon: MessageCircle, label: 'Telegram' },
                ...(selectedToken ? [{ type: 'dexscreener', icon: BarChart3, label: 'DexScreener' }] : []),
                { type: 'tiktok', icon: Video, label: 'TikTok' },
                { type: 'instagram', icon: Instagram, label: 'Instagram' },
                { type: 'email', icon: Mail, label: 'Email' },
                { type: 'discord', icon: MessageSquare, label: 'Discord' },
              ].map(({ type, icon: Icon, label }) => (
                <Card 
                  key={type}
                  className={`p-4 cursor-pointer transition-colors ${
                    socialLinks.some(link => link.type === type)
                      ? 'bg-violet-50 border-violet-500'
                      : 'hover:border-violet-300'
                  }`}
                  onClick={() => {
                    if (socialLinks.some(link => link.type === type)) {
                      setSocialLinks(socialLinks.filter(link => link.type !== type));
                    } else {
                      setSocialLinks([...socialLinks, { type: type as any, url: '' }]);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox 
                      checked={socialLinks.some(link => link.type === type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSocialLinks(socialLinks.filter(link => link.type !== type));
                        } else {
                          setSocialLinks([...socialLinks, { type: type as any, url: '' }]);
                        }
                      }}
                    />
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Plugins</h2>
            <div className="grid grid-cols-1 gap-4">
              {PLUGINS.map((plugin) => (
                <Card 
                  key={plugin.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    plugin.comingSoon ? 'opacity-50 cursor-not-allowed' :
                    selectedPlugins.includes(plugin.id)
                      ? 'bg-violet-50 border-violet-500'
                      : 'hover:border-violet-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="pt-1">
                      <Checkbox 
                        checked={selectedPlugins.includes(plugin.id)}
                        disabled={plugin.comingSoon}
                        onCheckedChange={(checked) => {
                          if (plugin.comingSoon) return;
                          if (checked) {
                            setSelectedPlugins(prev => [...prev, plugin.id]);
                          } else {
                            setSelectedPlugins(prev => prev.filter(id => id !== plugin.id));
                            // Also remove token gating if plugin is removed
                            setTokenGatedPlugins(prev => prev.filter(id => id !== plugin.id));
                          }
                        }}
                      />
                    </div>
                    <plugin.icon className="h-6 w-6 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{plugin.name}</h3>
                        {plugin.comingSoon && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {plugin.description}
                      </p>
                      {/* Add token gating option */}
                      {selectedPlugins.includes(plugin.id) && 
                       selectedToken && 
                       (plugin.id === 'private-chat' || plugin.id === 'terminal' || plugin.id === 'telegram') && (
                        <div className="mt-3 pl-6 border-l-2 border-violet-200 space-y-3">
                          <label className="flex items-center space-x-2">
                            <Checkbox 
                              checked={tokenGatedPlugins.includes(plugin.id)}
                              onCheckedChange={(checked) => {
                                setTokenGatedPlugins(prev => 
                                  checked 
                                    ? [...prev, plugin.id]
                                    : prev.filter(id => id !== plugin.id)
                                );
                                if (checked) {
                                  setTokenGateConfigs(prev => [...prev, { pluginId: plugin.id, requiredAmount: 1 }]);
                                } else {
                                  setTokenGateConfigs(prev => prev.filter(config => config.pluginId !== plugin.id));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              Limit access to token holders
                            </span>
                          </label>

                          {/* Add amount slider when token gating is enabled */}
                          {tokenGatedPlugins.includes(plugin.id) && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Required amount:</span>
                                <span className="font-medium">
                                  {formatNumber(tokenGateConfigs.find(c => c.pluginId === plugin.id)?.requiredAmount || 1)}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="1000000000"
                                step="1"
                                value={tokenGateConfigs.find(c => c.pluginId === plugin.id)?.requiredAmount || 1}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  setTokenGateConfigs(prev => {
                                    const existing = prev.find(c => c.pluginId === plugin.id);
                                    if (existing) {
                                      return prev.map(c => 
                                        c.pluginId === plugin.id 
                                          ? { ...c, requiredAmount: value }
                                          : c
                                      );
                                    }
                                    return [...prev, { pluginId: plugin.id, requiredAmount: value }];
                                  });
                                }}
                                className="w-full h-2 bg-violet-200 rounded-lg appearance-none cursor-pointer"
                              />
                              
                              {plugin.id === 'telegram' && (
                                <div className="mt-4 space-y-2">
                                  <label className="block text-sm text-gray-600">
                                    Telegram Invite Link
                                  </label>
                                  <Input
                                    type="text"
                                    placeholder="https://t.me/..."
                                    value={existingData?.items?.find(item => item.type === 'telegram')?.url || ''}
                                    onChange={(e) => {
                                      const newUrl = e.target.value;
                                      if (existingData) {
                                        const updatedItems = existingData.items?.map(item => 
                                          item.type === 'telegram'
                                            ? { ...item, url: newUrl }
                                            : item
                                        ) || [];
                                        
                                        onComplete({
                                          ...existingData,
                                          items: updatedItems
                                        });
                                      }
                                    }}
                                    className="w-full"
                                  />
                                  <p className="text-xs text-gray-500">
                                    Create a Telegram channel and paste its invite link here. Users will get access after token verification.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Choose a Template</h2>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-violet-50 border-violet-500'
                      : 'hover:border-violet-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="aspect-video bg-gray-100 mb-2">
                    {/* Template preview image would go here */}
                  </div>
                  <p className="text-center">{template.name}</p>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  };

  const canSkipStep = (currentStep: number) => {
    // Can't skip step 1 (slug creation)
    if (currentStep === 1) return false;
    // Can skip other steps
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Setup Your Page</h1>
          {/* Only show close button if we haven't created the page yet */}
          {step === 1 && (
            <button onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-8">
          {renderStep()}
        </div>

        <div className="flex justify-between">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex space-x-2 ml-auto">
            {step < 6 && canSkipStep(step) && (
              <Button
                variant="outline"
                onClick={() => setStep(step + 1)}
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isCheckingSlug || isSubmitting || (step === 1 && !slug)}
            >
              {isCheckingSlug || isSubmitting ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : null}
              {step === 6 ? 'Complete' : 'Next'}
              {step < 6 && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 