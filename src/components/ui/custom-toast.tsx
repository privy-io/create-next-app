import { toast } from "react-toastify";

interface CustomToastProps {
  message: string;
}

export const CustomToast: React.FC<CustomToastProps> = ({ message }) => {
  return (
    <div className="custom-toast">
      <div className="toast-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M16.6666 5L7.49996 14.1667L3.33329 10"
            stroke="#16A34A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => toast.dismiss()}>
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

export const showCustomToast = (message: string) => {
  toast(<CustomToast message={message} />, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    className: "custom-toast-container",
  });
};
