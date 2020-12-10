"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A backoff that combines two other backoffs. The delay will be the "bias"
 * (max or min) of the two other backoffs, and next() will return as along as
 * both backoffs continue to have next values as well.
 */
class CompositeBackoff {
    constructor(bias, backoffA, backoffB) {
        this.bias = bias;
        this.backoffA = backoffA;
        this.backoffB = backoffB;
    }
    /**
     * @inheritdoc
     */
    duration() {
        switch (this.bias) {
            case 'a':
                return this.backoffA.duration();
            case 'b':
                return this.backoffB.duration();
            case 'max':
                return Math.max(this.backoffB.duration(), this.backoffA.duration());
            case 'min':
                return Math.min(this.backoffB.duration(), this.backoffA.duration());
            default:
                throw new Error(`Unknown bias "${this.bias}" given to CompositeBackoff`);
        }
    }
    /**
     * @inheritdoc
     */
    next(context) {
        const nextA = this.backoffA.next(context);
        const nextB = this.backoffB.next(context);
        return nextA && nextB && new CompositeBackoff(this.bias, nextA, nextB);
    }
}
exports.CompositeBackoff = CompositeBackoff;
//# sourceMappingURL=CompositeBackoff.js.map