/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_USER_ID: string;
  readonly VITE_ADMIN_DISCORD_ID?: string;
  readonly VITE_SOCIAL_INSTAGRAM?: string;
  readonly VITE_SOCIAL_YOUTUBE?: string;
  readonly VITE_SOCIAL_TIKTOK?: string;
  readonly VITE_SOCIAL_DISCORD?: string;
  readonly VITE_SOCIAL_TELEGRAM?: string;
  readonly VITE_SOCIAL_FACEBOOK?: string;
  readonly VITE_GITHUB_USERNAME?: string;
  readonly VITE_GITHUB_FEATURED_REPO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

