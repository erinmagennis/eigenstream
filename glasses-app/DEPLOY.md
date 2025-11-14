# Deploy Glasses App to Vercel

## Option 1: Vercel Web UI (Recommended)

1. Go to https://vercel.com/sunflower-studio
2. Click "Add New Project"
3. Import from: `/Users/erinmagennis/Documents/EigenStream/glasses-app`
4. Project name: `eigenstream-glasses`
5. Framework Preset: **Other** (it's just static HTML)
6. Root Directory: `./`
7. Build Command: (leave empty)
8. Output Directory: `./`
9. Click "Deploy"

## Option 2: Vercel CLI

```bash
cd /Users/erinmagennis/Documents/EigenStream/glasses-app
vercel --prod
```

## After Deployment

1. Copy the deployment URL (e.g., `https://eigenstream-glasses.vercel.app`)
2. Go to https://console.mentraglass.com
3. Open "EigenStream Demo Day" app
4. Update the **Server URL** field to your new Vercel URL
5. Save the app

## Testing

1. Install/refresh the app on your Mentra glasses
2. Launch the app - you should see the EigenStream interface
3. Tap "Start Stream"
4. Check backend logs for RTMP connection
5. View dashboard at https://eigenstream-omgfv49il-sunflower-studio.vercel.app

## Troubleshooting

If the app doesn't load on glasses:
- Check Server URL is correct in Mentra console
- Ensure Vercel deployment is live
- Check browser console for JavaScript errors (if testing on desktop)

If stream doesn't connect:
- Verify backend is running (`cd tee-backend && npm run dev`)
- Check glasses and computer on same WiFi
- Verify RTMP_URL in `app.js` matches your backend IP
