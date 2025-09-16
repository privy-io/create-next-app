"use client";

import { useSessionSigners, useWallets } from "@privy-io/react-auth";
import Section from "../reusables/section";
import { toast } from "react-toastify";

const SessionSigners = () => {
  const { wallets } = useWallets();
  const { addSessionSigners, removeSessionSigners } = useSessionSigners();

  const handleAddSessionSigners = async () => {
    try {
      await addSessionSigners({
        address: wallets[0]?.address,
        signers: [
          {
            signerId: process.env.PRIVY_SIGNER_ID!,
            policyIds: [],
          },
        ],
      });
      toast.success("Session signer added");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to add session signer";
      toast.error(message);
    }
  };

  const handleRemoveSessionSigners = async () => {
    try {
      await removeSessionSigners({
        address: wallets[0]?.address,
      });
      toast.success("Session signer removed");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to remove session signer";
      toast.error(message);
    }
  };

  const availableActions = [
    {
      name: "Add Session Signer",
      function: handleAddSessionSigners,
    },
    {
      name: "Remove Session Signer",
      function: handleRemoveSessionSigners,
    },
  ];

  return (
    <Section
      name="Session Signers"
      description={
        "Delegate signing to a trusted service for actions like limit orders or scheduled transactions when the user is offline."
      }
      filepath="src/components/sections/session-signers"
      actions={availableActions}
    />
  );
};

export default SessionSigners;
