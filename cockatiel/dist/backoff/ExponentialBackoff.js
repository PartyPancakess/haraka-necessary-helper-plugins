"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExponentialBackoffGenerators_1 = require("./ExponentialBackoffGenerators");
const defaultOptions = {
    generator: ExponentialBackoffGenerators_1.decorrelatedJitterGenerator,
    maxDelay: 30000,
    maxAttempts: Infinity,
    exponent: 2,
    initialDelay: 128,
};
/**
 * An implementation of exponential backoff.
 */
class ExponentialBackoff {
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
exports.ExponentialBackoff = ExponentialBackoff;
//# sourceMappingURL=ExponentialBackoff.js.map