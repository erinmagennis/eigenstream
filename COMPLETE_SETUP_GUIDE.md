# EigenStream - Complete Setup Guide

🎉 **Everything is built and ready to deploy!**

## What We Built

### 1. **Generic Mentra Glasses App** (`/glasses-app`)
- Fully configurable streaming app for Mentra glasses
- Edit `config.js` to customize for any use case
- Simple UI with start/stop controls
- Auto-restart on errors
- Background or foreground mode

### 2. **Enhanced Backend** (`/tee-backend`)
- RTMP stream ingestion (port 1935)
- Real-time audio/video analysis
- **NEW**: HLS transcoding for browser playback
- Cryptographic attestations
- WebSocket for live updates
- HTTP API endpoints

### 3. **Enhanced Dashboard** (`/dashboard`)
- Live pitch tracking & analytics
- **NEW**: Video player with HLS support
- Real-time activity visualization
- Public viewing for audience
- Beautiful UI with live timer

## Architecture Flow

```
Mentra Glasses
    ↓ (web app loads from Vercel)
Start RTMP Stream
    ↓
Backend receives stream (192.168.0.228:1935)
    ↓
    ├→ FFmpeg transcodes to HLS
    ├→ Analyzes audio/video
    └→ Creates attestations
    ↓
Dashboard (Vercel)
    ├→ Plays HLS video stream
    └→ Shows live analytics
```

## Deployment Steps

### Step 1: Deploy Glasses App to Vercel

1. Go to https://vercel.com/sunflower-studio
2. Click **"Add New Project"**
3. **Import from Local**:
   - Path: `/Users/erinmagennis/Documents/EigenStream/glasses-app`
4. **Settings**:
   - Project Name: `eigenstream-glasses`
   - Framework: **Other**
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: `./`
5. Click **"Deploy"**
6. **Copy the deployment URL** (e.g., `https://eigenstream-glasses.vercel.app`)

### Step 2: Update Mentra Console

1. Go to https://console.mentraglass.com
2. Open your **"EigenStream Demo Day"** app
3. Update the **Server URL** field with your Vercel URL from Step 1
4. Click **"Save"**

### Step 3: Deploy Dashboard (if needed)

The dashboard is already deployed at:
```
https://eigenstream-omgfv49il-sunflower-studio.vercel.app
```

But if you need to redeploy with the new video player:

```bash
cd /Users/erinmagennis/Documents/EigenStream/dashboard
npm install  # Install hls.js
vercel --prod
```

Update the dashboard URL in `glasses-app/config.js` if it changed.

## Running the System

### Before Demo/Testing:

1. **Start Backend**:
   ```bash
   cd /Users/erinmagennis/Documents/EigenStream/tee-backend
   npm run dev
   ```
   Should see: "Server running on port 8000"

2. **Verify glasses and computer on same WiFi**

3. **Install app on glasses**:
   - Open Mentra console
   - Install/refresh "EigenStream Demo Day" app

4. **Launch app on glasses**

5. **Tap "Start Stream"** on glasses

6. **Watch the magic happen**:
   - Backend logs show: "🎬 Stream started"
   - Backend logs show: "🎬 Starting HLS transcoding"
   - Dashboard shows live video + analytics

## Testing Checklist

- [ ] Backend running on local machine
- [ ] Glasses connected to same WiFi
- [ ] Glasses app installed and launched
- [ ] Stream button tapped in glasses app
- [ ] Video appears on dashboard
- [ ] Activity levels updating in real-time
- [ ] "Next Pitch" / "End Pitch" buttons work
- [ ] Timer counting up during pitches

## Customization

### For Different Use Cases:

Edit `/glasses-app/config.js`:

```javascript
const APP_CONFIG = {
    appName: "Your App Name",
    appIcon: "🎥",
    subtitle: "Your Tagline",
    rtmpUrl: "rtmp://your-server.com:1935/live/stream",
    // ... more options
};
```

