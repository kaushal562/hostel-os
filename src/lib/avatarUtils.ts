/**
 * Avatar utility functions for generating initials and colors
 * Provides gender-neutral avatar handling with initials-based display
 */

/**
 * Generate initials from a full name
 * @param name - The full name of the user
 * @returns Two character initials (uppercase)
 * @example
 * getInitials("Kaushal Zinzuvadiya") // "KZ"
 * getInitials("John") // "JO"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || name.trim() === "") return "U";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return (parts[0][0] + parts[0][1]).substring(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color for an avatar based on the user's name/id
 * Uses a color palette of 8 professional colors
 * @param seed - Seed string (name or ID) to generate color
 * @returns Object with bg and text color classes
 */
export function getAvatarColor(seed: string | null | undefined): {
  bg: string;
  text: string;
  bgLight: string;
} {
  if (!seed) {
    return {
      bg: "bg-blue-600",
      text: "text-white",
      bgLight: "bg-blue-100",
    };
  }

  // Create a simple hash from the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const colorIndex = Math.abs(hash) % 8;

  const colors = [
    { bg: "bg-blue-600", text: "text-white", bgLight: "bg-blue-100" },
    { bg: "bg-purple-600", text: "text-white", bgLight: "bg-purple-100" },
    { bg: "bg-pink-600", text: "text-white", bgLight: "bg-pink-100" },
    { bg: "bg-green-600", text: "text-white", bgLight: "bg-green-100" },
    { bg: "bg-red-600", text: "text-white", bgLight: "bg-red-100" },
    { bg: "bg-amber-600", text: "text-white", bgLight: "bg-amber-100" },
    { bg: "bg-cyan-600", text: "text-white", bgLight: "bg-cyan-100" },
    { bg: "bg-indigo-600", text: "text-white", bgLight: "bg-indigo-100" },
  ];

  return colors[colorIndex];
}

/**
 * Check if a URL is valid and accessible
 * @param url - URL string to validate
 * @returns True if URL has a valid format
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url, window.location.origin);

    // Allow only browser-safe image URL protocols.
    // This prevents invalid custom schemes like "proxy-asset:" from being used as image src.
    const allowedProtocols = new Set(["http:", "https:", "data:", "blob:"]);
    return allowedProtocols.has(parsed.protocol);
  } catch {
    return false;
  }
}
