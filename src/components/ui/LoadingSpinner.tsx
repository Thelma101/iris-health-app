export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center" data-node-id="1:1240">
      <svg
        className="w-32 h-32 text-[#2c7be5] animate-spin"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset="0"
          strokeLinecap="round"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
      </svg>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
