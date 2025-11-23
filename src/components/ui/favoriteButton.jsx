import { useState, useEffect } from "react";

export function FavoriteButton({
                                 isFavorited: initialFavorited = false,
                                 onFavoriteChange,
                                 ariaLabel = "Add to wishlist",
                                 isPending = false,
                                 disabled = false
                               }) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  // Update internal state when prop changes, but only if not disabled
  useEffect(() => {
    if (!disabled) {
      setIsFavorited(initialFavorited);
    }
  }, [initialFavorited, disabled]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent clicks if disabled or pending
    if (disabled || isPending) {
      return;
    }
    
    const newValue = !isFavorited;
    setIsFavorited(newValue);
    if (onFavoriteChange) onFavoriteChange(newValue);
  };

  const isDisabled = disabled || isPending;
  
  // When disabled, always show as not favorited (white) regardless of state
  const displayFavorited = disabled ? false : isFavorited;

  return (
    <button
      aria-label={disabled ? "No puedes agregar tu propia publicación a favoritos" : ariaLabel}
      type="button"
      onClick={toggleFavorite}
      disabled={isDisabled}
      title={disabled ? "No puedes agregar tu propia publicación a favoritos" : undefined}
      className={`w-8 h-8 flex items-center justify-center rounded-full group transition ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill={displayFavorited ? "red" : "white"}
        stroke={displayFavorited ? "red" : "white"}
        strokeWidth={2}
        className={`w-6 h-6 transition ${
          !displayFavorited && !isDisabled ? "group-hover:opacity-80" : ""
        } ${isPending ? "animate-pulse" : ""}`}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" />
      </svg>
    </button>
  );
}
