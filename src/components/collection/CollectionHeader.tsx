import { motion } from 'framer-motion';

import { Avatar } from '@/components/ui/Avatar';
import type { CollectionLookupResponseDto } from '@/types/api';

interface CollectionHeaderProps {
  collection: CollectionLookupResponseDto;
  titleRef?: (node: HTMLHeadingElement | null) => void;
}

export function CollectionHeader({ collection, titleRef }: CollectionHeaderProps) {
  const { user, members } = collection;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 pt-6 pb-4 md:pt-10 md:pb-6"
    >
      {/* Collection name */}
      <h1
        ref={titleRef}
        className="text-2xl md:text-4xl font-bold text-white leading-tight mb-2"
      >
        {collection.name}
      </h1>

      {/* Description */}
      {collection.description && (
        <p className="text-neutral-500 text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
          {collection.description}
        </p>
      )}

      {/* Owner & meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Owner avatar + username */}
        <div className="flex items-center gap-3">
          <Avatar user={user} size={28} className="ring-2 ring-neutral-700" />
          <div className="flex flex-col">
            {[user.firstName, user.lastName].filter(Boolean).join(' ').trim() && (
              <span className="text-white text-sm font-semibold leading-tight">
                {[user.firstName, user.lastName].filter(Boolean).join(' ')}
              </span>
            )}
            <span className="text-neutral-500 text-xs font-medium leading-tight">
              @{user.username}
            </span>
          </div>
        </div>

        {/* Member avatars */}
        {members.length > 1 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member) => (
                <Avatar
                  key={member.id}
                  user={member}
                  size={24}
                  className="ring-2 ring-background"
                />
              ))}
            </div>
            {members.length > 4 && (
              <span className="text-neutral-500 text-xs ml-1">
                +{members.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="mt-4 md:mt-6 border-b border-neutral-800" />
    </motion.div>
  );
}
