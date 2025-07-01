export default function LoadButton({
  onClick,
  text,
  loading,
  loadingText,
}) {
  return (
    <div>
      <button
        onClick={onClick}
        data-loading={loading}
        className="hover:scale-105 transition-transform w-auto button"
      >
        {loading ? loadingText : text}
      </button>
    </div>
  );
}
