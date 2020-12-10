"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Backoff_test_1 = require("./Backoff.test");
const DelegateBackoff_1 = require("./DelegateBackoff");
describe('DelegateBackoff', () => {
    it('passes through the context and sets next delay', () => {
        const b = new DelegateBackoff_1.DelegateBackoff(v => v * 2);
        chai_1.expect(b.next(4).duration()).to.equal(8);
    });
    it('halts delegate function returns undefined', () => {
        const b = new DelegateBackoff_1.DelegateBackoff(() => undefined);
        chai_1.expect(b.next(0)).to.be.undefined;
    });
    it('captures and sets delegate state', () => {
        const b = new DelegateBackoff_1.DelegateBackoff((_, state = 3) => {
            const n = state * state;
            return { delay: n, state: n };
        });
        Backoff_test_1.expectDurations(b, [0, 9, 81, 6561]);
    });
});
//# sourceMappingURL=DelegateBackoff.test.js.map