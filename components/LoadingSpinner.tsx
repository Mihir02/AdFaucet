interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
