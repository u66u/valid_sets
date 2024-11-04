import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white 
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
      transform transition-transform duration-300 ease-in-out animate-slide-in`}
        >
            {message}
        </div>
    );
}