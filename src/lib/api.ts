import axios, { AxiosError } from "axios";
import { authStorage } from "@/lib/authStorage";
import i18n from "@/i18n";
import type {
  AuthResponseDto,
  ChangePasswordDto,
  CheckUserResponseDto,
  CollectionInvitationLookupResponseDto,
  CollectionLookupResponseDto,
  CollectionMemberResponseDto,
  CollectionResponseDto,
  CollectionsQueryParams,
  CreateCollectionDto,
  CreateLinkDto,
  DuplicateCollectionDto,
  DuplicateLinkDto,
  FileOwnerType,
  FilePurpose,
  GenerateUploadUrlResponseDto,
  GenerateUploadUrlSimpleDto,
  InviteMemberDto,
  LinkResponseDto,
  LinksQueryParams,
  LoginDto,
  MetadataResponseDto,
  OtpResponseDto,
  PaginatedResponse,
  RegisterDto,
  RequestOtpDto,
  RevokeOthersResponseDto,
  SearchQueryParams,
  SearchResponse,
  SessionResponseDto,
  SessionsQueryParams,
  SuccessResponseDto,
  UpdateCollectionDto,
  UpdateCollectionLinkVisibilityDto,
  UpdateLinkDto,
  UpdateMemberRoleDto,
  UpdateUserDto,
  UserResponseDto,
  UsernameAvailabilityResponseDto,
  VerifyOtpDto,
} from "@/types/api";

export const API_BASE_URL =
  import.meta.env["VITE_API_URL"] || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["x-lang"] = i18n.language?.split("-")[0] ?? "es";
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Storage-only clear; navigation is owned by the auth hook (matches mobile).
      authStorage.clearAuth();
    }
    return Promise.reject(error);
  },
);

