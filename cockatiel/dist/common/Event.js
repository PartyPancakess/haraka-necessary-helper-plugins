"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TaskCancelledError_1 = require("../errors/TaskCancelledError");
exports.noopDisposable = { dispose: () => undefined };
// tslint:disable-next-line: no-namespace
var Event;
(function (Event) {
    /**
     * Adds a handler that handles one event on the emitter.
     */
    Event.once = (event, listener) => {
        let syncDispose = false;
        let disposable;
        disposable = event(value => {
            listener(value);
            if (disposable) {
                disposable.dispose();
            }
            else {
                syncDispose = true; // callback can fire before disposable is returned
            }
        });
        if (syncDispose) {
            disposable.dispose();
            return exports.noopDisposable; // no reason to keep the ref around
        }
        return disposable;
    };
    /**
     * Returns a promise that resolves when the event fires, or when cancellation
     * is requested, whichever happens first.
     */
    Event.toPromise = (event, cancellation) => {
        if (!cancellation) {
            return new Promise(resolve => Event.once(event, resolve));
        }
        if (cancellation.isCancellationRequested) {
            return Promise.reject(new TaskCancelledError_1.TaskCancelledError());
        }
        return new Promise((resolve, reject) => {
            const d2 = Event.once(event, data => {
                d1.dispose();
                resolve(data);
            });
            const d1 = Event.once(cancellation.onCancellationRequested, () => {
                d2.dispose();
                reject(new TaskCancelledError_1.TaskCancelledError());
            });
        });
    };
})(Event = exports.Event || (exports.Event = {}));
/**
 * Base event emitter. Calls listeners when data is emitted.
 */
class EventEmitter {
    constructor() {
        this.listeners = new Set();
        /**
         * Event<T> function.
         */
        this.addListener = listener => this.addListenerInner(listener);
    }
    /**
     * Gets the number of event listeners.
     */
    get size() {
        return this.listeners.size;
    }
    /**
     * Emits event data.
     */
    emit(value) {
        for (const listener of this.listeners) {
            listener(value);
        }
    }
    addListenerInner(listener) {
        this.listeners.add(listener);
        return { dispose: () => this.listeners.delete(listener) };
    }
}
exports.EventEmitter = EventEmitter;
/**
 * An event emitter that memorizes and instantly re-emits its last value
 * to attached listeners.
 */
class MemorizingEventEmitter extends EventEmitter {
    constructor() {
        super(...arguments);
        /**
         * @inheritdoc
         */
        this.addListener = listener => {
            const disposable = this.addListenerInner(listener);
            if (this.lastValue) {
                listener(this.lastValue.value);
            }
            return disposable;
        };
    }
    /**
     * Gets whether this emitter has yet emitted any event.
     */
    get hasEmitted() {
        return !!this.lastValue;
    }
    /**
     * @inheritdoc
     */
    emit(value) {
        this.lastValue = { value };
        for (const listener of this.listeners) {
            listener(value);
        }
    }
}
exports.MemorizingEventEmitter = MemorizingEventEmitter;
//# sourceMappingURL=Event.js.map