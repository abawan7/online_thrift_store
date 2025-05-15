class EventEmitter {
    constructor() {
        this.events = {};
    }

    addListener(eventType, listener) {
        if (!this.events[eventType]) {
            this.events[eventType] = [];
        }
        this.events[eventType].push(listener);
        return {
            remove: () => {
                this.events[eventType] = this.events[eventType].filter(l => l !== listener);
            }
        };
    }

    emit(eventType, ...args) {
        if (this.events[eventType]) {
            this.events[eventType].forEach(listener => listener(...args));
        }
    }
}

// Create a singleton instance
const eventEmitter = new EventEmitter();
export default eventEmitter; 