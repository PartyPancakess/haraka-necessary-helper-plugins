"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Backoff_test_1 = require("./Backoff.test");
const IterableBackoff_1 = require("./IterableBackoff");
describe('IterableBackoff', () => {
    it('works', () => {
        const b = new IterableBackoff_1.IterableBackoff([3, 6, 9]);
        Backoff_test_1.expectDurations(b, [3, 6, 9, undefined]);
    });
    it('throws a range error if empty', () => {
        chai_1.expect(() => new IterableBackoff_1.IterableBackoff([])).to.throw(RangeError);
    });
});
//# sourceMappingURL=IterableBackoff.test.js.map