"use client";

import { useMfaEnrollment } from "@privy-io/react-auth";
import Section from "../reusables/section";
import { showErrorToast } from "@/components/ui/custom-toast";

const MFA = () => {
  const { showMfaEnrollmentModal } = useMfaEnrollment();

  const handleEnrollMFA = async () => {
    try {
      showMfaEnrollmentModal();
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to open MFA enrollment";
      showErrorToast(message);
    }
  };

  const availableActions = [
    {
      name: "Enroll in MFA",
      function: handleEnrollMFA,
    },
  ];

  return (
    <Section
      name="MFA enrollment"
      description={
        "Enroll in MFA to enhance security. Privy supports TOTP, SMS, and Passkey MFA methods. Once enrolled, you can use MFA to perform sensitive wallet actions."
      }
      filepath="src/components/sections/mfa"
      actions={availableActions}
    />
  );
};

export default MFA;
