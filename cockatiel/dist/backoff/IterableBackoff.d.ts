import { IBackoff } from './Backoff';
/**
 * Backoff that returns a number from an iterable.
 */
export declare class IterableBackoff implements IBackoff<void> {
    private readonly durations;
    private readonly index;
    constructor(durations: ReadonlyArray<number>, index?: number);
    /**
     * @inheritdoc
     */
    duration(): number;
    /**
     * @inheritdoc
     */
    next(): IterableBackoff | undefined;
}
