import { decorrelatedJitterGenerator } from './ExponentialBackoffGenerators';
const defaultOptions = {
    generator: decorrelatedJitterGenerator,
    maxDelay: 30000,
    maxAttempts: Infinity,
    exponent: 2,
    initialDelay: 128,
};
/**
 * An implementation of exponential backoff.
 */
export class ExponentialBackoff {
    constructor(options) {
        this.attempt = 0;
        this.delay = 0;
        this.options = options ? { ...defaultOptions, ...options } : defaultOptions;
    }
    /**
     * @inheritdoc
     */
    duration() {
        return this.delay;
    }
    next() {
        if (this.attempt >= this.options.maxAttempts - 1) {
            return undefined;
        }
        const e = new ExponentialBackoff(this.options);
        [e.delay, e.state] = this.options.generator(this.state, this.options);
        e.attempt = this.attempt + 1;
        return e;
    }
}
//# sourceMappingURL=ExponentialBackoff.js.map