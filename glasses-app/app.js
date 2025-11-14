// Generic Mentra Glasses Streaming App
// Configure via config.js

let session = null;
let isStreaming = false;

// UI Elements
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const infoText = document.getElementById('infoText');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const errorMessage = document.getElementById('errorMessage');

// Apply configuration on load
function applyConfig() {
    // Update branding
    document.getElementById('appIcon').textContent = APP_CONFIG.appIcon;
    document.getElementById('appName').textContent = APP_CONFIG.appName;
    document.getElementById('appSubtitle').textContent = APP_CONFIG.subtitle;
    document.getElementById('backendHost').textContent = APP_CONFIG.backendHost;

    // Update dashboard link
    if (APP_CONFIG.features.showDashboardLink && APP_CONFIG.dashboardUrl) {
        document.getElementById('dashboardUrl').href = APP_CONFIG.dashboardUrl;
    } else {
        document.getElementById('dashboardLink').style.display = 'none';
    }

    // Apply theme
    document.documentElement.style.setProperty('--primary-color', APP_CONFIG.theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', APP_CONFIG.theme.secondaryColor);
    document.documentElement.style.setProperty('--gradient', APP_CONFIG.theme.gradient);

    // Update page title
    document.title = APP_CONFIG.appName;
}

// Update UI status
function updateStatus(status, message, info = '') {
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = message;
    infoText.textContent = info;
}

// Show error
function showError(error) {
    console.error('Error:', error);
    errorMessage.textContent = `Error: ${error.message || error}`;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Initialize Mentra SDK
async function initializeMentra() {
    try {
        updateStatus('connecting', 'Initializing SDK...', 'Please wait');

        // Initialize Mentra session
        session = await Mentra.init();

        updateStatus('connected', 'Ready', 'SDK initialized');
        startBtn.disabled = false;

        console.log('Mentra SDK initialized successfully');
    } catch (error) {
        updateStatus('error', 'Initialization Failed', error.message);
        showError(error);
    }
}

// Start RTMP stream
async function startStream() {
    if (!session) {
        showError(new Error('SDK not initialized'));
        return;
    }

    if (isStreaming) {
        console.log('Already streaming');
        return;
    }

    try {
        updateStatus('connecting', 'Starting stream...', 'Connecting to camera');
        startBtn.disabled = true;

        // Request camera permissions if not already granted
        const hasPermission = await session.permissions.check('camera');
        if (!hasPermission) {
            await session.permissions.request('camera');
        }

        // Start unmanaged RTMP stream to configured backend
        await session.camera.startStream({
            rtmpUrl: APP_CONFIG.rtmpUrl,
            quality: APP_CONFIG.streamQuality,
            fps: APP_CONFIG.streamFps,
            enableAudio: APP_CONFIG.enableAudio
        });

        isStreaming = true;
        updateStatus('connected', 'Streaming', `Live to ${APP_CONFIG.backendHost}`);

        startBtn.disabled = true;
        stopBtn.disabled = false;

        console.log('Stream started successfully');

    } catch (error) {
        updateStatus('error', 'Stream Failed', error.message);
        showError(error);
        startBtn.disabled = false;
        isStreaming = false;
    }
}

// Stop RTMP stream
async function stopStream() {
    if (!session || !isStreaming) {
        return;
    }

    try {
        updateStatus('connecting', 'Stopping stream...', 'Please wait');
        stopBtn.disabled = true;

        await session.camera.stopStream();

        isStreaming = false;
        updateStatus('connected', 'Ready', 'Stream stopped');

        startBtn.disabled = false;
        stopBtn.disabled = true;

        console.log('Stream stopped successfully');

    } catch (error) {
        updateStatus('error', 'Stop Failed', error.message);
        showError(error);
        stopBtn.disabled = false;
    }
}

// Monitor stream status
function setupStreamMonitoring() {
    if (!session || !session.camera) {
        return;
    }

    // Subscribe to stream status updates
    session.camera.onStreamStatus((status) => {
        console.log('Stream status:', status);

        if (status.status === 'error') {
            updateStatus('error', 'Stream Error', status.message);
            showError(new Error(status.message));
            isStreaming = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    console.log(`${APP_CONFIG.appName} loaded`);

    // Apply configuration
    applyConfig();

    // Initialize SDK
    initializeMentra().then(() => {
        setupStreamMonitoring();

        // Auto-start if configured
        if (APP_CONFIG.features.autoStart) {
            console.log(`Auto-starting stream in ${APP_CONFIG.features.autoStartDelay}ms...`);
            setTimeout(() => {
                if (!isStreaming && session) {
                    startStream();
                }
            }, APP_CONFIG.features.autoStartDelay);
        }
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App backgrounded');
    } else {
        console.log('App foregrounded');
    }
});
