import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { getInitials, getAvatarColor, isValidImageUrl } from "@/lib/avatarUtils";

interface UserAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  seed?: string; // For consistent color generation (defaults to name or "user")
}

/**
 * Professional, gender-neutral avatar component
 * - Shows uploaded profile picture if available
 * - Falls back to initials in a colored circle
 * - Colors are consistent based on user name/ID
 *
 * @example
 * // With uploaded image
 * <UserAvatar name="Kaushal Zinzuvadiya" imageUrl="https://..." />
 *
 * // Fallback to initials
 * <UserAvatar name="Kaushal Zinzuvadiya" />
 *
 * // With custom size
 * <UserAvatar name="John Doe" className="h-32 w-32" />
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  name = "User",
  imageUrl = null,
  className = "h-10 w-10",
  seed = name || "user",
}) => {
  const initials = getInitials(name);
  const { bg, text } = getAvatarColor(seed);
  const hasValidImage = isValidImageUrl(imageUrl);

  return (
    <Avatar className={className}>
      {hasValidImage && <AvatarImage src={imageUrl!} alt={name || "User"} />}
      <AvatarFallback className={`${bg} ${text} font-semibold text-sm`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
