// File types
export interface FileResponseDto {
  id: number;
  path: string;
  url: string;
  purpose?: 'image' | 'video' | 'favicon' | string;
  visibility: 'public' | 'private';
  status: 'pending' | 'analyzing' | 'analyzed' | 'error';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

// Link types
export interface LinkCollectionDto {
  id: number;
  userId: number;
  name: string;
  slug: string;
  description?: string;
  visibility: string;
  collectionLinkVisibility?: 'private' | 'public' | null;
  isFeatured: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkResponseDto {
  id: number;
  userId: number;
  url: string;
  shareUrl?: string;
  domain: string;
  title: string;
  description?: string;
  slug: string;
  visibility: 'private' | 'public';
  effectiveVisibility?: 'private' | 'public';
  ogTitle?: string;
  ogDescription?: string;
  ogSiteName?: string;
  ogType?: string;
  productName?: string;
  productPrice?: number;
  productPriceCurrency?: string;
  productCategory?: string;
  productBrand?: string;
  platformUserId?: string;
  platformUserName?: string;
  platformPostId?: string;
  platformPostCaption?: string;
  platformPostTitle?: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'error';
  createdAt: string;
  updatedAt: string;
  files: FileResponseDto[];
  user?: { id: number; username: string; firstName?: string; lastName?: string };
  collection?: LinkCollectionDto;
  collections: LinkCollectionDto[];
}

// Collection lookup types (enhanced for web)
export interface LookupFileDto {
  id: number;
  url: string;
  purpose?: string;
}

export interface LookupUserDto {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  image?: LookupFileDto;
}

export interface LookupMemberDto {
  id: number;
  username: string;
  image?: LookupFileDto;
}

export interface LookupLinkFileDto {
  id: number;
  url: string;
  purpose?: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface LookupPreviewLinkDto {
  id: number;
  url: string;
  domain: string;
  title: string;
  ogTitle?: string;
  productName?: string;
  platformPostTitle?: string;
  platformUserName?: string;
  productPrice?: number;
  productPriceCurrency?: string;
  files: LookupLinkFileDto[];
}

export interface LookupChildCollectionDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  totalLinks: number;
  previewLinks: LookupPreviewLinkDto[];
}

export interface CollectionLookupResponseDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  totalLinks: number;
  user: LookupUserDto;
  members: LookupMemberDto[];
  childCollections: LookupChildCollectionDto[];
}

// Collection invitation types
export interface InvitationInviterDto {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  image?: LookupFileDto | null;
}

export interface InvitationCollectionDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  username: string;
  itemCount: number;
  isPublic: boolean;
}

export interface CollectionInvitationLookupResponseDto {
  status: 'pending' | 'accepted';
  roleName: string;
  invitedEmail: string;
  inviter: InvitationInviterDto;
  collection: InvitationCollectionDto;
}

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
