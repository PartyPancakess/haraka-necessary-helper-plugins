"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Backoff_test_1 = require("./Backoff.test");
const CompositeBackoff_1 = require("./CompositeBackoff");
const ConstantBackoff_1 = require("./ConstantBackoff");
describe('CompositeBackoff', () => {
    const withBias = (bias) => new CompositeBackoff_1.CompositeBackoff(bias, new ConstantBackoff_1.ConstantBackoff(10, 4), new ConstantBackoff_1.ConstantBackoff(20, 2));
    it('biases correctly', () => {
        chai_1.expect(withBias('a').duration()).to.equal(10);
        chai_1.expect(withBias('b').duration()).to.equal(20);
        chai_1.expect(withBias('min').duration()).to.equal(10);
        chai_1.expect(withBias('max').duration()).to.equal(20);
    });
    it('limits the number of retries', () => {
        Backoff_test_1.expectDurations(withBias('max'), [20, 20, undefined]);
    });
});
//# sourceMappingURL=CompositeBackoff.test.js.map