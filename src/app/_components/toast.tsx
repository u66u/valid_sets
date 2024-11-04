import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-4 top-4 rounded-lg p-4 text-white shadow-lg ${type === "success" ? "bg-green-500" : "bg-red-500"} transform animate-slide-in transition-transform duration-300 ease-in-out`}
    >
      {message}
    </div>
  );
}
