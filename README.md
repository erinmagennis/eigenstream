# EigenStream

POV video streaming from Mentra smart glasses with verifiable analytics powered by Eigen-TEE.

## Overview

EigenStream is a complete system for streaming first-person video from Mentra smart glasses to a public dashboard with real-time analytics. All video processing and analytics are cryptographically attested by a Trusted Execution Environment (TEE).

Perfect for demo days, live events, security monitoring, sports recording, and any POV streaming use case.

### Features

- **Generic glasses app**: Fully customizable for any use case (security, events, sports, etc.)
- **Live video streaming**: RTMP ingestion with HLS transcoding for browser playback
- **Real-time RTMP streaming** from Mentra glasses to TEE backend
- **Live video player**: Watch the stream in real-time on public dashboard
- **Verifiable analytics**: Audio/video analysis with cryptographic attestations
- **Live dashboard**: Real-time pitch tracking and activity metrics
- **Beautiful UI**: Modern, responsive design with start/stop controls
- **Auto-restart**: Handles errors gracefully with automatic retry
- **Secure storage**: All processing happens inside the TEE

## Project Structure

```
EigenStream/
├── glasses-app/         # Web app for Mentra glasses
│   ├── config.js       # ⚙️  Customize for your use case
│   ├── index.html
│   ├── app.js
│   └── CUSTOMIZE.md    # Customization guide
├── tee-backend/        # TEE backend with HLS transcoding
│   └── src/
├── dashboard/          # Public dashboard with video player
│   └── src/
└── LICENSE             # GPL v3
```

## Quick Start

### For Complete Setup Instructions

See **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** for:
- Detailed deployment steps
- Mentra console configuration
- Testing checklist
- Troubleshooting guide
- API documentation

### Quick Deploy (Summary)

**Step 1: Deploy Glasses App**
1. Push this repo to GitHub
2. Import to Vercel (root: `glasses-app`)
3. Copy deployment URL

**Step 2: Configure Mentra Console**
1. Go to https://console.mentraglass.com
2. Create/edit your app
3. Set Server URL to Vercel URL from Step 1
4. Install app on glasses

**Step 3: Start Backend**
```bash
cd tee-backend
npm install
npm run dev
```

**Step 4: Use the App**
- Ensure glasses and computer on same WiFi
- Launch app on glasses
- Tap "Start Stream"
- Watch video + analytics on dashboard

### Customization

Edit `glasses-app/config.js` to customize for your use case:

```javascript
const APP_CONFIG = {
    appName: "Your App Name",
    appIcon: "🎥",
    subtitle: "Your Tagline",
    rtmpUrl: "rtmp://your-server:1935/live/stream",
    // ... more options
};
```

See `glasses-app/CUSTOMIZE.md` for examples:
- Security monitoring
- Live events
- Sports recording
- Customer support
- Industrial inspection

## Architecture

```
Mentra Glasses (Web App from Vercel)
    ↓
User taps "Start Stream"
    ↓
RTMP Stream → Backend (localhost:1935)
    ↓
┌─────────────────────────────────────┐
│      TEE Backend (localhost:8000)   │
│  ┌───────────────────────────────┐  │
│  │   RTMP Ingestion (FFmpeg)     │  │
│  └─────────┬─────────────────────┘  │
│            ├──→ HLS Transcoding      │
│            │    (playlist.m3u8)      │
│            │                         │
│            └──→ Analysis Pipeline    │
│                 • Audio detection    │
│                 • Scene changes      │
│                 • Motion analysis    │
│  ┌───────────────────────────────┐  │
│  │   Attestation Service         │  │
│  │   (Crypto signing)            │  │
│  └───────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
               ↓
Dashboard (Vercel)
  ├─→ HLS Video Player (hls.js)
  └─→ Real-time Analytics (WebSocket)
```

## Deployment to EigenCompute

### Install EigenX CLI

```bash
curl -fsSL https://tools.eigencloud.xyz | bash
```

### Login to EigenCloud

```bash
eigenx login
```

### Build and Deploy

```bash
# Build the TEE backend Docker image
cd tee-backend
docker build -t eigenstream-tee .

# Tag for your registry
docker tag eigenstream-tee:latest [YOUR-USERNAME]/eigenstream-tee:latest

# Deploy to EigenCompute
eigenx app deploy [YOUR-USERNAME]/eigenstream-tee:latest
```

### Get Your TEE Endpoint

After deployment, EigenX will provide you with:
- **TEE HTTPS endpoint**: Use this for the dashboard
- **Public IP**: Use this for Mentra RTMP configuration

