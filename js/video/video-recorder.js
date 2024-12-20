import { Logger } from '../utils/logger.js';
import { ApplicationError, ErrorCodes } from '../utils/error-boundary.js';

export class VideoRecorder {
    constructor(options = {}) {
        this.stream = null;
        this.previewElement = null;
        this.isRecording = false;
        this.onVideoData = null;
        this.frameCanvas = document.createElement('canvas');
        this.frameCtx = this.frameCanvas.getContext('2d');
        this.captureInterval = null;
        this.options = {
            fps: 15, // Reduced default FPS
            quality: 0.7,
            width: 640,
            height: 480,
            maxFrameSize: 100 * 1024, // 100KB max per frame
            ...options
        };
        this.frameCount = 0; // Add frame counter for debugging
    }

    async start(previewElement, onVideoData) {
        try {
            this.previewElement = previewElement;
            this.onVideoData = onVideoData;

            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: this.options.width },
                    height: { ideal: this.options.height }
                }
            });

            // Set up preview
            this.previewElement.srcObject = this.stream;
            await this.previewElement.play();

            // Set up canvas
            this.frameCanvas.width = this.options.width;
            this.frameCanvas.height = this.options.height;

            // Start frame capture loop
            this.isRecording = true;
            this.startFrameCapture();
            
            Logger.info('Video recording started');

        } catch (error) {
            Logger.error('Failed to start video recording:', error);
            throw new ApplicationError(
                'Failed to start video recording',
                ErrorCodes.VIDEO_START_FAILED,
                { originalError: error }
            );
        }
    }

    startFrameCapture() {
        const frameInterval = 1000 / this.options.fps;
        
        this.captureInterval = setInterval(() => {
            if (this.isRecording && this.onVideoData) {
                try {
                    // Draw current video frame to canvas
                    this.frameCtx.drawImage(
                        this.previewElement,
                        0, 0,
                        this.frameCanvas.width,
                        this.frameCanvas.height
                    );

                    // Convert to JPEG
                    const jpegData = this.frameCanvas.toDataURL('image/jpeg', this.options.quality);
                    // Remove data URL prefix
                    const base64Data = jpegData.split(',')[1];
                    
                    if (!this.validateFrame(base64Data)) {
                        return;
                    }

                    this.frameCount++;
                    const size = Math.round(base64Data.length / 1024);
                    Logger.debug(`Frame #${this.frameCount} captured (${size}KB)`);
                    
                    if (!base64Data) {
                        Logger.error('Empty frame data');
                        return;
                    }

                    this.onVideoData(base64Data);
                } catch (error) {
                    Logger.error('Frame capture error:', error);
                }
            }
        }, frameInterval);

        Logger.info(`Video capture started at ${this.options.fps} FPS`);
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
            }

            if (this.previewElement) {
                this.previewElement.srcObject = null;
            }

            this.stream = null;
            Logger.info('Video recording stopped');

        } catch (error) {
            Logger.error('Failed to stop video recording:', error);
            throw new ApplicationError(
                'Failed to stop video recording',
                ErrorCodes.VIDEO_STOP_FAILED,
                { originalError: error }
            );
        }
    }

    static checkBrowserSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new ApplicationError(
                'Video recording is not supported in this browser',
                ErrorCodes.VIDEO_NOT_SUPPORTED
            );
        }
        return true;
    }

    validateFrame(base64Data) {
        // Check if it's a valid base64 string
        if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            Logger.error('Invalid base64 data');
            return false;
        }
        
        // Check minimum size (1KB)
        if (base64Data.length < 1024) {
            Logger.error('Frame too small');
            return false;
        }
        
        return true;
    }

    async optimizeFrameQuality(base64Data) {
        let quality = this.options.quality;
        let currentSize = base64Data.length;
        
        while (currentSize > this.options.maxFrameSize && quality > 0.3) {
            quality -= 0.1;
            const jpegData = this.frameCanvas.toDataURL('image/jpeg', quality);
            base64Data = jpegData.split(',')[1];
            currentSize = base64Data.length;
        }
        
        return base64Data;
    }
} 