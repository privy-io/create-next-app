const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function validateLinkUrl(url: string, presetId: string): boolean {
  if (!url) return false;

  // For email links
  if (presetId === "email") {
    // Allow both email addresses and mailto: URLs
    if (url.startsWith("mailto:")) {
      const email = url.replace("mailto:", "");
      return email.includes("@") || email === ""; // Allow empty email after mailto:
    }
    return url.includes("@");
  }

  // For telegram links
  if (presetId === "telegram" || presetId === "private-chat") {
    return url.startsWith("https://t.me/");
  }

  // For discord links
  if (presetId === "discord") {
    return url.startsWith("https://discord.gg/") || url.startsWith("https://discord.com/");
  }

  // For twitter links
  if (presetId === "twitter") {
    return url.startsWith("https://twitter.com/") || url.startsWith("https://x.com/");
  }

  // For tiktok links
  if (presetId === "tiktok") {
    return url.startsWith("https://tiktok.com/@") || url.startsWith("https://www.tiktok.com/@");
  }

  // For instagram links
  if (presetId === "instagram") {
    return url.startsWith("https://instagram.com/") || url.startsWith("https://www.instagram.com/");
  }

  // For dexscreener links
  if (presetId === "dexscreener") {
    return url.startsWith("https://dexscreener.com/");
  }

  // For github links
  if (presetId === "github") {
    return url.startsWith("https://github.com/");
  }

  // For facebook links
  if (presetId === "facebook") {
    return url.startsWith("https://facebook.com/") || url.startsWith("https://www.facebook.com/");
  }

  // For jupiter links
  if (presetId === "jupiter") {
    return url.startsWith("https://jup.ag/");
  }

  // For bubblemaps links
  if (presetId === "bubblemaps") {
    return url.startsWith("https://app.bubblemaps.io/");
  }

  // For general links (terminal, filesystem, etc)
  return urlRegex.test(url);
}