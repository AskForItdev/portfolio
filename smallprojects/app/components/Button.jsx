'use client';
import { useUserContext } from '@/app/context/userContext';

export default function Button({
  children,
  onClick,
  className = '',

  type = 'button',
  ...props
}) {
  const { isLoading } = useUserContext();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`
        button
        relative
        px-4 py-2
        rounded-md
        transition-all
        duration-200
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 active:opacity-60'}
        ${className}
      `}
      {...props}
    >
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
    </button>
  );
}
