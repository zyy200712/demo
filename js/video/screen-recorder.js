import { Logger } from '../utils/logger.js';
import { ApplicationError, ErrorCodes } from '../utils/error-boundary.js';

export class ScreenRecorder {
    constructor(options = {}) {
        this.stream = null;
        this.isRecording = false;
        this.onScreenData = null;
        this.frameCanvas = document.createElement('canvas');
        this.frameCtx = this.frameCanvas.getContext('2d');
        this.captureInterval = null;
        this.previewElement = null;
        this.options = {
            fps: 5, // Lower FPS for screen sharing
            quality: 0.8,
            width: 1280,
            height: 720,
            maxFrameSize: 200 * 1024, // 200KB max per frame
            ...options
        };
        this.frameCount = 0;
    }

    async start(previewElement, onScreenData) {
        try {
            this.onScreenData = onScreenData;
            this.previewElement = previewElement;

            // Request screen sharing access with audio
            this.stream = await navigator.mediaDevices.getDisplayMedia({ 
                video: {
                    width: { ideal: this.options.width },
                    height: { ideal: this.options.height },
                    frameRate: { ideal: this.options.fps }
                },
                audio: false // Set to true if you want to capture audio as well
            });

            // Set up preview
            if (this.previewElement) {
                this.previewElement.srcObject = this.stream;
                await new Promise((resolve) => {
                    this.previewElement.onloadedmetadata = () => {
                        this.previewElement.play()
                            .then(resolve)
                            .catch(error => {
                                Logger.error('Failed to play preview:', error);
                                resolve();
                            });
                    };
                });

                // Set canvas size based on video dimensions
                this.frameCanvas.width = this.previewElement.videoWidth;
                this.frameCanvas.height = this.previewElement.videoHeight;
            }

            // Start frame capture loop
            this.isRecording = true;
            this.startFrameCapture();
            
            // Handle stream stop
            this.stream.getVideoTracks()[0].addEventListener('ended', () => {
                this.stop();
            });

            Logger.info('Screen recording started');

        } catch (error) {
            if (error.name === 'NotAllowedError') {
                throw new ApplicationError(
                    'Screen sharing permission denied',
                    ErrorCodes.SCREEN_PERMISSION_DENIED,
                    { originalError: error }
                );
            }
            throw new ApplicationError(
                'Failed to start screen recording',
                ErrorCodes.SCREEN_START_FAILED,
                { originalError: error }
            );
        }
    }

    startFrameCapture() {
        const frameInterval = 1000 / this.options.fps;
        
        this.captureInterval = setInterval(() => {
            if (!this.isRecording || !this.previewElement || !this.onScreenData) return;
            
            try {
                // Ensure video is playing and ready
                if (this.previewElement.readyState >= this.previewElement.HAVE_CURRENT_DATA) {
                    // Update canvas size if needed
                    if (this.frameCanvas.width !== this.previewElement.videoWidth) {
                        this.frameCanvas.width = this.previewElement.videoWidth;
                        this.frameCanvas.height = this.previewElement.videoHeight;
                    }

                    // Draw current video frame to canvas
                    this.frameCtx.drawImage(
                        this.previewElement,
                        0, 0,
                        this.frameCanvas.width,
                        this.frameCanvas.height
                    );

                    // Convert to JPEG with quality setting
                    const jpegData = this.frameCanvas.toDataURL('image/jpeg', this.options.quality);
                    const base64Data = jpegData.split(',')[1];
                    
                    if (this.validateFrame(base64Data)) {
                        this.frameCount++;
                        Logger.debug(`Screen frame #${this.frameCount} captured`);
                        this.onScreenData(base64Data);
                    }
                }
            } catch (error) {
                Logger.error('Screen frame capture error:', error);
            }
        }, frameInterval);

        Logger.info(`Screen capture started at ${this.options.fps} FPS`);
    }

    stop() {
        try {
            this.isRecording = false;
            
            if (this.captureInterval) {
                clearInterval(this.captureInterval);
                this.captureInterval = null;
            }

            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }

            if (this.previewElement) {
                this.previewElement.srcObject = null;
                this.previewElement = null;
            }

            Logger.info('Screen recording stopped');

        } catch (error) {
            Logger.error('Failed to stop screen recording:', error);
            throw new ApplicationError(
                'Failed to stop screen recording',
                ErrorCodes.SCREEN_STOP_FAILED,
                { originalError: error }
            );
        }
    }

    validateFrame(base64Data) {
        if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            Logger.error('Invalid screen frame base64 data');
            return false;
        }
        
        if (base64Data.length < 1024) {
            Logger.error('Screen frame too small');
            return false;
        }
        
        return true;
    }

    static checkBrowserSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new ApplicationError(
                'Screen sharing is not supported in this browser',
                ErrorCodes.SCREEN_NOT_SUPPORTED
            );
        }
        return true;
    }
} 