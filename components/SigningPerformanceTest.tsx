import React from "react";
import { Keypair } from "@solana/web3.js";
import { useSigningPerformance } from "../hooks/useSigningPerformance";
import SigningPerformanceChart from "./SigningPerformanceChart";

interface SigningPerformanceTestProps {
  localWallet: Keypair;
  privyWalletAddress?: string;
  webCryptoKeyPair: CryptoKeyPair;
}

export default function SigningPerformanceTest({
  localWallet,
  privyWalletAddress,
  webCryptoKeyPair,
}: SigningPerformanceTestProps) {
  const testConfig = {
    numTests: 15,
  };

  const {
    results,
    isRunning,
    progress,
    stats,
    runPerformanceTest,
    clearResults,
  } = useSigningPerformance({
    localWallet,
    privyWalletAddress,
    webCryptoKeyPair,
  });

  const handleRunTest = (): void => {
    runPerformanceTest(testConfig);
  };

  const progressPercentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className={`px-6 py-3 rounded-md font-medium text-lg ${
              isRunning
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700 text-white shadow-lg"
            }`}
          >
            {isRunning
              ? "Running Performance Test..."
              : "🚀 Start Performance Test"}
          </button>

          <button
            onClick={clearResults}
            disabled={isRunning || results.length === 0}
            className={`px-4 py-2 rounded-md font-medium ${
              isRunning || results.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            Clear Results
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Testing {progress.currentMethod} wallet...</span>
              <span>
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {stats.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div key={stat.method} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {stat.method === "local"
                    ? "Local Wallet"
                    : stat.method === "privy-client"
                    ? "Privy Wallet"
                    : "Web Crypto API"}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Average Time:</span>
                    <span className="font-mono">
                      {stat.avgTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Time:</span>
                    <span className="font-mono">
                      {stat.minTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tests:</span>
                    <span>{stat.totalTests}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Detailed Results */}
      <SigningPerformanceChart data={results} stats={stats} />
    </div>
  );
}
