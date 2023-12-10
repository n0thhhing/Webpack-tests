export type WebhookUrl = string
export type BotToken = string


export interface WebhookInfoResponse {
  id: string;
  guild_id: string;
  channel_id: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
  };
  name: string;
  avatar: string | null;
  token: string;
}

export interface DiscordApiResponse {
  status: number;
  statusText: string;
}

export interface EmbedObject {
  title?: string;
  type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link';
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
  };
  image?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  thumbnail?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  video?: {
    url: string;
    height?: number;
    width?: number;
  };
  provider?: {
    name: string;
    url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}
