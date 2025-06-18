'use client';
import { useNavigation } from './AuthWrapper';

export default function Button({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const { isNavigating } = useNavigation();
  const isDisabled = disabled || isNavigating;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative
        px-4 py-2
        rounded-md
        transition-all
        duration-200
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 active:opacity-60'}
        ${className}
      `}
      {...props}
    >
      {children}
      {isNavigating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
    </button>
  );
}
