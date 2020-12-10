/**
 * Backoff that returns a number from an iterable.
 */
export class IterableBackoff {
    constructor(durations, index = 0) {
        this.durations = durations;
        this.index = index;
        if (index >= durations.length) {
            throw new RangeError(`IterableBackoff index ${0} >= number of durations (${durations.length})`);
        }
    }
    /**
     * @inheritdoc
     */
    duration() {
        return this.durations[this.index];
    }
    /**
     * @inheritdoc
     */
    next() {
        return this.index < this.durations.length - 1
            ? new IterableBackoff(this.durations, this.index + 1)
            : undefined;
    }
}
//# sourceMappingURL=IterableBackoff.js.map