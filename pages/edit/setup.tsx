import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Twitter, MessageCircle, BarChart3, Video, Instagram, Mail, MessageSquare, Terminal, HardDrive, MessageSquareMore } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { isSolanaWallet } from '@/utils/wallet';
import Spinner from '@/components/Spinner';
import TokenSelector from '@/components/TokenSelector';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import PagePreview from "@/components/PagePreview";
import { GOOGLE_FONTS } from '@/lib/fonts';
import { ItemType } from '@/types';

// Types
type TokenBalance = {
  mint: string;
  amount: number;
  decimals: number;
  tokenName?: string;
  symbol?: string;
  image?: string;
};

type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
};

type SocialLink = {
  type: 'twitter' | 'telegram' | 'dexscreener' | 'tiktok' | 'instagram' | 'email' | 'discord';
  url: string;
};

type Plugin = {
  id: 'terminal' | 'filesystem' | 'private-chat';
  name: string;
  description: string;
  icon: any;
  comingSoon?: boolean;
  tokenGated?: boolean;
};

type PageData = {
  walletAddress: string;
  createdAt: string;
  title?: string;
  description?: string;
  items?: PageItem[];
  updatedAt?: string;
  image?: string;
  slug: string;
  connectedToken?: string;
  tokenSymbol?: string;
  showToken?: boolean;
  showSymbol?: boolean;
  designStyle?: 'default' | 'minimal' | 'modern';
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
};

type PageItem = {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
  requiredAmount?: number;
};

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
  }
];

// Helper function to format large numbers
const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

