// File types
export interface FileResponseDto {
  id: number;
  path: string;
  url: string;
  purpose?: "image" | "video" | "favicon" | string;
  visibility: "public" | "private";
  status: "pending" | "analyzing" | "analyzed" | "error";
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
  collectionLinkVisibility?: "private" | "public" | null;
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
  visibility: "private" | "public";
  effectiveVisibility?: "private" | "public";
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
  status: "pending" | "analyzing" | "analyzed" | "error";
  createdAt: string;
  updatedAt: string;
  files: FileResponseDto[];
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
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
  status: "pending" | "accepted";
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

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface UserResponseDto {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  phoneNumberCountryCode?: string;
  phoneNumber?: string;
  profileType: string;
  languageCode: string;
  countryIsoCode?: string;
  timezone?: string;
  emailVerifiedAt?: string | null;
  phoneNumberVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  image?: FileResponseDto | null;
}

export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponseDto;
}

export interface RegisterDto {
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  password: string;
  languageCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RequestOtpDto {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
}

export interface OtpResponseDto {
  success: boolean;
  expiresInMinutes: number;
  message: string;
}

export interface CheckUserResponseDto {
  firstName?: string;
  lastName?: string;
  email: string;
  image?: LookupFileDto;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

export interface SuccessResponseDto {
  success: boolean;
  message: string;
}

export interface RevokeOthersResponseDto {
  success: boolean;
  message: string;
  revokedCount: number;
}

export interface UsernameAvailabilityResponseDto {
  available: boolean;
  username: string;
}

export type FileOwnerType = "users" | "links" | "collections" | "files";
export type FilePurpose =
  | "image"
  | "profile_picture"
  | "thumbnail"
  | "favicon"
  | "og_image"
  | "document"
  | "video";

export interface GenerateUploadUrlSimpleDto {
  originalName: string;
}

export interface GenerateUploadUrlResponseDto {
  uploadUrl: string;
  file: FileResponseDto;
  instructions: string;
}

export interface UpdateUserDto {
  firstName?: string | undefined;
  lastName?: string | undefined;
  username?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
  phoneNumberCountryCode?: string | undefined;
  phoneNumber?: string | undefined;
  profileType?: string | undefined;
  languageCode?: string | undefined;
  countryIsoCode?: string | undefined;
  timezone?: string | undefined;
}

// ============================================================
// SESSION TYPES
// ============================================================

export type DeviceType = "desktop" | "mobile" | "tablet" | "other";

export interface SessionResponseDto {
  id: number;
  userId: number;
  ipAddress: string;
  countryIsoCode?: string;
  city?: string;
  region?: string;
  timezone?: string;
  userAgent: string;
  deviceType?: DeviceType;
  deviceName?: string;
  browserName?: string;
  browserVersion?: string;
  platform?: string;
  platformVersion?: string;
  isMobile: boolean;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrent?: boolean;
}

export interface SessionsQueryParams extends PaginationParams {
  active?: boolean;
}

// ============================================================
// COLLECTIONS (authenticated)
// ============================================================

export interface CollectionRoleUserDto {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  image?: FileResponseDto;
  roleName: "owner" | "editor" | "member";
}

export interface CollectionResponseDto {
  id: number;
  userId: number;
  parentCollectionIds: number[];
  name: string;
  slug: string;
  description?: string;
  visibility: string;
  isFeatured: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  user: UserResponseDto;
  userRole?: CollectionRoleUserDto;
  members: CollectionRoleUserDto[];
  links: LinkResponseDto[];
  totalLinks: number;
  childCollections: unknown[];
  savedAt?: string;
}

export interface CollectionsQueryParams extends PaginationParams {
  filter?: "all" | "my" | "invited" | "pending";
  collectionId?: number | null | "null";
  name?: string;
  sortBy?: "createdAt" | "lastViewedAt";
}

// ============================================================
// CREATE / UPDATE PAYLOADS
// ============================================================

export interface CreateLinkDto {
  url: string;
  title?: string;
  description?: string;
  slug?: string;
  visibility?: "public" | "private";
  collectionIds?: number[];
  ogTitle?: string;
  ogDescription?: string;
  ogSiteName?: string;
  ogType?: string;
}

export type UpdateLinkDto = Partial<Omit<CreateLinkDto, "url">>;

export interface CreateCollectionDto {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  parentCollectionIds?: number[];
  isFeatured?: boolean;
  isPinned?: boolean;
}

export type UpdateCollectionDto = Partial<CreateCollectionDto> & {
  removeCollaborators?: boolean;
};

export interface InviteMemberDto {
  email: string;
  roleName: "editor" | "viewer";
}

export interface UpdateMemberRoleDto {
  roleName: "owner" | "editor";
}

export interface UpdateCollectionLinkVisibilityDto {
  visibility: "private" | "public" | null;
}

export interface DuplicateCollectionDto {
  name?: string;
  parentCollectionIds?: number[];
}

export interface DuplicateLinkDto {
  title?: string;
  collectionIds?: number[];
}

export interface CollectionMemberResponseDto {
  id: number;
  collectionId: number;
  userId: number;
  roleId: number;
  acceptedAt?: string | null;
  invitedEmail?: string;
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    image?: FileResponseDto | null;
  };
  role: { id: number; name: "owner" | "editor" | "viewer" };
}

export interface LinksQueryParams extends PaginationParams {
  filter?: "all" | "my" | "shared";
  collectionId?: number;
  visibility?: "public" | "private";
  sortBy?: "createdAt" | "lastViewedAt";
}

// ============================================================
// METADATA / SCRAPER
// ============================================================

export interface MetadataImageDto {
  url: string;
  width?: number;
  height?: number;
  type?: string;
  alt?: string;
}

export interface MetadataVideoDto {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface MetadataResponseDto {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogSiteName?: string;
  ogType?: string;
  ogLocale?: string;
  ogUrl?: string;
  ogImages?: MetadataImageDto[];
  favicon?: string;
  ogVideos?: MetadataVideoDto[];
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string[];
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  platform?: string;
  error?: string;
  extractedAt: string;
}

// ============================================================
// SEARCH
// ============================================================

export type SearchContext = "links" | "collections";

export interface SearchQueryParams {
  q: string;
  context?: SearchContext | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface SearchResultsMeta {
  total: number;
  totalLinks: number;
  totalCollections: number;
  page: number;
  limit: number;
}

export interface SearchResponse {
  data: {
    links: LinkResponseDto[];
    collections: CollectionResponseDto[];
  };
  meta: SearchResultsMeta;
}
