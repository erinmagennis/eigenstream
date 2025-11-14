# How to Customize for Your Use Case

This Mentra glasses streaming app is fully configurable! Edit `config.js` to customize for your specific use case.

## Quick Start

1. Open `config.js`
2. Edit the `APP_CONFIG` object
3. Deploy to Vercel
4. Update Server URL in Mentra console

## Configuration Options

### Branding

```javascript
appName: "Your App Name",        // Displayed on glasses
appIcon: "🎥",                   // Emoji icon
subtitle: "Your tagline",        // Subtitle text
```

### Streaming

```javascript
rtmpUrl: "rtmp://your-server.com:1935/live/stream",
streamQuality: "1080p",          // "720p", "1080p", or "4k"
streamFps: 30,                   // Frames per second (15-60)
enableAudio: true,               // Include audio in stream
```

### Backend Integration

```javascript
backendHost: "your-server.com:1935",              // Displayed to user
dashboardUrl: "https://your-dashboard.com",        // Public viewing page
```

### Theme Colors

```javascript
theme: {
    primaryColor: "#667eea",     // Main color
    secondaryColor: "#764ba2",   // Accent color
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
}
```

### Features

```javascript
features: {
    autoStart: false,            // Auto-start on launch
    autoStartDelay: 2000,        // Delay before auto-start (ms)
    showDashboardLink: true,     // Show dashboard URL
    retryOnError: true,          // Auto-retry on errors
    retryDelay: 5000,           // Retry delay (ms)
}
```

## Example Use Cases

### 1. Security Monitoring

```javascript
const APP_CONFIG = {
    appName: "SecureWatch",
    appIcon: "🔒",
    subtitle: "Live Security Monitoring",
    rtmpUrl: "rtmp://security.company.com:1935/live/cam1",
    theme: {
        primaryColor: "#dc2626",
        secondaryColor: "#991b1b",
        gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    },
    features: {
        autoStart: true,          // Start immediately
        showDashboardLink: false  // Hide for security
    }
};
```

### 2. Live Event Streaming

```javascript
const APP_CONFIG = {
    appName: "LiveView Pro",
    appIcon: "🎬",
    subtitle: "Professional Event Streaming",
    rtmpUrl: "rtmp://stream.events.com:1935/live/event",
    streamQuality: "4k",
    streamFps: 60,
    theme: {
        primaryColor: "#3b82f6",
        secondaryColor: "#1d4ed8",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    }
};
```

### 3. Sports/Action Camera

```javascript
const APP_CONFIG = {
    appName: "ActionCam",
    appIcon: "⚡",
    subtitle: "POV Sports Recording",
    rtmpUrl: "rtmp://sports.server.com:1935/live/athlete1",
    streamFps: 60,                // High FPS for fast action
    theme: {
        primaryColor: "#f59e0b",
        secondaryColor: "#dc2626",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)",
    }
};
```

### 4. Customer Support

```javascript
const APP_CONFIG = {
    appName: "SupportView",
    appIcon: "👁️",
    subtitle: "Visual Customer Support",
    rtmpUrl: "rtmp://support.company.com:1935/live/session",
    streamQuality: "720p",        // Lower bandwidth
    theme: {
        primaryColor: "#10b981",
        secondaryColor: "#059669",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    features: {
        autoStart: false,         // Manual start
        showDashboardLink: true   // Agent can view
    }
};
```

### 5. Industrial/Remote Inspection

```javascript
const APP_CONFIG = {
    appName: "InspectView",
    appIcon: "🔍",
    subtitle: "Remote Site Inspection",
    rtmpUrl: "rtmp://inspection.company.com:1935/live/site",
    streamQuality: "1080p",
    theme: {
        primaryColor: "#6366f1",
        secondaryColor: "#4f46e5",
        gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    },
    features: {
        retryOnError: true,       // Critical for remote sites
        retryDelay: 3000
    }
};
```

## Testing Your Configuration

1. **Local Testing:**
   ```bash
   cd glasses-app
   python3 -m http.server 3001
   ```
   Open http://localhost:3001 to see UI changes (camera won't work on desktop)

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Test on Glasses:**
   - Update Server URL in Mentra console
   - Install/refresh app on glasses
   - Launch and verify branding/theme
   - Tap "Start Stream" to test streaming

## Backend Setup

Your backend server must accept RTMP streams on the configured URL. For example, using nginx-rtmp:

```nginx
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            record off;
        }
    }
}
```

See the `tee-backend` directory for a complete backend example with analytics and attestations.

## Tips

- **Colors**: Use hex codes for theme colors
- **Quality vs Bandwidth**: 4K requires ~15 Mbps, 1080p ~5 Mbps, 720p ~2 Mbps
- **FPS**: Higher FPS uses more bandwidth and battery
- **Auto-start**: Useful for monitoring, but give users control for most apps
- **Testing**: Always test on actual glasses before demo/production

## Support

For issues or questions:
- Check Mentra docs: https://docs.mentraglass.com
- Review example configs above
- Test locally before deploying
