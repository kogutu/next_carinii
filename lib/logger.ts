// lib/logger.js

class Logger {
    constructor() {
        this.timers = new Map();
    }

    // Formatowanie czasu
    getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    getFullTimestamp() {
        const now = new Date();
        return now.toLocaleString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // Podstawowe logowanie z ramką
    log(message, data = null, type = 'INFO') {
        const timestamp = this.getTimestamp();
        const border = this.getBorder(type);

        console.log(`${border} START ${timestamp} ${border}`);

        if (typeof message === 'string') {
            console.log(`📌 ${message}`);
        } else {
            console.log('📌 Message:', message);
        }

        if (data) {
            console.log('📦 Data:', data);
        }

        console.log(`${border} END ${timestamp} ${border}\n`);
    }

    // Logowanie sukcesu
    success(message: string, data: any = null) {
        const timestamp = this.getTimestamp();
        console.log(`✅ SUCCESS ${'='.repeat(30)}`);
        console.log(`✅ ${message}`);
        if (data) {
            console.log('✅ Data:', data);
        }
        console.log(`${'='.repeat(40)}\n`);
    }

    // Logowanie błędu
    error(message, error = null) {
        const timestamp = this.getTimestamp();
        console.error(`❌ ERROR ${timestamp} ${'⚠'.repeat(10)}`);
        console.error(`❌ ${message}`);
        if (error) {
            if (error instanceof Error) {
                console.error('❌ Message:', error.message);
                console.error('❌ Stack:', error.stack);
            } else {
                console.error('❌ Details:', error);
            }
        }
        console.error(`${'⚠'.repeat(25)}\n`);
    }

    // Logowanie ostrzeżenia
    warn(message, data = null) {
        const timestamp = this.getTimestamp();
        console.warn(`⚠️ WARNING ${timestamp} ${'-'.repeat(15)}`);
        console.warn(`⚠️ ${message}`);
        if (data) {
            console.warn('⚠️ Data:', data);
        }
        console.warn(`${'-'.repeat(35)}\n`);
    }

    // Logowanie z różnymi stylami ramek
    logWithStyle(message, data = null, style = 'default') {
        const timestamp = this.getTimestamp();
        const styles = {
            default: { start: '//', end: '//', char: '/' },
            stars: { start: '**', end: '**', char: '*' },
            hash: { start: '##', end: '##', char: '#' },
            dash: { start: '--', end: '--', char: '-' },
            equal: { start: '==', end: '==', char: '=' }
        };

        const selected = styles[style] || styles.default;
        const border = selected.char.repeat(30);

        console.log(`${selected.start}${border} ${timestamp} ${border}${selected.end}`);
        console.log(message);
        if (data) {
            console.log('Data:', data);
        }
        console.log(`${selected.start}${border} ${timestamp} ${border}${selected.end}\n`);
    }

    // Logowanie grupowe
    group(label, callback) {
        console.log(`📁 GROUP: ${label} ${'='.repeat(30)}`);
        console.time(`⏱️ ${label}`);

        if (callback) {
            callback(this);
        }

        console.timeEnd(`⏱️ ${label}`);
        console.log(`${'='.repeat(40)}\n`);
    }

    // Timer start
    time(label) {
        this.timers.set(label, Date.now());
        console.log(`⏱️ TIMER START: ${label} at ${this.getTimestamp()}`);
    }

    // Timer end
    timeEnd(label) {
        const start = this.timers.get(label);
        if (start) {
            const duration = Date.now() - start;
            console.log(`⏱️ TIMER END: ${label} - ${duration}ms`);
            this.timers.delete(label);
        } else {
            this.warn(`Timer "${label}" nie istnieje`);
        }
    }

    // Logowanie z dekoracją
    decorated(message, data = null, decorator = '✨') {
        const timestamp = this.getTimestamp();
        const line = decorator.repeat(25);

        console.log(`\n${line} ${timestamp} ${line}`);
        console.log(`${decorator} ${message}`);
        if (data) {
            console.log(`${decorator} Data:`, data);
        }
        console.log(`${line}${decorator.repeat(10)}\n`);
    }

    // Logowanie dla API routes
    api(req, res, next) {
        const timestamp = this.getFullTimestamp();
        const method = req.method;
        const url = req.url;

        console.log(`🌐 API ${'='.repeat(35)}`);
        console.log(`📅 Time: ${timestamp}`);
        console.log(`🔧 Method: ${method}`);
        console.log(`📍 URL: ${url}`);
        console.log(`📦 Body:`, req.body || '{}');
        console.log(`${'='.repeat(45)}\n`);

        // Zapisz oryginalną metodę res.json
        const originalJson = res.json;
        res.json = function (data) {
            console.log(`📤 Response for ${method} ${url}:`, data);
            return originalJson.call(this, data);
        };

        next();
    }

    // Helper do wyboru stylu
    getBorder(type) {
        const borders = {
            'INFO': '//',
            'DEBUG': '**',
            'WARN': '##',
            'ERROR': '!!'
        };
        return (borders[type] || '//').repeat(20);
    }

    // Logowanie z emoji
    emoji(message, emoji = '📝', data = null) {
        console.log(`\n${emoji.repeat(5)} ${this.getTimestamp()} ${emoji.repeat(5)}`);
        console.log(`${emoji} ${message}`);
        if (data) {
            console.log(`${emoji} Data:`, data);
        }
        console.log(`${emoji.repeat(15)}\n`);
    }
}

// Eksportuj instancję loggera
const logger = new Logger();
export default logger;

// Eksportuj również klasę, jeśli ktoś chce stworzyć własną instancję
export { Logger };