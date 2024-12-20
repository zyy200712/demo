import { EventEmitter } from 'https://cdn.skypack.dev/eventemitter3';

export class Logger extends EventEmitter {
    static instance = null;
    static maxStoredLogs = 1000;
    static logs = [];

    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    static log(level, message, data = null) {
        const logger = Logger.getInstance();
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        // Store log
        Logger.logs.push(logEntry);
        if (Logger.logs.length > Logger.maxStoredLogs) {
            Logger.logs.shift();
        }

        // Console output
        switch (level) {
            case Logger.LEVELS.ERROR:
                console.error(logEntry);
                break;
            case Logger.LEVELS.WARN:
                console.warn(logEntry);
                break;
            case Logger.LEVELS.INFO:
                console.info(logEntry);
                break;
            default:
                console.log(logEntry);
        }

        // Emit event
        logger.emit('log', logEntry);
    }

    /**
     * Exports logs to JSON file
     */
    static export() {
        const blob = new Blob([JSON.stringify(Logger.logs, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    static LEVELS = {
        DEBUG: 'debug',
        INFO: 'info',
        WARN: 'warn',
        ERROR: 'error'
    };

    static debug(message, data) {
        this.log(this.LEVELS.DEBUG, message, data);
    }

    static info(message, data) {
        this.log(this.LEVELS.INFO, message, data);
    }

    static warn(message, data) {
        this.log(this.LEVELS.WARN, message, data);
    }

    static error(message, data) {
        this.log(this.LEVELS.ERROR, message, data);
    }
} 