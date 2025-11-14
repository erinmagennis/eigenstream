// Configuration for Mentra Glasses Streaming App
// Edit these values to customize for your use case

const APP_CONFIG = {
    // App Branding
    appName: "EigenStream",
    appIcon: "📹",
    subtitle: "Verifiable POV Analytics",

    // Streaming Configuration
    rtmpUrl: "rtmp://cf7c6397c7fe.ngrok-free.app:1935/live/eigenstream",
    streamQuality: "1080p",      // Options: "720p", "1080p", "4k"
    streamFps: 30,               // Frames per second
    enableAudio: true,           // Include audio in stream

    // Backend Configuration
    backendHost: "cf7c6397c7fe.ngrok-free.app:1935",
    dashboardUrl: "https://eigenstream-omgfv49il-sunflower-studio.vercel.app",

    // UI Theme
    theme: {
        primaryColor: "#667eea",
        secondaryColor: "#764ba2",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },

    // Features
    features: {
        autoStart: false,          // Auto-start streaming on app launch
        autoStartDelay: 2000,      // Delay before auto-start (ms)
        showDashboardLink: true,   // Show link to public dashboard
        retryOnError: true,        // Auto-retry on stream errors
        retryDelay: 5000,         // Delay before retry (ms)
    }
};

// Example configs for different use cases:

// Security Monitoring
// const APP_CONFIG = {
//     appName: "SecureWatch",
//     appIcon: "🔒",
//     subtitle: "Live Security Monitoring",
//     rtmpUrl: "rtmp://your-server.com:1935/live/security",
//     features: { autoStart: true }
// };

// Live Event Streaming
// const APP_CONFIG = {
//     appName: "LiveView",
//     appIcon: "🎬",
//     subtitle: "Professional Event Streaming",
//     rtmpUrl: "rtmp://your-server.com:1935/live/event",
//     streamQuality: "4k",
//     streamFps: 60
// };

// Sports/Activity Recording
// const APP_CONFIG = {
//     appName: "ActionCam",
//     appIcon: "⚡",
//     subtitle: "POV Sports Recording",
//     rtmpUrl: "rtmp://your-server.com:1935/live/sports",
//     theme: {
//         primaryColor: "#f59e0b",
//         secondaryColor: "#dc2626",
//         gradient: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)"
//     }
// };
