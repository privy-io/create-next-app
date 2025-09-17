"use client";
import { useCrossAppAccounts, useLinkAccount } from "@privy-io/react-auth";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";
type Method =
  | "email"
  | "phone"
  | "wallet"
  | "google"
  | "apple"
  | "twitter"
  | "discord"
  | "github"
  | "linkedin"
  | "tiktok"
  | "line"
  | "spotify"
  | "instagram"
  | "farcaster"
  | "telegram"
  | "passkey"
  | "crossAppAccount"
  | null;
const LinkAccounts = () => {
  const { linkCrossAppAccount } = useCrossAppAccounts();
  const handlers = useLinkAccount({
    onSuccess: ({ linkMethod }) => {
      showSuccessToast(`${linkMethod} account linked successfully`);
    },
    onError: (e) => {
      console.log(e);
      showErrorToast(`Account linking failed`);
    },
  });
  const availableOptions: Method[] = [
    "email",
    "phone",
    "wallet",
    "google",
    "apple",
    "twitter",
    "discord",
    "github",
    "linkedin",
    "tiktok",
    "line",
    "spotify",
    "instagram",
    "farcaster",
    "telegram",
    "passkey",
    "crossAppAccount",
  ];

  const getHandlerForMethod = (method: Method) => {
    switch (method) {
      case "email":
        return handlers.linkEmail;
      case "phone":
        return handlers.linkPhone;
      case "wallet":
        return handlers.linkWallet;
      case "google":
        return handlers.linkGoogle;
      case "apple":
        return handlers.linkApple;
      case "twitter":
        return handlers.linkTwitter;
      case "discord":
        return handlers.linkDiscord;
      case "github":
        return handlers.linkGithub;
      case "linkedin":
        return handlers.linkLinkedIn;
      case "tiktok":
        return handlers.linkTiktok;
      case "line":
        return handlers.linkLine;
      case "spotify":
        return handlers.linkSpotify;
      case "instagram":
        return handlers.linkInstagram;
      case "farcaster":
        return handlers.linkFarcaster;
      case "telegram":
        return () => handlers.linkTelegram({ launchParams: {} });
      case "passkey":
        return handlers.linkPasskey;
      case "crossAppAccount":
        return () => {
          linkCrossAppAccount({
            appId: "cm04asygd041fmry9zmcyn5o5",
          });
        };
      default:
        return () => {};
    }
  };

  const availableActions = [
    ...availableOptions
      .filter((option): option is NonNullable<Method> => option !== null)
      .map((option) => ({
        name: `Link ${option.charAt(0).toUpperCase() + option.slice(1)}`,
        function: () => {
          getHandlerForMethod(option)();
        },
      })),
  ];
  return (
    <Section
      name="Link accounts"
      description={
        "Link social accounts or external wallets to the current user."
      }
      filepath="src/components/sections/link-accounts"
      actions={availableActions}
    />
  );
};

export default LinkAccounts;
