/**
 * @class AudioProcessingWorklet
 * @extends AudioWorkletProcessor
 * @description Processes incoming audio data, converting it from Float32 to Int16 format and packaging it into chunks.
 */
class AudioProcessingWorklet extends AudioWorkletProcessor {
    /**
     * @constructor
     * @description Initializes the buffer for audio processing.
     */
    constructor(options) {
        super();
        const processorOptions = options.processorOptions || {};
        this.targetSampleRate = processorOptions.targetSampleRate || 16000;
        this.originalSampleRate = processorOptions.originalSampleRate || sampleRate;
        this.buffer = new Int16Array(2048);
        this.bufferWriteIndex = 0;
        this.resampleRatio = this.targetSampleRate / this.originalSampleRate;
        this.lastIndex = 0;
        this.resampleBuffer = new Float32Array(2048);
        this.resampleBufferIndex = 0;
    }

    /**
     * @method linearResample
     * @description Performs linear resampling on the input data
     * @param {Float32Array} inputData - The input audio data
     * @returns {Float32Array} Resampled audio data
     */
    linearResample(inputData) {
        const inputLength = inputData.length;
        const outputLength = Math.floor(inputLength * this.resampleRatio);
        const output = new Float32Array(outputLength);
        
        for (let i = 0; i < outputLength; i++) {
            const position = i / this.resampleRatio;
            const index = Math.floor(position);
            const fraction = position - index;
            
            if (index >= inputLength - 1) {
                output[i] = inputData[inputLength - 1];
            } else {
                output[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
            }
        }
        
        return output;
    }

    /**
     * @method process
     * @description Processes the audio input data.
     * @param {Float32Array[][]} inputs - The input audio data.
     * @returns {boolean} True to keep the worklet alive.
     */
    process(inputs) {
        if (inputs[0].length) {
            const channel0 = inputs[0][0];
            // Resample the audio data
            const resampledData = this.linearResample(channel0);
            this.processChunk(resampledData);
        }
        return true;
    }

    /**
     * @method sendAndClearBuffer
     * @description Sends the current buffer content as a message and resets the buffer.
     */
    sendAndClearBuffer() {
        this.port.postMessage({
            event: 'chunk',
            data: {
                int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
            },
        });
        this.bufferWriteIndex = 0;
    }

    /**
     * @method processChunk
     * @description Processes a chunk of audio data, converting it to Int16 format.
     * @param {Float32Array} float32Array - The audio data chunk to process.
     */
    processChunk(float32Array) {
        try {
            const l = float32Array.length;

            for (let i = 0; i < l; i++) {
                const int16Value = Math.max(-32768, Math.min(32767, Math.floor(float32Array[i] * 32768)));
                this.buffer[this.bufferWriteIndex++] = int16Value;
                if (this.bufferWriteIndex >= this.buffer.length) {
                    this.sendAndClearBuffer();
                }
            }

            if (this.bufferWriteIndex >= this.buffer.length) {
                this.sendAndClearBuffer();
            }
        } catch (error) {
            this.port.postMessage({
                event: 'error',
                error: {
                    message: error.message,
                    stack: error.stack
                }
            });
        }
    }
}

registerProcessor('audio-recorder-worklet', AudioProcessingWorklet); 