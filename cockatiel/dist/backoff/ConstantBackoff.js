"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Backoff that returns a constant interval.
 */
class ConstantBackoff {
    constructor(interval, limit) {
        this.interval = interval;
        this.limit = limit;
        this.index = 0;
    }
    /**
     * @inheritdoc
     */
    duration() {
        return this.interval;
    }
    /**
     * @inheritdoc
     */
    next() {
        if (this.limit === undefined) {
            return this;
        }
        if (this.index >= this.limit - 1) {
            return undefined;
        }
        const b = new ConstantBackoff(this.interval, this.limit);
        b.index = this.index + 1;
        return b;
    }
}
exports.ConstantBackoff = ConstantBackoff;
/**
 * Backoff that never retries.
 */
exports.NeverRetryBackoff = new ConstantBackoff(0, 0);
//# sourceMappingURL=ConstantBackoff.js.map