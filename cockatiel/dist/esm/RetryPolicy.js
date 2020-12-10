import { ExponentialBackoff } from './backoff/Backoff';
import { CompositeBackoff } from './backoff/CompositeBackoff';
import { ConstantBackoff } from './backoff/ConstantBackoff';
import { DelegateBackoff } from './backoff/DelegateBackoff';
import { IterableBackoff } from './backoff/IterableBackoff';
import { CancellationToken } from './CancellationToken';
import { EventEmitter } from './common/Event';
const delay = (duration, unref) => new Promise(resolve => {
    const timer = setTimeout(resolve, duration);
    if (unref) {
        timer.unref();
    }
});
export class RetryPolicy {
    constructor(options, executor) {
        this.options = options;
        this.executor = executor;
        this.onGiveUpEmitter = new EventEmitter();
        this.onRetryEmitter = new EventEmitter();
        /**
         * @inheritdoc
         */
        // tslint:disable-next-line: member-ordering
        this.onSuccess = this.executor.onSuccess;
        /**
         * @inheritdoc
         */
        // tslint:disable-next-line: member-ordering
        this.onFailure = this.executor.onFailure;
        /**
         * Emitter that fires when we retry a call, before any backoff.
         *
         */
        // tslint:disable-next-line: member-ordering
        this.onRetry = this.onRetryEmitter.addListener;
        /**
         * @deprecated use `onFailure` instead
         */
        // tslint:disable-next-line: member-ordering
        this.onGiveUp = this.onGiveUpEmitter.addListener;
    }
    /**
     * Sets the number of retry attempts for the function.
     * @param count Retry attempts to make
     */
    attempts(count) {
        return this.composeBackoff('a', new ConstantBackoff(1, count));
    }
    /**
     * Sets the delay between retries. Can be a single duration, of a list of
     * durations. If it's a list, it will also determine the number of backoffs.
     */
    delay(amount) {
        return this.composeBackoff('b', typeof amount === 'number' ? new ConstantBackoff(amount) : new IterableBackoff(amount));
    }
    /**
     * Sets the baackoff to use for retries.
     */
    delegate(backoff) {
        return this.composeBackoff('b', new DelegateBackoff(backoff));
    }
    /**
     * Uses an exponential backoff for retries.
     */
    exponential(options = {}) {
        return this.composeBackoff('b', new ExponentialBackoff(options));
    }
    /**
     * Sets the baackoff to use for retries.
     */
    backoff(backoff) {
        return this.composeBackoff('b', backoff);
    }
    /**
     * When retrying, a referenced timer is created. This means the Node.js event
     * loop is kept active while we're delaying a retried call. Calling this
     * method on the retry builder will unreference the timer, allowing the
     * process to exit even if a retry might still be pending.
     */
    dangerouslyUnref() {
        return this.derivePolicy({ ...this.options, unref: true });
    }
    /**
     * Executes the given function with retries.
     * @param fn Function to run
     * @returns a Promise that resolves or rejects with the function results.
     */
    async execute(fn, cancellationToken = CancellationToken.None) {
        let backoff = this.options.backoff || new ConstantBackoff(0, 1);
        for (let retries = 0;; retries++) {
            const result = await this.executor.invoke(fn, { attempt: retries, cancellationToken });
            if ('success' in result) {
                return result.success;
            }
            if (backoff && !cancellationToken.isCancellationRequested) {
                const delayDuration = backoff.duration();
                const delayPromise = delay(delayDuration, !!this.options.unref);
                // A little sneaky reordering here lets us use Sinon's fake timers
                // when we get an emission in our tests.
                this.onRetryEmitter.emit({ ...result, delay: delayDuration });
                await delayPromise;
                backoff = backoff.next({ attempt: retries + 1, cancellationToken, result });
                continue;
            }
            this.onGiveUpEmitter.emit(result);
            if ('error' in result) {
                throw result.error;
            }
            return result.value;
        }
    }
    composeBackoff(bias, backoff) {
        if (this.options.backoff) {
            backoff = new CompositeBackoff(bias, this.options.backoff, backoff);
        }
        return this.derivePolicy({ ...this.options, backoff });
    }
    derivePolicy(newOptions) {
        const p = new RetryPolicy(newOptions, this.executor.derive());
        p.onRetry(evt => this.onRetryEmitter.emit(evt));
        return p;
    }
}
//# sourceMappingURL=RetryPolicy.js.map