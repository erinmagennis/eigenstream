# EigenStream - Demo Day Deployment Guide

Complete guide for tomorrow's demo at 12pm.

## System Overview

**EigenStream** streams POV video from Mentra smart glasses to a TEE backend for real-time verifiable analytics.

- **Dashboard**: https://eigenstream-omgfv49il-sunflower-studio.vercel.app (public)
- **Backend**: https://9ab2047d7d97.ngrok-free.app (via ngrok tunnel)
- **TEE Address**: 0xE0F7abe6fFc87e715d69f9e770F52D9f5eD2E8c5

## Architecture

```
Mentra Glasses (RTMP) → ngrok → TEE Backend → WebSocket → Public Dashboard
```

## Pre-Demo Checklist (Morning of Demo)

### 1. Start Backend Server
```bash
cd /Users/erinmagennis/Documents/EigenStream/tee-backend
npm run dev
```

Expected output: "Server running on port 8000"

### 2. Start ngrok Tunnel
```bash
ngrok http 8000 --log=stdout
```

**IMPORTANT**: If the ngrok URL changes from `9ab2047d7d97.ngrok-free.app`:
- Note the new URL
- Update Vercel dashboard environment variables
- Rebuild Mentra app with new RTMP URL

### 3. Verify Dashboard
Open: https://eigenstream-omgfv49il-sunflower-studio.vercel.app

Should show:
- "Waiting for stream..." or current pitch stats
- TEE Address displayed
- "Next Pitch" button enabled (if no pitch active)

### 4. Deploy Mentra App

#### Option A: If eigenstream.png is available
```bash
cd /Users/erinmagennis/Documents/EigenStream/mentra-app
# Copy eigenstream.png into this directory
npm run build
```

#### Option B: Build without icon (upload icon separately in console)
```bash
cd /Users/erinmagennis/Documents/EigenStream/mentra-app
zip -r eigenstream.mapp manifest.json index.js package.json
```

Upload `eigenstream.mapp` to Mentra console:
1. Go to https://console.mentraglass.com
2. Open "EigenStream Demo Day" app
3. Navigate to app files/upload section
4. Upload eigenstream.mapp
5. Deploy to glasses

### 5. Test Stream
- Put on glasses
- Launch EigenStream app (should run in background)
- Check dashboard - you should see:
  - Activity level increasing
  - Stream status "Active"
- Click "Next Pitch" to start tracking

## During Demo Day

### Starting Each Pitch
1. **Before first pitch**: Click "Next Pitch" button
2. Dashboard will show:
   - Live timer counting up
   - Current pitch number
   - Activity level bar
   - Total pitches so far

### Ending a Pitch
1. Click "End Pitch" button when presenter finishes
2. Stats are saved with TEE attestation signature
3. Click "Next Pitch" for the next presenter

### Monitoring
- Dashboard updates in real-time via WebSocket
- Activity level shows audio/video intensity
- All data is cryptographically signed by TEE address

## Technical Details

### Backend Components
- **Port 8000**: Express API + WebSocket
- **Port 1935**: RTMP ingestion (FFmpeg)
- **Analysis**: Audio RMS levels, video motion detection
- **Storage**: /tmp/eigenstream/analysis/pitches.json
- **Attestations**: ethers.js wallet signatures

### Mentra App
- **Package**: com.eigenhacker.eigenstream
- **Type**: Background app
- **Stream**: 1080p @ 30fps, H.264/AAC
- **RTMP**: rtmp://9ab2047d7d97.ngrok-free.app:1935/live/eigenstream
- **Auto-restart**: On frame drops or errors

### Dashboard
- **Framework**: React + Vite
- **WebSocket**: Real-time updates
- **Hosted**: Vercel (serverless)
- **Public**: Anyone can view

## Troubleshooting

### Stream Not Appearing
1. Check backend logs for RTMP connection
2. Verify ngrok tunnel is running
3. Check Mentra app logs in glasses
4. Restart Mentra app on glasses

### Dashboard Not Updating
1. Check WebSocket connection in browser console
2. Verify backend is running
3. Check ngrok URL hasn't changed

### "Next Pitch" Button Disabled
- Button is disabled when a pitch is currently active
- Click "End Pitch" first, then "Next Pitch"

## API Endpoints

- `GET /api/tee/address` - Get TEE wallet address
- `GET /api/stats` - Get current demo day stats
- `POST /api/pitch/start` - Start new pitch (same as "Next Pitch")
- `POST /api/pitch/end` - End current pitch

## Files Structure

```
EigenStream/
├── tee-backend/          # TEE backend server
│   ├── src/
│   │   ├── server.ts     # Main API + WebSocket
│   │   ├── attestation.ts # Crypto signatures
│   │   ├── storage.ts    # Pitch event tracking
│   │   ├── streamProcessor.ts # FFmpeg RTMP
│   │   └── analysis/     # Audio/video analyzers
│   └── Dockerfile
├── dashboard/            # Public React dashboard
│   ├── src/App.tsx       # Main UI component
│   └── Dockerfile
└── mentra-app/           # Mentra glasses app
    ├── manifest.json     # App metadata
    ├── index.js          # Streaming logic
    └── package.json

```

## Post-Demo

All pitch data is stored in:
- `/tmp/eigenstream/analysis/pitches.json`
- Each pitch includes:
  - Duration
  - Activity levels over time
  - TEE attestation signature
  - Start/end timestamps

## Notes

- This setup uses local crypto signing (not running in actual hardware TEE)
- Attestations are still valid - signed by persistent wallet
- For production, deploy to EigenCompute for true TEE execution
- ngrok free tier URL expires after inactivity (sign up for persistent URL)

## Marketing Highlights

- **Verifiable Event Detection**: All pitch stats cryptographically signed
- **Real-time Analytics**: Live activity tracking and visualization
- **Privacy Preserving**: Processing in TEE (conceptually)
- **Proof of Vibes**: Immutable record of demo day energy
