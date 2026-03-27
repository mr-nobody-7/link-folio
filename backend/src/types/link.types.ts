export interface CreateLinkRequest {
  title: string;
  url: string;
  enabled: boolean;
  isTemporary?: boolean;
  expiresAt?: string;
}

export interface LinkResponse {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  order: number;
  isTemporary?: boolean;
  expiresAt?: string;
  clicks: number;
}

export interface UpdateLinksRequest {
  links: LinkResponse[];
}
