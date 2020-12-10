import { IBackoff } from './Backoff';
export declare type DelegateBackoffFn<T, S = void> = (context: T, state?: S) => {
    delay: number;
    state: S;
} | number | undefined;
/**
 * Backoff that delegates to a user-provided function. The function takes
 * the backoff context, and can optionally take (and return) a state value
 * that will be passed into subsequent backoff requests.
 */
export declare class DelegateBackoff<T, S = void> implements IBackoff<T> {
    private readonly fn;
    private readonly state?;
    private current;
    constructor(fn: DelegateBackoffFn<T, S>, state?: S | undefined);
    /**
     * @inheritdoc
     */
    duration(): number;
    /**
     * @inheritdoc
     */
    next(context: T): DelegateBackoff<T, S> | undefined;
}
