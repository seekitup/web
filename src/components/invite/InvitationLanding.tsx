import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { AppStoreBadges } from '@/components/download/AppStoreBadges';
import type { CollectionInvitationLookupResponseDto } from '@/types/api';

interface InvitationLandingProps {
  invitation: CollectionInvitationLookupResponseDto;
}

export function InvitationLanding({ invitation }: InvitationLandingProps) {
  const { t } = useTranslation();
  const { inviter, collection, status } = invitation;

  const inviterDisplayName = inviter.firstName
    ? `${inviter.firstName}${inviter.lastName ? ` ${inviter.lastName}` : ''}`
    : inviter.username;

  const avatarUser = {
    id: inviter.id,
    username: inviter.username,
    firstName: inviter.firstName ?? undefined,
    lastName: inviter.lastName ?? undefined,
    image: inviter.image ?? null,
  };

  const isAccepted = status === 'accepted';

  return (
    <div className="mx-auto max-w-xl w-full px-5 py-10 flex flex-col items-center text-center">
      <Avatar user={avatarUser} size={96} className="mb-5" />

      <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
        @{inviter.username}
      </p>

      <h1 className="text-2xl font-bold text-white mb-1.5">
        {isAccepted
          ? t('invitationPage.alreadyAcceptedTitle')
          : t('invitationPage.title', { name: inviterDisplayName })}
      </h1>

      <p className="text-sm text-white/60 mb-8">
        {isAccepted
          ? t('invitationPage.alreadyAcceptedDescription')
          : t('invitationPage.subtitle')}
      </p>

      <div
        className="w-full rounded-2xl p-5 mb-8 text-left border border-primary/20"
        style={{
          background:
            'linear-gradient(135deg, rgba(0, 255, 153, 0.08) 0%, rgba(0, 255, 153, 0.03) 100%)',
        }}
      >
        <p className="text-[11px] uppercase tracking-wider text-primary/80 mb-2">
          {t('invitationPage.collectionLabel')}
        </p>
        <h2 className="text-xl font-bold text-white mb-2">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="text-sm text-white/70 mb-3 leading-relaxed">
            {collection.description}
          </p>
        )}
        <span className="inline-block bg-primary/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {t('invitationPage.itemCount', { count: collection.itemCount })}
        </span>
      </div>

      {!isAccepted && (
        <p className="text-sm text-white/60 mb-6 max-w-sm">
          {t('invitationPage.description')}
        </p>
      )}

      <AppStoreBadges />

      {collection.isPublic && (
        <Link
          to={`/${collection.username}/${collection.slug}`}
          className="mt-6 text-sm text-primary hover:text-primary-light underline underline-offset-4 transition-colors"
        >
          {t('invitationPage.viewCollection')}
        </Link>
      )}
    </div>
  );
}