export default function SetupPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout, linkWallet, unlinkWallet } = usePrivy();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [slug, setSlug] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [tokenGatedPlugins, setTokenGatedPlugins] = useState<string[]>([]);
  const [tokenGateConfigs, setTokenGateConfigs] = useState<{ pluginId: string; requiredAmount: number; }[]>([]);
  const [previewData, setPreviewData] = useState<PageData | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  const checkSlugAvailability = async () => {
    if (!slug) {
      setSlugError('Please enter a custom URL');
      return false;
    }

    setIsCheckingSlug(true);
    try {
      const response = await fetch(`/api/page-store?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      if (data.mapping) {
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
    if (!solanaWallet) return;
    
    setIsLoadingTokens(true);
    try {
      const response = await fetch(`/api/tokens?address=${solanaWallet.address}`);
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const fetchTokenMetadata = async (tokenAddress: string) => {
    try {
      const response = await fetch(`/api/tokens/metadata?address=${tokenAddress}`);
      const data = await response.json();
      if (data.metadata) {
        setTokenMetadata(data.metadata);
        if (!title) setTitle(data.metadata.name);
        if (!description && data.metadata.description) {
          setDescription(data.metadata.description);
        }
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error);
    }
  };

  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    fetchTokenMetadata(tokenAddress);
  };

  const handleNext = async () => {
    if (step === 1) {
      const isAvailable = await checkSlugAvailability();
      if (!isAvailable) return;

      try {
        const response = await fetch('/api/page-store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            walletAddress: solanaWallet?.address,
            isSetupWizard: true,
            createdAt: new Date().toISOString()
          }),
          credentials: 'same-origin',
        });

        if (!response.ok) {
          const error = await response.json();
          setSlugError(error.error || 'Failed to save custom URL');
          return;
        }
      } catch (error) {
        console.error('Error saving slug:', error);
        setSlugError('Failed to save custom URL');
        return;
      }
    }

    if (step === 2 && selectedToken) {
      try {
        const response = await fetch('/api/page-store', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            connectedToken: selectedToken,
            tokenSymbol: tokenMetadata?.symbol,
            showToken: true,
            showSymbol: true
          }),
          credentials: 'same-origin'
        });

        if (!response.ok) {
          console.error('Failed to connect token to page');
          return;
        }
      } catch (error) {
        console.error('Error connecting token:', error);
        return;
      }
    }

    if (step === 5) {
      setIsSubmitting(true);
      try {
        // Prepare the socials array with order numbers
        const orderedSocials = socialLinks.map((social, index) => ({
          id: `social-${index}`,
          type: social.type,
          url: social.url || '',
          order: index,
          isPlugin: false
        }));

        // Prepare the plugins array with token gating information
        const orderedPlugins = selectedPlugins.map((pluginId, index) => ({
          id: `plugin-${index}`,
          type: pluginId as ItemType,
          order: socialLinks.length + index,
          isPlugin: true,
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
            walletAddress: solanaWallet?.address,
            title: title || (tokenMetadata?.name || 'My Page'),
            description: description || tokenMetadata?.description || '',
            image: tokenMetadata?.image || null,
            items: [...orderedSocials, ...orderedPlugins],
            connectedToken: selectedToken || null,
            tokenSymbol: tokenMetadata?.symbol || null,
            showToken: !!selectedToken,
            showSymbol: !!selectedToken && !!tokenMetadata?.symbol,
            designStyle: 'modern',
            fonts: {
              global: 'Inter',
              heading: 'inherit',
              paragraph: 'inherit',
              links: 'inherit'
            },
            createdAt: new Date().toISOString(),
            isSetupWizard: false
          }),
          credentials: 'same-origin',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save page configuration');
        }

        // Navigate to edit page
        router.push(`/edit/${slug}`);
        return;
      } catch (error) {
        console.error('Error saving configuration:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save your page configuration. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep(step + 1);
  };

  useEffect(() => {
    const currentPageDetails = {
      title: title || (tokenMetadata?.name || 'My Page'),
      description: description || tokenMetadata?.description || '',
      image: tokenMetadata?.image || '',
      walletAddress: solanaWallet?.address || '',
      connectedToken: selectedToken || '',
      tokenSymbol: tokenMetadata?.symbol || '',
      showToken: true,
      showSymbol: true,
      designStyle: 'modern' as const,
      fonts: {
        global: 'Inter',
        heading: 'inherit',
        paragraph: 'inherit',
        links: 'inherit'
      },
      createdAt: new Date().toISOString(),
      slug: slug || ''
    };

    const items = [];
      
    // Add social links to preview
    if (socialLinks.length > 0) {
      items.push(...socialLinks.map((link, index) => ({
        id: `social-${index}`,
        type: link.type,
        url: link.url || '',
        order: index,
        isPlugin: false
      })));
    }

    // Add selected plugins to preview
    if (selectedPlugins.length > 0) {
      items.push(...selectedPlugins.map((pluginId, index) => ({
        id: `plugin-${index}`,
        type: pluginId as ItemType,
        order: socialLinks.length + index,
        isPlugin: true,
        tokenGated: tokenGatedPlugins.includes(pluginId),
        requiredAmount: tokenGateConfigs.find(c => c.pluginId === pluginId)?.requiredAmount
      })));
    }

    setPreviewData({
      ...currentPageDetails,
      items
    });
  }, [title, description, socialLinks, selectedPlugins, tokenGatedPlugins, tokenGateConfigs, tokenMetadata, selectedToken, solanaWallet, slug]);

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
                <p className="text-sm text-red-500">
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
              {solanaWallet && (
                <TokenSelector
                  walletAddress={solanaWallet.address}
                  selectedToken={selectedToken}
                  onTokenSelect={(tokenAddress) => {
                    if (!tokenAddress) return;
                    setSelectedToken(tokenAddress);
                  }}
                  onMetadataLoad={(metadata) => {
                    if (!metadata) return;
                    setTokenMetadata(metadata);
                    if (!title) setTitle(metadata.name);
                    if (!description && metadata.description) {
                      setDescription(metadata.description);
                    }
                  }}
                />
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
                          setSocialLinks([...socialLinks, { type: type as any, url: '' }]);
                        } else {
                          setSocialLinks(socialLinks.filter(link => link.type !== type));
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
                      {selectedPlugins.includes(plugin.id) && 
                       selectedToken && 
                       (plugin.id === 'private-chat' || plugin.id === 'terminal') && (
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
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>1</span>
                                <span>1B</span>
                              </div>
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
    }
  };

  return (
    <>
      <Head>
        <title>Setup Your Page - Page.fun</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href={`https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(font => font.replace(' ', '+')).join('&family=')}&display=swap`}
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/page.css" />
      </Head>

      <main className="min-h-screen">
        <div>
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[440px] p-0 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold mb-2">Setup Your Page</h1>
                      <p className="text-gray-600">Step {step} of 5</p>
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
                          Back
                        </Button>
                      )}
                      <div className="flex space-x-2 ml-auto">
                        {step < 5 && step > 1 && (
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
                          {step === 5 ? 'Complete Setup' : 'Next'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex">
            {/* Left Column - Setup Wizard (Hidden on mobile) */}
            <div className="w-[440px] hidden lg:block space-y-8 border-r border-gray-100 relative">
              <div className="bg-background overflow-y-auto h-screen p-6">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2">Setup Your Page</h1>
                  <p className="text-gray-600">Step {step} of 5</p>
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
                      Back
                    </Button>
                  )}
                  <div className="flex space-x-2 ml-auto">
                    {step < 5 && step > 1 && (
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
                      {step === 5 ? 'Complete Setup' : 'Next'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="pf-preview sticky top-0 right-0 flex-1" style={{ height: 'calc(100vh)' }}>
              {previewData && <PagePreview pageData={previewData} />}
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </>
  );
} 