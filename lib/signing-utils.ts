import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

/**
 * Result of a single signing operation
 */
export interface SigningResult {
  timeTaken: number; // How long the signing took in milliseconds
  signature: string; // The base64-encoded signature
  method: "local" | "privy-client" | "web-crypto";
}

/**
 * Performance data collected during testing
 */
export interface SigningPerformanceData {
  testId: string; // Unique identifier for this test run
  timestamp: number; // When this test was executed
  method: "local" | "privy-client" | "web-crypto"; // Which signing method was used
  timeTaken: number; // How long this signing operation took (ms)
}

/**
 * Utilities for testing different signing methods and measuring their performance
 */
export class SigningUtils {
  /**
   * METHOD 1: Local Solana Wallet Signing
   *
   * This is the fastest method - direct cryptographic operations using:
   * - Solana's Ed25519 keypair (@solana/web3.js)
   * - TweetNaCl for the actual signing (tweetnacl library)
   *
   * How it works:
   * 1. Convert string message to bytes
   * 2. Use Ed25519 algorithm to create a detached signature
   * 3. Return base64-encoded signature
   */
  static async signWithLocalWallet(
    keypair: Keypair,
    message: string
  ): Promise<SigningResult> {
    // Start timing the operation
    const startTime = performance.now();

    // Convert the message string to bytes that can be signed
    const messageBytes = new TextEncoder().encode(message);

    // Create an Ed25519 signature using the keypair's secret key
    // This is a "detached" signature (signature separate from message)
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    // Stop timing
    const endTime = performance.now();

    return {
      timeTaken: endTime - startTime,
      signature: Buffer.from(signature).toString("base64"),
      method: "local",
    };
  }

  /**
   * METHOD 2: Privy Embedded Wallet Signing
   *
   * This method uses Privy's embedded wallet infrastructure:
   * - Wallet keys are managed by Privy's secure infrastructure
   * - Signing happens through Privy's React hook (useSignMessage)
   * - May involve network calls and UI interactions
   * - Generally slower due to the abstraction layer
   *
   * How it works:
   * 1. Convert message to bytes
   * 2. Call Privy's signMessage function (from useSignMessage hook)
   * 3. Privy handles the cryptographic signing internally
   * 4. Return the signature as base64
   */
  static async signWithPrivyClient(
    signMessage: (params: {
      message: Uint8Array;
      options?: { address?: string };
    }) => Promise<Uint8Array>,
    message: string,
    walletAddress?: string
  ): Promise<SigningResult> {
    // Start timing the operation
    const startTime = performance.now();

    // Convert message to bytes for Privy's signing function
    const messageBytes = new TextEncoder().encode(message);

    // Call Privy's signing function with the message bytes
    // This may involve network requests to Privy's infrastructure
    const signatureUint8Array = await signMessage({
      message: messageBytes,
      options: walletAddress ? { address: walletAddress } : undefined,
    });

    // Stop timing
    const endTime = performance.now();

    return {
      timeTaken: endTime - startTime,
      signature: Buffer.from(signatureUint8Array).toString("base64"),
      method: "privy-client",
    };
  }

  /**
   * METHOD 3: Browser Web Crypto API Signing
   *
   * This method uses the browser's built-in Web Crypto API:
   * - Uses ECDSA with P-256 curve (different from Solana's Ed25519)
   * - Uses a single deterministic keypair for all tests (fair comparison)
   * - All operations happen in the browser's secure crypto context
   * - Performance varies by browser implementation
   *
   * How it works:
   * 1. Generate keypair once (cached for consistent testing)
   * 2. Convert message to bytes
   * 3. Sign using ECDSA + SHA-256 algorithm
   * 4. Return signature as base64
   *
   * Note: Key generation happens once, then cached for fair comparison
   */
  /**
   * Initialize Web Crypto keypair - call this once at startup
   * This ensures the keypair is ready and timing only measures signing, not key generation
   */
  static async signWithWebCrypto(
    webCryptoKeyPair: CryptoKeyPair,
    message: string
  ): Promise<SigningResult> {
    // Start timing the signing operation (not key generation for fair comparison)
    const startTime = performance.now();

    // Convert message string to bytes
    const messageBytes = new TextEncoder().encode(message);

    // Create signature using ECDSA + SHA-256
    const signature = await crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: "SHA-256", // Use SHA-256 for hashing before signing
      },
      webCryptoKeyPair.privateKey, // Use the pre-generated private key
      messageBytes
    );

    // Stop timing
    const endTime = performance.now();

    return {
      timeTaken: endTime - startTime,
      signature: Buffer.from(signature).toString("base64"),
      method: "web-crypto",
    };
  }

  /**
   * Generate a unique test message for each signing operation
   *
   * Each message is unique to prevent any caching optimizations
   * that might skew performance results
   */
  static generateTestMessage(testId: string, iteration: number): string {
    return `Performance test ${testId} - iteration ${iteration} - timestamp ${Date.now()}`;
  }

  /**
   * Calculate performance statistics from test results
   *
   * Groups results by signing method and calculates:
   * - Average time (most important metric)
   * - Minimum time (best case performance)
   * - Maximum time (worst case performance)
   * - Median time (middle value, less affected by outliers)
   */
  static calculateStats(results: SigningPerformanceData[]) {
    // Group results by signing method (local, privy-client, web-crypto)
    const byMethod = results.reduce((acc, result) => {
      if (!acc[result.method]) {
        acc[result.method] = [];
      }
      acc[result.method]!.push(result);
      return acc;
    }, {} as Record<string, SigningPerformanceData[]>);

    // Calculate statistics for each method
    return Object.entries(byMethod).map(([method, methodResults]) => {
      const times = methodResults.map((r) => r.timeTaken);

      return {
        method,
        totalTests: methodResults.length,
        avgTime:
          times.length > 0
            ? times.reduce((a, b) => a + b, 0) / times.length
            : 0,
        minTime: times.length > 0 ? Math.min(...times) : 0,
        maxTime: times.length > 0 ? Math.max(...times) : 0,
        medianTime: times.length > 0 ? this.calculateMedian(times) : 0,
      };
    });
  }

  /**
   * Calculate the median (middle value) from a list of numbers
   *
   * Median is often more reliable than average because it's not
   * affected by extreme outliers (very slow or very fast results)
   */
  private static calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    // If even number of values, take average of two middle values
    // If odd number of values, take the exact middle value
    return sorted.length % 2 === 0
      ? (sorted[mid - 1]! + sorted[mid]!) / 2
      : sorted[mid]!;
  }
}