See `/glasses-app/CUSTOMIZE.md` for detailed examples:
- Security monitoring
- Live events
- Sports recording
- Customer support
- Industrial inspection

## Troubleshooting

### Video Not Showing on Dashboard

1. **Check backend logs** for "HLS transcoding started"
2. **Verify HLS files** exist: `ls /tmp/eigenstream/hls/`
3. **Check browser console** for HLS errors
4. **Refresh dashboard** page
5. **Wait 5-10 seconds** after stream starts (transcoding delay)

### Stream Not Connecting

1. **Verify WiFi**: Both on `192.168.0.x` network?
2. **Check backend** logs for RTMP connection
3. **Restart glasses app**
4. **Check firewall** allowing ports 8000 and 1935

### Glasses App Not Loading

1. **Verify Server URL** in Mentra console matches Vercel URL
2. **Check Vercel deployment** is live
3. **Try opening Vercel URL** in desktop browser (should show UI)
4. **Re-deploy glasses app** to Mentra

## API Endpoints

**Backend (http://localhost:8000):**
- `GET /health` - Server health check
- `GET /api/stats` - Current demo day stats
- `GET /api/stream/status` - Stream status
- `GET /stream/playlist.m3u8` - HLS video playlist
- `GET /stream/segment*.ts` - HLS video segments
- `POST /api/pitch/start` - Start new pitch
- `POST /api/pitch/end` - End current pitch
- `GET /api/tee/address` - Get TEE wallet address

## File Structure

```
EigenStream/
├── glasses-app/              # Mentra glasses web app
│   ├── config.js            # ⚙️  EDIT THIS TO CUSTOMIZE
│   ├── index.html
│   ├── app.js
│   ├── CUSTOMIZE.md         # 📖 Customization guide
│   └── DEPLOY.md
│
├── tee-backend/             # Backend server
│   ├── src/
│   │   ├── server.ts        # Main server + HLS routes
│   │   ├── hlsService.ts    # HLS transcoding service
│   │   ├── streamProcessor.ts
│   │   ├── attestation.ts
│   │   └── storage.ts
│   └── package.json
│
├── dashboard/               # Public dashboard
│   ├── src/
│   │   ├── App.tsx          # Main component + video player
│   │   ├── VideoPlayer.tsx  # HLS video player component
│   │   └── App.css          # Styles with video player CSS
│   └── package.json         # Now includes hls.js
│
└── COMPLETE_SETUP_GUIDE.md  # This file
```

## Key Features

✅ **Generic & Reusable** - Customize for any use case
✅ **Live Video Stream** - HLS playback in browser
✅ **Real-time Analytics** - Audio/video analysis
✅ **Verifiable Attestations** - Crypto signatures
✅ **Public Dashboard** - Anyone can watch
✅ **Auto-restart** - Handles errors gracefully
✅ **Beautiful UI** - Modern, responsive design

## Notes

- **Local TEE**: Currently using local crypto signing (not hardware TEE)
- **Same WiFi Required**: Glasses and backend must be on same network
- **RTMP → HLS**: ~5 second delay for transcoding/buffering
- **Video Quality**: 1080p @ 30fps by default (configurable)
- **Storage**: HLS segments saved to `/tmp/eigenstream/hls/`

## Next Steps

1. Deploy glasses app to Vercel
2. Update Mentra console Server URL
3. Test end-to-end streaming
4. Customize branding/theme in `config.js`
5. Optional: Deploy to EigenCompute for real TEE

## Support

- Mentra Docs: https://docs.mentraglass.com
- Eigen Docs: https://docs.eigencloud.xyz
- Glasses App Customization: `/glasses-app/CUSTOMIZE.md`
- Deployment: `/glasses-app/DEPLOY.md`

---

**You're all set! 🚀**

The system is complete and ready for demo day. Just deploy the glasses app to Vercel, update the Mentra console, and you're live!