// ------------------------------------------------------------------
// AUTH
// ------------------------------------------------------------------
export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponseDto> => {
    const response = await apiClient.post("/api/v1/auth/register", data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponseDto> => {
    const response = await apiClient.post("/api/v1/auth/login", data);
    return response.data;
  },

  requestOtp: async (data: RequestOtpDto): Promise<OtpResponseDto> => {
    const response = await apiClient.post("/api/v1/auth/request-code", data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpDto): Promise<AuthResponseDto> => {
    const response = await apiClient.post("/api/v1/auth/verify-code", data);
    return response.data;
  },

  sendVerificationEmail: async (): Promise<SuccessResponseDto> => {
    const response = await apiClient.post(
      "/api/v1/auth/send-verification-email",
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/v1/auth/logout");
  },

  getCurrentUser: async (): Promise<UserResponseDto> => {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
  },

  checkUser: async (email: string): Promise<CheckUserResponseDto | null> => {
    try {
      const response = await apiClient.get("/api/v1/auth/check-user", {
        params: { email },
      });
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  changePassword: async (
    data: ChangePasswordDto,
  ): Promise<SuccessResponseDto> => {
    const response = await apiClient.post(
      "/api/v1/auth/change-password",
      data,
    );
    return response.data;
  },

  deleteAccount: async (): Promise<SuccessResponseDto> => {
    const response = await apiClient.delete("/api/v1/auth/account");
    return response.data;
  },

  /**
   * Build the OAuth entry URL. The user is redirected here; the API redirects
   * to Google, then Google redirects back to the API callback, which finally
   * redirects to `redirectUri?token=<jwt>`.
   */
  googleLoginUrl: (redirectUri: string): string => {
    const u = new URL("/api/v1/auth/google", API_BASE_URL);
    u.searchParams.set("redirect_uri", redirectUri);
    return u.toString();
  },
};

// ------------------------------------------------------------------
// USERS
// ------------------------------------------------------------------
export const usersApi = {
  checkUsername: async (
    username: string,
  ): Promise<UsernameAvailabilityResponseDto> => {
    const response = await apiClient.get("/api/v1/users/check-username", {
      params: { username },
    });
    return response.data;
  },

  update: async (id: number, data: UpdateUserDto): Promise<UserResponseDto> => {
    const response = await apiClient.patch(`/api/v1/users/${id}`, data);
    return response.data;
  },
};

// ------------------------------------------------------------------
// SESSIONS
// ------------------------------------------------------------------
export const sessionsApi = {
  list: async (
    params?: SessionsQueryParams,
  ): Promise<PaginatedResponse<SessionResponseDto>> => {
    const response = await apiClient.get("/api/v1/sessions", { params });
    return response.data;
  },

  revoke: async (id: number): Promise<SuccessResponseDto> => {
    const response = await apiClient.delete(`/api/v1/sessions/${id}`);
    return response.data;
  },

  revokeAllOthers: async (): Promise<RevokeOthersResponseDto> => {
    const response = await apiClient.post("/api/v1/sessions/revoke-others");
    return response.data;
  },
};

// ------------------------------------------------------------------
// FILES
// ------------------------------------------------------------------
export const filesApi = {
  generateUploadUrl: async (
    ownerType: FileOwnerType,
    ownerId: number,
    purpose: FilePurpose,
    data: GenerateUploadUrlSimpleDto,
  ): Promise<GenerateUploadUrlResponseDto> => {
    const response = await apiClient.post(
      `/api/v1/files/${ownerType}/${ownerId}/${purpose}`,
      data,
    );
    return response.data;
  },

  /** Upload a Blob/File directly to the presigned S3 URL (web). */
  uploadToPresignedUrl: async (
    uploadUrl: string,
    blob: Blob,
    mimeType: string,
  ): Promise<void> => {
    await axios.put(uploadUrl, blob, {
      headers: { "Content-Type": mimeType },
    });
  },

  notifyUploadComplete: async (
    fileId: number,
  ): Promise<{ message: string; fileId: number }> => {
    const response = await apiClient.post(
      `/api/v1/files/${fileId}/upload-complete`,
    );
    return response.data;
  },
};

// ------------------------------------------------------------------
// COLLECTIONS
// ------------------------------------------------------------------
export const collectionsApi = {
  list: async (
    params?: CollectionsQueryParams,
  ): Promise<PaginatedResponse<CollectionResponseDto>> => {
    const response = await apiClient.get("/api/v1/collections", { params });
    return response.data;
  },
  lookupBySlug: async (
    username: string,
    slug: string,
  ): Promise<CollectionLookupResponseDto> => {
    const response = await apiClient.get(
      `/api/v1/collections/lookup/${username}/${slug}`,
    );
    return response.data;
  },
  lookupInvitation: async (
    token: string,
  ): Promise<CollectionInvitationLookupResponseDto> => {
    const response = await apiClient.get(
      `/api/v1/collections/invitations/${encodeURIComponent(token)}`,
    );
    return response.data;
  },
  create: async (data: CreateCollectionDto): Promise<CollectionResponseDto> => {
    const response = await apiClient.post("/api/v1/collections", data);
    return response.data;
  },
  update: async (
    id: number,
    data: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> => {
    const response = await apiClient.patch(`/api/v1/collections/${id}`, data);
    return response.data;
  },
  addParent: async (
    id: number,
    parentCollectionId: number,
  ): Promise<void> => {
    await apiClient.post(`/api/v1/collections/${id}/parents`, {
      parentCollectionId,
    });
  },
  inviteMember: async (
    id: number,
    data: InviteMemberDto,
  ): Promise<CollectionMemberResponseDto> => {
    const response = await apiClient.post(
      `/api/v1/collections/${id}/members`,
      data,
    );
    return response.data;
  },
  listMembers: async (
    id: number,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<CollectionMemberResponseDto>> => {
    const response = await apiClient.get(`/api/v1/collections/${id}/members`, {
      params,
    });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/collections/${id}`);
  },
  duplicate: async (
    id: number,
    data?: DuplicateCollectionDto,
  ): Promise<CollectionResponseDto> => {
    const response = await apiClient.post(
      `/api/v1/collections/${id}/duplicate`,
      data ?? {},
    );
    return response.data;
  },
  removeMember: async (id: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/collections/${id}/members/${memberId}`);
  },
  acceptInvitation: async (
    id: number,
  ): Promise<CollectionMemberResponseDto> => {
    const response = await apiClient.post(
      `/api/v1/collections/${id}/members/accept`,
    );
    return response.data;
  },
  saveCollection: async (id: number): Promise<void> => {
    await apiClient.post(`/api/v1/collections/${id}/save`);
  },
  unsaveCollection: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/collections/${id}/save`);
  },
  isCollectionSaved: async (id: number): Promise<{ saved: boolean }> => {
    const response = await apiClient.get(`/api/v1/collections/${id}/saved`);
    return response.data;
  },
  updateMemberRole: async (
    id: number,
    memberId: number,
    data: UpdateMemberRoleDto,
  ): Promise<CollectionMemberResponseDto> => {
    const response = await apiClient.patch(
      `/api/v1/collections/${id}/members/${memberId}`,
      data,
    );
    return response.data;
  },
  removeParent: async (id: number, parentId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/collections/${id}/parents/${parentId}`);
  },
  updateLinkVisibility: async (
    collectionId: number,
    linkId: number,
    data: UpdateCollectionLinkVisibilityDto,
  ): Promise<void> => {
    await apiClient.patch(
      `/api/v1/collections/${collectionId}/links/${linkId}/visibility`,
      data,
    );
  },
  updateChildVisibility: async (
    parentCollectionId: number,
    childCollectionId: number,
    data: UpdateCollectionLinkVisibilityDto,
  ): Promise<void> => {
    await apiClient.patch(
      `/api/v1/collections/${parentCollectionId}/children/${childCollectionId}/visibility`,
      data,
    );
  },
  removeLinkFromCollection: async (
    collectionId: number,
    linkId: number,
  ): Promise<void> => {
    await apiClient.delete(
      `/api/v1/collections/${collectionId}/links/${linkId}`,
    );
  },
};

// ------------------------------------------------------------------
// LINKS
// ------------------------------------------------------------------
export const linksApi = {
  listPublic: async (params: {
    collectionId: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LinkResponseDto>> => {
    const response = await apiClient.get("/api/v1/links/public", { params });
    return response.data;
  },

  list: async (
    params?: LinksQueryParams,
  ): Promise<PaginatedResponse<LinkResponseDto>> => {
    const response = await apiClient.get("/api/v1/links", { params });
    return response.data;
  },

  getById: async (id: number): Promise<LinkResponseDto> => {
    const response = await apiClient.get(`/api/v1/links/${id}`);
    return response.data;
  },

  create: async (data: CreateLinkDto): Promise<LinkResponseDto> => {
    const response = await apiClient.post("/api/v1/links", data);
    return response.data;
  },

  update: async (id: number, data: UpdateLinkDto): Promise<LinkResponseDto> => {
    const response = await apiClient.patch(`/api/v1/links/${id}`, data);
    return response.data;
  },

  extractMetadata: async (url: string): Promise<MetadataResponseDto> => {
    const response = await apiClient.get("/api/v1/links/metadata/extract", {
      params: { url },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/links/${id}`);
  },

  duplicate: async (
    id: number,
    data?: DuplicateLinkDto,
  ): Promise<LinkResponseDto> => {
    const response = await apiClient.post(
      `/api/v1/links/${id}/duplicate`,
      data ?? {},
    );
    return response.data;
  },
};

// ------------------------------------------------------------------
// SEARCH
// ------------------------------------------------------------------
export const searchApi = {
  search: async (params: SearchQueryParams): Promise<SearchResponse> => {
    const response = await apiClient.get("/api/v1/search", { params });
    return response.data;
  },
};

export const api = {
  auth: authApi,
  users: usersApi,
  sessions: sessionsApi,
  files: filesApi,
  collections: collectionsApi,
  links: linksApi,
  search: searchApi,
};

export default api;
