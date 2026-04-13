import axios from 'axios';
import type {
  CollectionInvitationLookupResponseDto,
  CollectionLookupResponseDto,
  LinkResponseDto,
  PaginatedResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const collectionsApi = {
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
};

export const linksApi = {
  listPublic: async (params: {
    collectionId: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LinkResponseDto>> => {
    const response = await apiClient.get('/api/v1/links/public', { params });
    return response.data;
  },
};

export const api = {
  collections: collectionsApi,
  links: linksApi,
};
