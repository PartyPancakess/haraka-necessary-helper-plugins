/**
 * Backoff that delegates to a user-provided function. The function takes
 * the backoff context, and can optionally take (and return) a state value
 * that will be passed into subsequent backoff requests.
 */
export class DelegateBackoff {
    constructor(fn, state) {
        this.fn = fn;
        this.state = state;
        this.current = 0;
    }
    /**
     * @inheritdoc
     */
    duration() {
        return this.current;
    }
    /**
     * @inheritdoc
     */
    next(context) {
        const result = this.fn(context, this.state);
        if (result === undefined) {
            return undefined;
        }
        let b;
        if (typeof result === 'number') {
            b = new DelegateBackoff(this.fn, this.state);
            b.current = result;
        }
        else {
            b = new DelegateBackoff(this.fn, result.state);
            b.current = result.delay;
        }
        return b;
    }
}
//# sourceMappingURL=DelegateBackoff.js.map