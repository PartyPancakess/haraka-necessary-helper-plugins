import { IBackoff } from './Backoff';
/**
 * Backoff that returns a constant interval.
 */
export declare class ConstantBackoff implements IBackoff<void> {
    private readonly interval;
    private readonly limit?;
    private index;
    constructor(interval: number, limit?: number | undefined);
    /**
     * @inheritdoc
     */
    duration(): number;
    /**
     * @inheritdoc
     */
    next(): ConstantBackoff | undefined;
}
/**
 * Backoff that never retries.
 */
export declare const NeverRetryBackoff: ConstantBackoff;
