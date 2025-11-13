# Demo Day Quickstart - Tomorrow at 12pm!

## Timeline: Tonight → Tomorrow 12pm

### TONIGHT (2-3 hours setup)

#### Step 1: Install Everything (15 min)

```bash
# Run the setup script
./setup.sh
```

If you don't have Docker yet, install it first:
- **macOS**: Download from https://www.docker.com/products/docker-desktop/
- **Windows/Linux**: Follow https://docs.docker.com/get-docker/

#### Step 2: Test Locally (30 min)

**Terminal 1:**
```bash
cd tee-backend
npm run dev
```

You should see:
```
🚀 EigenStream TEE Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 API Server: http://localhost:8000
🔐 TEE Address: 0x...
```

**Terminal 2:**
```bash
cd dashboard
npm run dev
```

Dashboard opens at http://localhost:3000

**Test the dashboard:**
1. Open http://localhost:3000
2. Click "Next Pitch" - should show Pitch #1
3. Click "End Pitch" - should calculate duration
4. Repeat to test the flow

#### Step 3: Deploy to EigenCompute (1 hour)

**First time setup:**
```bash
# Install EigenX CLI
curl -fsSL https://tools.eigencloud.xyz | bash

# Login to EigenCloud
eigenx login
```

**Build and deploy:**
```bash
./deploy.sh
```

When prompted:
- Enter your Docker Hub username
- Login to Docker Hub if needed
- Wait for deployment (5-10 minutes)

**Save your endpoints:**
- TEE Public IP: `____________`
- TEE HTTPS URL: `____________`

#### Step 4: Configure Mentra Glasses (15 min)

1. Go to https://console.mentraglass.com
2. Open your app settings
3. Set streaming mode: **Unmanaged RTMP**
4. Set RTMP URL: `rtmp://[YOUR-TEE-IP]:1935/live/eigenstream`
5. Deploy to glasses

**Test the stream:**
- Start streaming from glasses
- Check TEE logs: should see FFmpeg processing
- Verify dashboard shows activity

---

### TOMORROW MORNING (Before 12pm)

#### Pre-Demo Checklist (11:00am - 11:30am)

- [ ] TEE backend is running (check endpoint)
- [ ] Dashboard is accessible (http://localhost:3000 or deployed URL)
- [ ] Mentra glasses are charged
- [ ] Glasses are connected to WiFi
- [ ] Stream to TEE is working (test 30 seconds of footage)
- [ ] Dashboard shows real-time updates
- [ ] "Next Pitch" and "End Pitch" buttons work
- [ ] Have dashboard open on projector/second screen

#### During Demo Day (12:00pm)

**Your Workflow:**

1. **When first presenter starts:**
   - Click "Next Pitch" → Shows "Pitch #1"
   - Timer starts automatically

2. **While they're presenting:**
   - Watch activity level update in real-time
   - Activity bar shows audio/motion detection
   - All verified by TEE (signature shown at bottom)

3. **When they finish:**
   - Click "End Pitch"
   - Duration is calculated and stored
   - Average pitch length updates

4. **For next presenter:**
   - Click "Next Pitch" → Shows "Pitch #2"
   - Repeat!

**Dashboard shows:**
- Current pitch number + duration
- Activity level (live bar)
- Total pitches today
- Total time presenting
- Average pitch length
- Crowd energy level

**All signed by TEE!** (Address shown at bottom)

---

## What to Say / Tweet

**Before demo day:**
> "Tomorrow's demo day will be streamed through @EigenCloud TEE - every pitch cryptographically verified in real-time. Watch the dashboard: [URL]"

**During demo day:**
> "Live now: Demo day analytics powered by Eigen-TEE + @MentraGlass POV stream. All verifiable, all real-time. [Dashboard URL]"

**After demo day:**
> "Wrapped! X pitches, Xh Ym of demos, all verified by TEE. Check the receipts: [TEE signature] 🔐"

---

## Troubleshooting

### Stream not connecting?

1. Check Mentra glasses WiFi
2. Verify RTMP URL is correct
3. Check TEE logs: `docker logs [container-id]`
4. Test with manual RTMP stream: `ffmpeg -re -i test.mp4 -c copy -f flv rtmp://[TEE-IP]:1935/live/eigenstream`

### Dashboard not updating?

1. Check WebSocket connection in browser console
2. Verify TEE backend is running
3. Refresh page
4. Check API endpoints: http://[TEE]/health

### Activity level stuck at 0?

1. Make sure stream is actually sending data
2. Check FFmpeg is processing (see logs)
3. Audio detection threshold might need tuning
4. Try speaking louder / moving more

### Emergency fallback:

If streaming fails:
1. Use manual pitch tracking (buttons only)
2. Record video separately
3. Process later to show verifiable analytics
4. Focus on the TEE signing feature (still works!)

---

## Optional Enhancements (If You Have Time)

### Make dashboard public (so others can watch):

**Option 1: ngrok (easiest)**
```bash
# Install ngrok
brew install ngrok

# Expose dashboard
ngrok http 3000
```

Share the ngrok URL!

**Option 2: Deploy dashboard to Vercel**
```bash
cd dashboard
npm run build

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Add Base blockchain attestations:

We have the infrastructure ready - just need to:
1. Deploy smart contract to Base
2. Update `.env` with contract address
3. Uncomment blockchain posting code

This can wait until after demo day!

---

## What Makes This Cool

1. **Verifiable Analytics**: Every stat signed by TEE
   - Can't fake the numbers
   - Cryptographic proof of authenticity
   - Show the signature!

2. **Real-time Processing**: Not post-processing, it's LIVE
   - Audio/video analysis happening in TEE
   - WebSocket updates to dashboard
   - Sub-second latency

3. **Privacy-Preserving**: Raw video stays in TEE
   - Only you have access
   - Analytics are computed securely
   - Can prove things happened without revealing footage

4. **First-person POV**: Unique perspective
   - Presenter's view of the audience
   - Authentic hacker house vibes
   - Different from traditional recording

---

## Success Metrics

**MVP Success:**
- ✅ Stream working
- ✅ Dashboard updating
- ✅ Manual pitch tracking works
- ✅ TEE signatures visible

**Bonus Points:**
- Real-time activity detection is accurate
- Scene changes detected (new presenters)
- Dashboard is public (others can watch)
- Tweet gets engagement

**Stretch Goals:**
- Voice command "next pitch" works
- On-chain attestations posted
- Privacy mode demo
- NFTs for best pitches

---

## Post-Demo Ideas

After you have footage and data:

1. **Highlight reel** from scene change detection
2. **Stats thread** on Twitter with TEE proofs
3. **NFTs** for each pitch with attestations
4. **Leaderboard** of energy levels
5. **Privacy demo** showing analytics without raw footage

---

Good luck tomorrow! You got this. 🚀
