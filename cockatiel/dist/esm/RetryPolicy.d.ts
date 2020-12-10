import { IBackoff, IExponentialBackoffOptions } from './backoff/Backoff';
import { DelegateBackoffFn } from './backoff/DelegateBackoff';
import { CancellationToken } from './CancellationToken';
import { ExecuteWrapper } from './common/Executor';
import { FailureReason, IDefaultPolicyContext, IPolicy } from './Policy';
/**
 * Context passed into the execute method of the builder.
 */
export interface IRetryContext extends IDefaultPolicyContext {
    /**
     * The retry attempt, starting at 1 for calls into backoffs.
     */
    attempt: number;
}
/**
 * Context passed into backoff delegated.
 */
export interface IRetryBackoffContext<R> extends IRetryContext {
    /**
     * The result of the last method call. Either a thrown error, or a value
     * that we determined should be retried upon.
     */
    result: FailureReason<R>;
}
export interface IRetryPolicyConfig {
    backoff?: IBackoff<IRetryBackoffContext<unknown>>;
    /**
     * Whether to unreference the internal timer. This means the policy will not
     * keep the Node.js even loop active. Defaults to `false`.
     */
    unref?: boolean;
}
export declare class RetryPolicy implements IPolicy<IRetryContext> {
    private options;
    private readonly executor;
    private readonly onGiveUpEmitter;
    private readonly onRetryEmitter;
    /**
     * @inheritdoc
     */
    readonly onSuccess: import("./common/Event").Event<import("./Policy").ISuccessEvent>;
    /**
     * @inheritdoc
     */
    readonly onFailure: import("./common/Event").Event<import("./Policy").IFailureEvent>;
    /**
     * Emitter that fires when we retry a call, before any backoff.
     *
     */
    readonly onRetry: import("./common/Event").Event<({
        error: Error;
    } & {
        delay: number;
    }) | ({
        value: unknown;
    } & {
        delay: number;
    })>;
    /**
     * @deprecated use `onFailure` instead
     */
    readonly onGiveUp: import("./common/Event").Event<FailureReason<unknown>>;
    constructor(options: Readonly<IRetryPolicyConfig>, executor: ExecuteWrapper);
    /**
     * Sets the number of retry attempts for the function.
     * @param count Retry attempts to make
     */
    attempts(count: number): RetryPolicy;
    /**
     * Sets the delay between retries. Can be a single duration, of a list of
     * durations. If it's a list, it will also determine the number of backoffs.
     */
    delay(amount: number | ReadonlyArray<number>): RetryPolicy;
    /**
     * Sets the baackoff to use for retries.
     */
    delegate<S>(backoff: DelegateBackoffFn<IRetryBackoffContext<unknown>, S>): RetryPolicy;
    /**
     * Uses an exponential backoff for retries.
     */
    exponential<S>(options?: Partial<IExponentialBackoffOptions<S>>): RetryPolicy;
    /**
     * Sets the baackoff to use for retries.
     */
    backoff(backoff: IBackoff<IRetryBackoffContext<unknown>>): RetryPolicy;
    /**
     * When retrying, a referenced timer is created. This means the Node.js event
     * loop is kept active while we're delaying a retried call. Calling this
     * method on the retry builder will unreference the timer, allowing the
     * process to exit even if a retry might still be pending.
     */
    dangerouslyUnref(): RetryPolicy;
    /**
     * Executes the given function with retries.
     * @param fn Function to run
     * @returns a Promise that resolves or rejects with the function results.
     */
    execute<T>(fn: (context: IRetryContext) => PromiseLike<T> | T, cancellationToken?: CancellationToken): Promise<T>;
    private composeBackoff;
    private derivePolicy;
}