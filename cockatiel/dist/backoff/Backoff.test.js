"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
exports.expectDurations = (backoff, expected, context) => {
    const actual = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < expected.length; i++) {
        if (!backoff) {
            actual.push(undefined);
            continue;
        }
        actual.push(backoff.duration());
        backoff = backoff.next(context);
    }
    chai_1.expect(actual).to.deep.equal(expected);
};
//# sourceMappingURL=Backoff.test.js.map