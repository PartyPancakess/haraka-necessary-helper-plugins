import { IBackoff } from './Backoff';
export declare type CompositeBias = 'a' | 'b' | 'max' | 'min';
/**
 * A backoff that combines two other backoffs. The delay will be the "bias"
 * (max or min) of the two other backoffs, and next() will return as along as
 * both backoffs continue to have next values as well.
 */
export declare class CompositeBackoff<T> implements IBackoff<T> {
    private readonly bias;
    private readonly backoffA;
    private readonly backoffB;
    constructor(bias: CompositeBias, backoffA: IBackoff<T>, backoffB: IBackoff<T>);
    /**
     * @inheritdoc
     */
    duration(): number;
    /**
     * @inheritdoc
     */
    next(context: T): CompositeBackoff<T> | undefined;
}