Update your Mentra glasses to point to: `rtmp://[TEE-PUBLIC-IP]:1935/live/eigenstream`

## API Reference

### REST API

**Health Check**
```http
GET /health
```

**Get Live Stats**
```http
GET /api/stats
Response: { totalPitches, currentPitch, currentActivityLevel, attestation, ... }
```

**Start New Pitch**
```http
POST /api/pitch/start
```

**End Current Pitch**
```http
POST /api/pitch/end
```

**Get TEE Address**
```http
GET /api/tee/address
Response: { address: "0x...", message: "..." }
```

**Verify Attestation**
```http
POST /api/tee/verify
Body: { attestation: {...} }
Response: { valid: true/false }
```

### WebSocket

Connect to `ws://[SERVER]/` for real-time updates:

**Events:**
- `initial-state`: Current stats on connection
- `stats-update`: Live stats updates
- `pitch-started`: New pitch event
- `pitch-ended`: Pitch completion event

## Demo Day Usage

### Setup (Before Event)

1. Deploy TEE to EigenCompute
2. Configure Mentra glasses with TEE RTMP endpoint
3. Open dashboard on projector/screen
4. Test stream with glasses

### During Event

**Manual Control:**
- Click **"Next Pitch"** button when a new presenter starts
- Click **"End Pitch"** when they finish

**Voice Control (Future):**
- Say "next pitch" to advance
- Automatic detection based on scene changes

**What Gets Tracked:**
- Pitch count and duration
- Audio activity levels
- Motion/energy in frame
- Scene changes (new presenters)

**All data is cryptographically signed by the TEE!**

## Privacy Modes

### Version A: Full Access Mode
- Raw video stored in TEE
- Complete playback available
- Full audit trail
- **Use for**: Internal docs, compliance

### Version B: Privacy-First Mode
- Video analyzed in real-time
- **No raw footage stored**
- Only metadata + attestations
- **Use for**: Privacy demos, GDPR showcase

## Technologies

- **Backend**: Node.js, TypeScript, Express
- **Stream Processing**: FFmpeg
- **Analysis**: Custom audio/video analyzers
- **Attestation**: ethers.js cryptographic signing
- **Frontend**: React, Vite
- **Deployment**: Docker, EigenCompute TEE
- **Blockchain**: Base (optional on-chain attestations)

## Troubleshooting

### Stream not connecting

1. Check Mentra glasses network connection
2. Verify RTMP URL is correct (including port 1935)
3. Check TEE firewall allows port 1935
4. Test with local RTMP stream first

### Dashboard not updating

1. Check WebSocket connection in browser console
2. Verify API_URL and WS_URL in dashboard .env
3. Ensure TEE backend is running

### FFmpeg errors

1. Make sure FFmpeg is installed in Docker container
2. Check video/audio codec compatibility
3. Verify RTMP stream format from glasses

## Roadmap

- [x] Basic RTMP streaming
- [x] Real-time analytics dashboard
- [x] Cryptographic attestations
- [ ] Voice command detection ("next pitch")
- [ ] Base blockchain integration
- [ ] Privacy-preserving highlights
- [ ] Automatic pitch detection (no manual control)
- [ ] Multi-stream support (multiple glasses)
- [ ] NFT minting for key moments

## Technologies

- **Glasses App**: Vanilla JS with Mentra SDK
- **Backend**: Node.js, TypeScript, Express, FFmpeg
- **Stream Processing**: RTMP ingestion, HLS transcoding
- **Analysis**: Custom audio/video analyzers
- **Attestation**: ethers.js cryptographic signing
- **Frontend**: React, Vite, hls.js
- **Deployment**: Vercel (apps), Docker (backend)

## Contributing

This project is open source under GPL v3. Fork, extend, and share your improvements!

Requirements for derivatives:
- Keep source code open
- Use GPL v3 license
- Give credit to original author
- Share your modifications

## License

**GNU General Public License v3.0**

Copyright (C) 2025 Erin Magennis

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See [LICENSE](./LICENSE) for full terms.

**Summary:**
- ✅ Use for any purpose, study, modify, share, use commercially
- ❌ Must keep source open, use GPL v3, give credit, share modifications
- ❌ Cannot make closed source, remove attribution, or use restrictive license

## Support

For issues or questions:
- EigenCloud Docs: https://docs.eigencloud.xyz
- Mentra Docs: https://docs.mentraglass.com
- GitHub Issues: https://github.com/[YOUR_USERNAME]/eigenstream
