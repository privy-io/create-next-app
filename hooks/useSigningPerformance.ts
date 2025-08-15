import { useState, useCallback } from "react";
import { Keypair } from "@solana/web3.js";
import { useSignMessage } from "@privy-io/react-auth/solana";
import { SigningUtils, SigningPerformanceData } from "../lib/signing-utils";

interface UseSigningPerformanceProps {
  localWallet: Keypair;
  privyWalletAddress?: string;
  webCryptoKeyPair: CryptoKeyPair;
}

interface TestConfig {
  numTests: number;
}

interface TestProgress {
  current: number;
  total: number;
  currentMethod: "local" | "privy-client" | "web-crypto" | "idle";
}

export function useSigningPerformance({
  localWallet,
  privyWalletAddress,
  webCryptoKeyPair,
}: UseSigningPerformanceProps) {
  const [results, setResults] = useState<SigningPerformanceData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<TestProgress>({
    current: 0,
    total: 0,
    currentMethod: "idle",
  });

  const { signMessage } = useSignMessage();

  const runPerformanceTest = useCallback(
    async (config: TestConfig) => {
      if (isRunning) return;

      setIsRunning(true);
      setResults([]);

      const testId = `test_${Date.now()}`;
      const totalTests = config.numTests * 3;
      const newResults: SigningPerformanceData[] = [];

      setProgress({ current: 0, total: totalTests, currentMethod: "idle" });

      let testCount = 0;

      // Run local wallet tests

      setProgress((prev) => ({ ...prev, currentMethod: "local" }));

      for (let i = 0; i < config.numTests; i++) {
        const message = SigningUtils.generateTestMessage(testId, i);
        const result = await SigningUtils.signWithLocalWallet(
          localWallet,
          message
        );

        // Skip the first test (warm-up)
        if (i > 0) {
          const perfData: SigningPerformanceData = {
            testId,
            timestamp: Date.now(),
            method: result.method,
            timeTaken: result.timeTaken,
          };

          newResults.push(perfData);
          setResults([...newResults]);
        }

        testCount++;
        setProgress((prev) => ({ ...prev, current: testCount }));

        // Small delay to prevent UI blocking
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Run Privy wallet tests

      setProgress((prev) => ({ ...prev, currentMethod: "privy-client" }));

      for (let i = 0; i < config.numTests; i++) {
        const message = SigningUtils.generateTestMessage(
          testId,
          i + config.numTests
        );
        const result = await SigningUtils.signWithPrivyClient(
          signMessage,
          message,
          privyWalletAddress
        );

        // Skip the first test (warm-up)
        if (i > 0) {
          const perfData: SigningPerformanceData = {
            testId,
            timestamp: Date.now(),
            method: result.method,
            timeTaken: result.timeTaken,
          };

          newResults.push(perfData);
          setResults([...newResults]);
        }

        testCount++;
        setProgress((prev) => ({ ...prev, current: testCount }));

        // Small delay to prevent UI blocking
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Run Web Crypto API tests

      setProgress((prev) => ({ ...prev, currentMethod: "web-crypto" }));

      for (let i = 0; i < config.numTests; i++) {
        const message = SigningUtils.generateTestMessage(
          testId,
          i + config.numTests * 2
        );
        const result = await SigningUtils.signWithWebCrypto(
          webCryptoKeyPair,
          message
        );
        // Skip the first test (warm-up)
        if (i > 0) {
          const perfData: SigningPerformanceData = {
            testId,
            timestamp: Date.now(),
            method: result.method,
            timeTaken: result.timeTaken,
          };

          newResults.push(perfData);
        }

        testCount++;

        setProgress((prev) => ({ ...prev, current: testCount }));
        setResults([...newResults]);

        // Small delay to prevent UI blocking
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      setIsRunning(false);
      setProgress((prev) => ({ ...prev, currentMethod: "idle" }));
    },
    [isRunning, localWallet, privyWalletAddress, signMessage]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setProgress({ current: 0, total: 0, currentMethod: "idle" });
  }, []);

  const stats = SigningUtils.calculateStats(results);

  return {
    results,
    isRunning,
    progress,
    stats,
    runPerformanceTest,
    clearResults,
  };
}
