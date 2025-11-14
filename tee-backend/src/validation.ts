import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for API endpoints
 */

// Validate attestation object structure
export function validateAttestation(req: Request, res: Response, next: NextFunction) {
  const { attestation } = req.body;

  if (!attestation || typeof attestation !== 'object') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Attestation must be an object'
    });
  }

  if (!attestation.signature || typeof attestation.signature !== 'string') {
    return res.status(400).json({
      error: 'Invalid attestation',
      message: 'Missing or invalid signature'
    });
  }

  if (!attestation.data) {
    return res.status(400).json({
      error: 'Invalid attestation',
      message: 'Missing data field'
    });
  }

  if (!attestation.teeAddress || typeof attestation.teeAddress !== 'string') {
    return res.status(400).json({
      error: 'Invalid attestation',
      message: 'Missing or invalid TEE address'
    });
  }

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(attestation.teeAddress)) {
    return res.status(400).json({
      error: 'Invalid attestation',
      message: 'Invalid TEE address format'
    });
  }

  next();
}

// Validate RTMP URL
export function validateRtmpUrl(req: Request, res: Response, next: NextFunction) {
  const { rtmpUrl } = req.body;

  if (rtmpUrl && typeof rtmpUrl !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'RTMP URL must be a string'
    });
  }

  if (rtmpUrl && !rtmpUrl.startsWith('rtmp://')) {
    return res.status(400).json({
      error: 'Invalid RTMP URL',
      message: 'URL must start with rtmp://'
    });
  }

  // Prevent excessively long URLs
  if (rtmpUrl && rtmpUrl.length > 500) {
    return res.status(400).json({
      error: 'Invalid RTMP URL',
      message: 'URL too long'
    });
  }

  next();
}

// Sanitize segment filename to prevent path traversal
export function validateSegment(req: Request, res: Response, next: NextFunction) {
  const { segment } = req.params;

  if (!segment || typeof segment !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Segment parameter required'
    });
  }

  // Only allow .ts files with specific naming pattern
  if (!/^segment\d{3}\.ts$/.test(segment)) {
    return res.status(400).json({
      error: 'Invalid segment',
      message: 'Invalid segment filename format'
    });
  }

  // Prevent path traversal
  if (segment.includes('..') || segment.includes('/') || segment.includes('\\')) {
    return res.status(400).json({
      error: 'Invalid segment',
      message: 'Path traversal not allowed'
    });
  }

  next();
}

// Body size limiter (already handled by express.json({ limit }), but add extra check)
export function validateBodySize(maxSize: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');

    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: `Request body must be less than ${maxSize} bytes`
      });
    }

    next();
  };
}
