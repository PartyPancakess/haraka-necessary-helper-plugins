import { IBackoffStrategy } from './backoff';
/**
 * IExponentialOptions are passed into the ExponentialBackoff constructor. The
 * backoff equation is, in general, min(max, initial ^ n), where `n` is
 * an incremented backoff factor. The result of the equation is a delay
 * given in milliseconds.
 */
export interface IExponentialOptions {
    /**
     * The initial delay passed to the equation.
     */
    initial: number;
    /**
     * Random factor to subtract from the `n` count.
     */
    random: number;
    /**
     * max is the maximum value of the delay.
     */
    max: number;
}
/**
 * ExponentialBackoff implements a random exponential backoff strategy.
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 */
export declare class ExponentialBackoff implements IBackoffStrategy {
    protected options: IExponentialOptions;
    private counter;
    constructor(options: IExponentialOptions);
    /**
     * @inheritDoc
     */
    getDelay(): number;
    /**
     * @inheritDoc
     */
    next(): IBackoffStrategy;
    /**
     * @inheritDoc
     */
    reset(): IBackoffStrategy;
}
