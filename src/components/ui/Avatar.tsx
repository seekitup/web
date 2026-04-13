import { useState } from 'react';

const AVATAR_COLORS = [
  '#E53935',
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
  '#43A047',
  '#7CB342',
  '#C0CA33',
  '#FDD835',
  '#FFB300',
  '#FB8C00',
  '#F4511E',
  '#6D4C41',
  '#757575',
  '#546E7A',
  '#26A69A',
] as const;

const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export interface AvatarUser {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  image?: { id: number; url: string } | null;
}

interface AvatarProps {
  user: AvatarUser;
  size?: number;
  className?: string;
}

export function Avatar({ user, size = 28, className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [lastImageKey, setLastImageKey] = useState<string | undefined>(
    user.image ? `${user.image.id}-${user.image.url}` : undefined,
  );
  const currentImageKey = user.image ? `${user.image.id}-${user.image.url}` : undefined;
  if (lastImageKey !== currentImageKey) {
    setLastImageKey(currentImageKey);
    setImageError(false);
  }

  const getInitials = (): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const getNameForColor = (): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.username;
  };

  const initials = getInitials();
  const backgroundColor = getColorFromName(getNameForColor());
  const showImage = !!user.image?.url && !imageError;

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor }}
      aria-label={`Avatar for ${user.username}`}
      role="img"
    >
      <span
        className="text-white font-semibold leading-none select-none"
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </span>
      {showImage && (
        <img
          key={`avatar-${user.image?.id}`}
          src={user.image!.url}
          alt={user.username}
          loading="lazy"
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
