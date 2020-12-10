import { CancellationToken } from './CancellationToken';
export class FallbackPolicy {
    constructor(executor, value) {
        this.executor = executor;
        this.value = value;
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
    }
    /**
     * Executes the given function.
     * @param fn Function to execute.
     * @returns The function result or fallback value.
     */
    async execute(fn, cancellationToken = CancellationToken.None) {
        const result = await this.executor.invoke(fn, { cancellationToken });
        if ('success' in result) {
            return result.success;
        }
        return this.value();
    }
}
//# sourceMappingURL=FallbackPolicy.js.map