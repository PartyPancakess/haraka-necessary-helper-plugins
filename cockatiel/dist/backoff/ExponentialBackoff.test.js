"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Backoff_test_1 = require("./Backoff.test");
const ExponentialBackoff_1 = require("./ExponentialBackoff");
const ExponentialBackoffGenerators_1 = require("./ExponentialBackoffGenerators");
describe('ExponentialBackoff', () => {
    it('works', () => {
        const b = new ExponentialBackoff_1.ExponentialBackoff({ generator: ExponentialBackoffGenerators_1.noJitterGenerator });
        Backoff_test_1.expectDurations(b, [0, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 30000, 30000]);
    });
    it('sets max retries correctly', () => {
        const b = new ExponentialBackoff_1.ExponentialBackoff({ generator: ExponentialBackoffGenerators_1.noJitterGenerator, maxAttempts: 4 });
        Backoff_test_1.expectDurations(b, [0, 128, 256, 512, undefined]);
    });
});
//# sourceMappingURL=ExponentialBackoff.test.js.map