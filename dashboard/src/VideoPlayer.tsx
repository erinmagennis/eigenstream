import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  apiUrl: string;
}

export function VideoPlayer({ apiUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<any>(null);

  const streamUrl = `${apiUrl}/stream/playlist.m3u8`;

  useEffect(() => {
    // Check stream status
    const checkStatus = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/stream/status`);
        const status = await res.json();
        setStreamStatus(status);

        if (!status.active || !status.hasPlaylist) {
          setError('Stream not available');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to check stream status:', err);
      }
    };

    checkStatus();
    const statusInterval = setInterval(checkStatus, 5000);

    return () => clearInterval(statusInterval);
  }, [apiUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamStatus?.hasPlaylist) return;

    // Check if HLS is supported natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      setIsLoading(false);
      setError(null);
    }
    // Check if HLS.js is supported (Chrome, Firefox, etc.)
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setError(null);
        video.play().catch(e => console.log('Auto-play prevented:', e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - retrying...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - recovering...');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error - cannot play stream');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    } else {
      setError('HLS not supported in this browser');
      setIsLoading(false);
    }
  }, [streamUrl, streamStatus]);

  if (error && !streamStatus?.active) {
    return (
      <div className="video-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">📹</div>
          <div className="placeholder-text">Waiting for stream...</div>
          <div className="placeholder-hint">Stream will appear when glasses connect</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-placeholder error">
        <div className="placeholder-content">
          <div className="placeholder-icon">⚠️</div>
          <div className="placeholder-text">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-container">
      {isLoading && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
          <div>Loading stream...</div>
        </div>
      )}
      <video
        ref={videoRef}
        className="video-player"
        controls
        muted
        autoPlay
        playsInline
      />
    </div>
  );
}
