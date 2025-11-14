// Type declarations for hls.js
declare module 'hls.js' {
  export interface HlsConfig {
    enableWorker?: boolean;
    lowLatencyMode?: boolean;
    [key: string]: any;
  }

  export interface ErrorData {
    type: string;
    details: string;
    fatal: boolean;
    [key: string]: any;
  }

  export default class Hls {
    constructor(config?: HlsConfig);

    static isSupported(): boolean;
    static Events: {
      MANIFEST_PARSED: string;
      ERROR: string;
      [key: string]: string;
    };
    static ErrorTypes: {
      NETWORK_ERROR: string;
      MEDIA_ERROR: string;
      [key: string]: string;
    };

    loadSource(url: string): void;
    attachMedia(video: HTMLMediaElement): void;
    on(event: string, callback: (event: string, data: any) => void): void;
    startLoad(): void;
    recoverMediaError(): void;
    destroy(): void;
  }
}
