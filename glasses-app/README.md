# Generic Mentra Glasses Streaming App

**Fully configurable** web application that runs on Mentra smart glasses to stream POV video to your backend.

Easily customize for any use case: security monitoring, live events, sports recording, customer support, industrial inspections, and more!

## Features

- Uses Mentra Camera SDK to access glasses camera
- Streams 1080p @ 30fps video + audio via RTMP
- Simple UI with start/stop controls
- Status indicators for connection state
- Auto-reconnect on errors

## Quick Customization

All configuration is in `config.js` - edit to customize for your use case:

```javascript
const APP_CONFIG = {
    appName: "Your App Name",
    appIcon: "🎥",
    rtmpUrl: "rtmp://your-server.com:1935/live/stream",
    // ... see CUSTOMIZE.md for full options
};
```

**See [CUSTOMIZE.md](./CUSTOMIZE.md) for detailed examples and options.**

## Deployment

This app is deployed to Vercel and accessed via the Server URL configured in the Mentra console.

### Deploy to Vercel:

```bash
cd glasses-app
vercel --prod
```

### Update Mentra Console:

1. Go to https://console.mentraglass.com
2. Open "EigenStream Demo Day" app
3. Update Server URL to your Vercel deployment URL
4. Install/refresh app on glasses

## Usage

1. Launch app on Mentra glasses
2. Tap "Start Stream" button
3. Camera feed streams to backend
4. View analytics at https://eigenstream-omgfv49il-sunflower-studio.vercel.app
5. Tap "Stop Stream" when done

## Development

To test locally:

```bash
python3 -m http.server 3001
```

Then open http://localhost:3001 in a browser (won't have camera access, but can test UI).

## Architecture

```
Mentra Glasses (Web App)
    ↓
Uses Mentra SDK JavaScript
    ↓
Streams RTMP to Backend
    ↓
Backend analyzes & attests
    ↓
Dashboard shows live data
```

## Files

- `index.html` - Main UI
- `app.js` - Mentra SDK integration and streaming logic
- `package.json` - Project metadata
- `vercel.json` - Vercel deployment config
