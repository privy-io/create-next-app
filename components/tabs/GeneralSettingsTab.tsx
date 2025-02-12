import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import TokenSelector from '@/components/TokenSelector';
import { PageData } from '@/types';

interface GeneralSettingsTabProps {
  pageDetails: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
}

export function GeneralSettingsTab({ pageDetails, setPageDetails }: GeneralSettingsTabProps) {
  return (
    <div className="space-y-6 px-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Solana Token
        </label>
        {pageDetails && (
          <div className="space-y-4">
            {pageDetails.connectedToken ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pageDetails.connectedToken}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-sm text-gray-600"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPageDetails(prev => prev ? {
                          ...prev,
                          connectedToken: '',
                          tokenSymbol: undefined,
                          showToken: false,
                          showSymbol: false
                        } : null);
                      }}
                    >
                      Unlink
                    </Button>
                  </div>
                  {pageDetails.tokenSymbol && (
                    <p className="mt-1 text-sm text-gray-500">
                      ${pageDetails.tokenSymbol}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Token Display Options</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-token"
                      checked={pageDetails.showToken}
                      onCheckedChange={(checked) => {
                        setPageDetails(prev => prev ? {
                          ...prev,
                          showToken: checked as boolean
                        } : null);
                      }}
                    />
                    <label
                      htmlFor="show-token"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Show token address on page
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-symbol"
                      checked={pageDetails.showSymbol}
                      onCheckedChange={(checked) => {
                        setPageDetails(prev => prev ? {
                          ...prev,
                          showSymbol: checked as boolean
                        } : null);
                      }}
                    />
                    <label
                      htmlFor="show-symbol"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Show token symbol on page
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <TokenSelector
                walletAddress={pageDetails.walletAddress}
                selectedToken={null}
                onTokenSelect={(tokenAddress) => {
                  if (!tokenAddress) return;
                  setPageDetails(prev => prev ? {
                    ...prev,
                    connectedToken: tokenAddress,
                    tokenSymbol: undefined // Clear the symbol when token changes
                  } : null);
                }}
                onMetadataLoad={(metadata) => {
                  if (!metadata) return;
                  setPageDetails(prev => prev ? {
                    ...prev,
                    title: metadata.name,
                    description: metadata.description || '',
                    image: metadata.image || '',
                    tokenSymbol: metadata.symbol
                  } : null);
                }}
              />
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <div className="space-y-4">
          {pageDetails?.image && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <img
                src={pageDetails.image}
                alt={pageDetails.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <Input
            type="text"
            value={pageDetails?.image || ''}
            onChange={(e) => setPageDetails(prev => prev ? {
              ...prev,
              image: e.target.value
            } : null)}
            placeholder="Enter image URL"
            className="max-w-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          type="text"
          value={pageDetails?.title || ''}
          onChange={(e) => setPageDetails(prev => prev ? {
            ...prev,
            title: e.target.value
          } : null)}
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={pageDetails?.description || ''}
          onChange={(e) => setPageDetails(prev => prev ? {
            ...prev,
            description: e.target.value
          } : null)}
          className="w-full p-2 border rounded-md"
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  );
} 