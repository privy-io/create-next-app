import { toast } from "react-toastify";

type ToastVariant = "success" | "error";

interface CustomToastProps {
  message: string;
  variant?: ToastVariant;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  message,
  variant = "success",
}) => {
  const isError = variant === "error";

  const containerClasses = [
    "flex",
    "items-center",
    "gap-2",
    "min-w-0",
    "pl-4",
    "pr-3",
    "py-4",
    "w-[455px]",
    "h-[55px]",
    "rounded-lg",
    "border",
    isError ? "bg-[#FEE2E2] border-[#F69393]" : "bg-[#DCFCE7] border-[#87D7B7]",
  ].join(" ");

  const textClasses = [
    "text-sm",
    isError ? "font-medium leading-[22px]" : "font-normal leading-5",
    "text-[#040217]",
    "flex-1",
    "whitespace-nowrap",
  ].join(" ");

  return (
    <div
      className={containerClasses}
      style={{
        boxShadow:
          "0px 4px 10px -2px rgba(16, 24, 40, 0.08), 0px 10px 20px -3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="shrink-0" aria-hidden>
        {isError ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4"
              stroke="#DC2626"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M12 16.5h.01"
              stroke="#DC2626"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M12 3.5l9 16H3l9-16Z"
              stroke="#DC2626"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M16.6666 5L7.49996 14.1667L3.33329 10"
              stroke="#16A34A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className={textClasses}>{message}</div>
      <button
        aria-label="Close"
        className="flex h-[23px] w-9 items-center justify-center rounded-lg shrink-0"
        onClick={() => toast.dismiss()}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="#110F2A"
            strokeWidth="1.33"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export const showSuccessToast = (message: string) => {
  toast(<CustomToast message={message} variant="success" />, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    // Remove default toast wrapper look to avoid "toast inside toast"
    closeButton: false,
    icon: false,
    className: "bg-transparent shadow-none p-0 m-0",
    style: { background: "transparent", boxShadow: "none" },
  });
};

export const showErrorToast = (message: string) => {
  toast(<CustomToast message={message} variant="error" />, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    // Remove default toast wrapper look to avoid "toast inside toast"
    closeButton: false,
    icon: false,
    className: "bg-transparent shadow-none p-0 m-0",
    style: { background: "transparent", boxShadow: "none", marginTop: 16 },
  });
};

// Backwards compatible default
export const showCustomToast = (message: string) => showSuccessToast(message);
