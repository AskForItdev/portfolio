import React from 'react';

export default function LoadButton({
  onClick,
  text,
  loading,
}) {
  return (
    <div>
      <button
        onClick={onClick}
        className="hover:scale-105 transition-transform w-24"
      >
        {loading ? 'Loading...' : text}
      </button>
    </div>
  );
}
