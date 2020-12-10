"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const util_1 = require("util");
const Breaker_1 = require("./breaker/Breaker");
const CancellationToken_1 = require("./CancellationToken");
const CircuitBreakerPolicy_1 = require("./CircuitBreakerPolicy");
const Errors_1 = require("./errors/Errors");
const IsolatedCircuitError_1 = require("./errors/IsolatedCircuitError");
const Policy_1 = require("./Policy");
class MyException extends Error {
}
const delay = util_1.promisify(setTimeout);
describe('CircuitBreakerPolicy', () => {
    let p;
    let clock;
    let onBreak;
    let onReset;
    let onHalfOpen;
    beforeEach(() => {
        p = Policy_1.Policy.handleType(MyException).circuitBreaker(1000, new Breaker_1.ConsecutiveBreaker(2));
        clock = sinon_1.useFakeTimers();
        onBreak = sinon_1.stub();
        onReset = sinon_1.stub();
        onHalfOpen = sinon_1.stub();
        p.onBreak(onBreak);
        p.onReset(onReset);
        p.onHalfOpen(onHalfOpen);
    });
    afterEach(() => {
        clock.restore();
    });
    const openBreaker = async () => {
        const s = sinon_1.stub().throws(new MyException());
        await chai_1.expect(p.execute(s)).to.be.rejectedWith(MyException);
        await chai_1.expect(p.execute(s)).to.be.rejectedWith(MyException);
    };
    it('allows calls when open', async () => {
        chai_1.expect(await p.execute(() => 42)).to.equal(42);
    });
    it('opens after failing calls', async () => {
        const s = sinon_1.stub().throws(new MyException());
        await chai_1.expect(p.execute(s)).to.be.rejectedWith(MyException);
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Closed);
        chai_1.expect(onBreak).not.called;
        await chai_1.expect(p.execute(s)).to.be.rejectedWith(MyException);
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Open);
        chai_1.expect(onBreak).called;
        await chai_1.expect(p.execute(s)).to.be.rejectedWith(Errors_1.BrokenCircuitError);
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Open);
        chai_1.expect(p.lastFailure.error).to.be.an.instanceOf(MyException);
        chai_1.expect(onBreak).calledOnce;
        chai_1.expect(s).calledTwice;
    });
    it('closes if the half open test succeeds', async () => {
        await openBreaker();
        clock.tick(1000);
        const result = p.execute(sinon_1.stub().resolves(42));
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.HalfOpen);
        chai_1.expect(onHalfOpen).calledOnce;
        chai_1.expect(await result).to.equal(42);
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Closed);
        chai_1.expect(onReset).calledOnce;
    });
    it('dedupes half-open tests', async () => {
        await openBreaker();
        clock.tick(1000);
        // Two functinos, a and b. We execute with "a" first, and then make sure
        // it returns before "b" gets called.
        let aReturned = false;
        const a = async () => {
            await delay(10);
            aReturned = true;
            return 1;
        };
        const b = async () => {
            chai_1.expect(aReturned).to.be.true;
            return 2;
        };
        const todo = [
            chai_1.expect(p.execute(a)).to.eventually.equal(1),
            chai_1.expect(p.execute(b)).to.eventually.equal(2),
        ];
        clock.tick(10);
        await Promise.all(todo);
    });
    it('stops deduped half-open tests if the circuit reopens', async () => {
        await openBreaker();
        clock.tick(1000);
        // Two functinos, a and b. We execute with "a" first, and then make sure
        // it returns before "b" gets called.
        const a = async () => {
            await delay(10);
            throw new MyException();
        };
        const b = async () => {
            throw new Error('expected to not be called');
        };
        const todo = [
            chai_1.expect(p.execute(a)).to.be.rejectedWith(MyException),
            chai_1.expect(p.execute(b)).to.be.rejectedWith(Errors_1.BrokenCircuitError),
        ];
        clock.tick(10);
        await Promise.all(todo);
    });
    it('re-opens if the half open fails', async () => {
        await openBreaker();
        clock.tick(1000);
        const s = sinon_1.stub().throws(new MyException());
        await chai_1.expect(p.execute(s)).to.be.rejectedWith(MyException);
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Open);
    });
    it('handles isolation correctly', async () => {
        p.onBreak(onBreak);
        p.onReset(onReset);
        const handle1 = p.isolate();
        chai_1.expect(onBreak).calledOnceWith({ isolated: true });
        const handle2 = p.isolate();
        chai_1.expect(onBreak).calledOnce;
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Isolated);
        await chai_1.expect(p.execute(() => 42)).to.be.rejectedWith(IsolatedCircuitError_1.IsolatedCircuitError);
        handle1.dispose();
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Isolated);
        chai_1.expect(onReset).not.called;
        handle2.dispose();
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Closed);
        chai_1.expect(onReset).calledOnce;
        chai_1.expect(await p.execute(() => 42)).to.equal(42);
    });
    it('links parent cancellation token', async () => {
        const parent = new CancellationToken_1.CancellationTokenSource();
        await Policy_1.Policy.handleAll()
            .circuitBreaker(1000, new Breaker_1.ConsecutiveBreaker(3))
            .execute(({ cancellationToken }) => {
            chai_1.expect(cancellationToken.isCancellationRequested).to.be.false;
            parent.cancel();
            chai_1.expect(cancellationToken.isCancellationRequested).to.be.true;
        }, parent.token);
    });
    it('aborts function execution if half open test succeeds', async () => {
        await openBreaker();
        clock.tick(1000);
        // half open test:
        p.execute(sinon_1.stub().resolves(42));
        // queued timeout:
        await chai_1.expect(p.execute(sinon_1.stub(), CancellationToken_1.CancellationToken.Cancelled)).to.be.rejectedWith(Errors_1.TaskCancelledError);
        chai_1.expect(p.state).to.equal(CircuitBreakerPolicy_1.CircuitState.Closed);
        chai_1.expect(onReset).calledOnce;
    });
});
//# sourceMappingURL=CircuitBreakerPolicy.test.js.map