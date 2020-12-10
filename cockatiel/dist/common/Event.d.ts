import { CancellationToken } from '../CancellationToken';
/**
 * Type that can be disposed.
 */
export interface IDisposable {
    dispose(): void;
}
export declare const noopDisposable: {
    dispose: () => undefined;
};
/**
 * Function that subscribes the method to receive data.
 */
export declare type Event<T> = (listener: (data: T) => void) => IDisposable;
export declare namespace Event {
    /**
     * Adds a handler that handles one event on the emitter.
     */
    const once: <T>(event: Event<T>, listener: (data: T) => void) => IDisposable;
    /**
     * Returns a promise that resolves when the event fires, or when cancellation
     * is requested, whichever happens first.
     */
    const toPromise: <T>(event: Event<T>, cancellation?: CancellationToken | undefined) => Promise<T>;
}
/**
 * Base event emitter. Calls listeners when data is emitted.
 */
export declare class EventEmitter<T> {
    protected readonly listeners: Set<(data: T) => void>;
    /**
     * Event<T> function.
     */
    readonly addListener: Event<T>;
    /**
     * Gets the number of event listeners.
     */
    get size(): number;
    /**
     * Emits event data.
     */
    emit(value: T): void;
    protected addListenerInner(listener: (data: T) => void): IDisposable;
}
/**
 * An event emitter that memorizes and instantly re-emits its last value
 * to attached listeners.
 */
export declare class MemorizingEventEmitter<T> extends EventEmitter<T> {
    /**
     * Last emitted value, wrapped in an object so that we can correctly detect
     * emission of 'undefined' values.
     */
    private lastValue?;
    /**
     * Gets whether this emitter has yet emitted any event.
     */
    get hasEmitted(): boolean;
    /**
     * @inheritdoc
     */
    readonly addListener: Event<T>;
    /**
     * @inheritdoc
     */
    emit(value: T): void;
}
