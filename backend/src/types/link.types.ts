export interface CreateLinkRequest {
  title: string;
  url: string;
  enabled: boolean;
  isTemporary?: boolean;
}

export interface LinkResponse {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  order: number;
  isTemporary?: boolean;
  clicks: number;
}

export interface UpdateLinksRequest {
  links: LinkResponse[];
}
