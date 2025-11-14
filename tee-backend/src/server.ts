import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { StorageService } from './storage';
import { AttestationService } from './attestation';
import { StreamProcessor } from './streamProcessor';
import { HLSService } from './hlsService';
import { AnalysisFrame } from './types';
import { validateAttestation, validateRtmpUrl, validateSegment } from './validation';

dotenv.config();

const PORT = process.env.PORT || 8000;
const RTMP_PORT = process.env.RTMP_PORT || 1935;
const STREAM_KEY = process.env.STREAM_KEY || 'eigenstream';

class EigenStreamServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private storage: StorageService;
  private attestation: AttestationService;
  private streamProcessor: StreamProcessor;
  private hlsService: HLSService;
  private clients: Set<WebSocket> = new Set();
  private currentAudioLevel: number = 0;
  private currentMotionLevel: number = 0;
  private lastSceneChange: Date | null = null;
  private streamActive: boolean = false;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.storage = new StorageService();
    this.attestation = new AttestationService();
    this.streamProcessor = new StreamProcessor(this.storage);
    this.hlsService = new HLSService();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupStreamProcessor();
  }

  private setupMiddleware(): void {
    // CORS configuration - restrict to allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`⚠️  Blocked CORS request from: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
    }));

    this.app.use(express.json({ limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        tee: this.attestation.getAddress(),
        streaming: this.streamProcessor.isProcessing(),
        timestamp: new Date()
      });
    });

    // Get current stats
    this.app.get('/api/stats', async (req, res) => {
      const stats = this.storage.getStats();
      const attestation = await this.attestation.createAttestation(stats);

      res.json({
        ...stats,
        attestation: attestation.signature
      });
    });

    // Get all pitches
    this.app.get('/api/pitches', (req, res) => {
      res.json(this.storage.getAllPitches());
    });

    // Get current pitch
    this.app.get('/api/pitch/current', (req, res) => {
      const current = this.storage.getCurrentPitch();
      if (!current) {
        return res.status(404).json({ error: 'No active pitch' });
      }
      res.json(current);
    });

    // Start new pitch (manual trigger)
    this.app.post('/api/pitch/start', (req, res) => {
      const pitch = this.storage.startNewPitch();

      // Notify all connected clients
      this.broadcastToClients({
        type: 'pitch-started',
        data: pitch
      });

      res.json(pitch);
    });

    // End current pitch (manual trigger)
    this.app.post('/api/pitch/end', (req, res) => {
      const pitch = this.storage.endCurrentPitch();

      if (!pitch) {
        return res.status(404).json({ error: 'No active pitch to end' });
      }

      // Notify all connected clients
      this.broadcastToClients({
        type: 'pitch-ended',
        data: pitch
      });

      res.json(pitch);
    });

    // Get TEE address (for verification)
    this.app.get('/api/tee/address', (req, res) => {
      res.json({
        address: this.attestation.getAddress(),
        message: 'This address cryptographically proves all attestations came from this TEE'
      });
    });

    // HLS video streaming endpoints
    // Serve HLS playlist
    this.app.get('/stream/playlist.m3u8', (req, res) => {
      const playlistPath = this.hlsService.getPlaylistPath();

      if (!this.hlsService.hasPlaylist()) {
        return res.status(404).json({ error: 'Stream not available' });
      }

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(playlistPath);
    });

    // Serve HLS segments
    this.app.get('/stream/:segment', validateSegment, (req, res) => {
      const segmentPath = path.join(this.hlsService.getHLSPath(), req.params.segment);

      res.setHeader('Content-Type', 'video/MP2T');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(segmentPath);
    });

    // Stream status
    this.app.get('/api/stream/status', (req, res) => {
      res.json({
        active: this.streamActive,
        transcoding: this.hlsService.isActive(),
        hasPlaylist: this.hlsService.hasPlaylist(),
        playlistUrl: this.hlsService.hasPlaylist() ? '/stream/playlist.m3u8' : null
      });
    });

    // Verify an attestation
    this.app.post('/api/tee/verify', validateAttestation, async (req, res) => {
      const { attestation } = req.body;
      const isValid = await this.attestation.verifyAttestation(attestation);
      res.json({ valid: isValid });
    });

    // Start streaming (for testing)
    this.app.post('/api/stream/start', validateRtmpUrl, async (req, res) => {
      const rtmpUrl = req.body.rtmpUrl || `rtmp://localhost:${RTMP_PORT}/live/${STREAM_KEY}`;

      try {
        await this.streamProcessor.startProcessing(rtmpUrl);
        res.json({ status: 'started', rtmpUrl });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Stop streaming
    this.app.post('/api/stream/stop', (req, res) => {
      this.streamProcessor.stopProcessing();
      res.json({ status: 'stopped' });
    });

    // Get stream info
    this.app.get('/api/stream/info', (req, res) => {
      res.json({
        isProcessing: this.streamProcessor.isProcessing(),
        recording: this.streamProcessor.getCurrentRecording(),
        rtmpEndpoint: `rtmp://localhost:${RTMP_PORT}/live/${STREAM_KEY}`
      });
    });

    // 404 handler - must be after all other routes
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not found',
        message: `Endpoint ${req.method} ${req.path} not found`
      });
    });

    // Global error handling middleware - must be last
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Unhandled error:', err);

      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV !== 'production';

      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(isDevelopment && { stack: err.stack, details: err })
      });
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('📱 New dashboard client connected');
      this.clients.add(ws);

      // Send current state immediately
      const stats = this.storage.getStats();
      const initialMessage = {
        type: 'initial-state',
        data: stats
      };
      console.log('📤 Sending initial state:', JSON.stringify(initialMessage, null, 2));
      ws.send(JSON.stringify(initialMessage));

      ws.on('close', () => {
        console.log('📱 Dashboard client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  private setupStreamProcessor(): void {
    // Handle audio analysis
    this.streamProcessor.on('audio-analyzed', (data: { audioLevel: number; timestamp: Date }) => {
      this.currentAudioLevel = data.audioLevel;
      this.updateAnalysisFrame();
    });

    // Handle video analysis
    this.streamProcessor.on('frame-analyzed', (frame: Partial<AnalysisFrame>) => {
      this.currentMotionLevel = frame.motionLevel || 0;

      if (frame.sceneChange) {
        this.lastSceneChange = new Date();
      }

      this.updateAnalysisFrame();
    });

    // Stream events
    this.streamProcessor.on('stream-started', (data) => {
      console.log('🎬 Stream started:', data);
      this.streamActive = true;

      // Start HLS transcoding for browser playback
      setTimeout(() => {
        this.hlsService.startTranscoding();
      }, 2000); // Wait 2 seconds for stream to stabilize
      this.broadcastToClients({
        type: 'stream-started',
        data
      });
    });

    this.streamProcessor.on('stream-ended', () => {
      console.log('⏹️  Stream ended');
      this.streamActive = false;

      // Stop HLS transcoding
      this.hlsService.stopTranscoding();

      this.broadcastToClients({
        type: 'stream-ended',
        data: {}
      });
    });
  }

  private updateAnalysisFrame(): void {
    const frame: AnalysisFrame = {
      timestamp: new Date(),
      audioLevel: this.currentAudioLevel,
      motionLevel: this.currentMotionLevel,
      sceneChange: this.lastSceneChange
        ? (Date.now() - this.lastSceneChange.getTime()) < 1000
        : false
    };

    this.storage.addAnalysisFrame(frame);

    // Broadcast to clients every second
    if (Math.random() < 0.03) { // ~1 per second if processing at 30fps
      this.broadcastStats();
    }
  }

  private async broadcastStats(): Promise<void> {
    const stats = this.storage.getStats();
    const attestation = await this.attestation.createAttestation(stats);

    this.broadcastToClients({
      type: 'stats-update',
      data: {
        ...stats,
        attestationSignature: attestation.signature
      }
    });
  }

  private broadcastToClients(message: any): void {
    const payload = JSON.stringify(message);
    console.log(`📡 Broadcasting to ${this.clients.size} clients:`, message.type);

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  public async start(): Promise<void> {
    // Load existing data
    this.storage.loadPitches();

    // Start HTTP server
    this.server.listen(PORT, () => {
      console.log('');
      console.log('🚀 EigenStream TEE Server Started!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 API Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`📹 RTMP Endpoint: rtmp://localhost:${RTMP_PORT}/live/${STREAM_KEY}`);
      console.log(`🔐 TEE Address: ${this.attestation.getAddress()}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('Configure your Mentra glasses to stream to the RTMP endpoint above.');
      console.log('Dashboard will be available once you start it.');
      console.log('');
    });

    // Initialize RTMP server
    this.streamProcessor.startRTMPServer();
  }
}

// Start the server
const server = new EigenStreamServer();
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
