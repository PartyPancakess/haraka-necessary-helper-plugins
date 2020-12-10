"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const Backoff_1 = require("./backoff/Backoff");
const CancellationToken_1 = require("./CancellationToken");
const util_test_1 = require("./common/util.test");
const Policy_1 = require("./Policy");
chai_1.use(require('sinon-chai'));
chai_1.use(require('chai-as-promised'));
class MyErrorA extends Error {
    constructor() {
        super('Error A');
    }
}
class MyErrorB extends Error {
    constructor() {
        super('Error B');
    }
}
describe('RetryPolicy', () => {
    it('types return data correctly in all cases', async () => {
        const policy = Policy_1.Policy.handleAll().retry();
        const multiply = (n) => n * 2;
        multiply(await policy.execute(() => 42));
        multiply(await policy.execute(async () => 42));
        // Uncomment the following, it should have type errors
        // const somePolicy = Policy.handleWhenResult<'foo' | 'bar'>(() => false).retry();
        // somePolicy.execute(() => 'baz'); // baz is not assignable to 'foo' | 'bar'
    });
    describe('setting backoffs', () => {
        let p;
        let s;
        let clock;
        let delays;
        beforeEach(() => {
            clock = sinon_1.useFakeTimers();
            p = Policy_1.Policy.handleAll().retry();
            delays = [];
            p.onRetry(({ delay }) => {
                delays.push(delay);
                clock.tick(delay);
            });
            s = sinon_1.stub().throws(new MyErrorA());
        });
        afterEach(() => clock.restore());
        it('sets the retry delay', async () => {
            await chai_1.expect(p.delay(50).attempts(1).execute(s)).to.eventually.be.rejectedWith(MyErrorA);
            chai_1.expect(delays).to.deep.equal([50]);
            chai_1.expect(s).to.have.been.calledTwice;
        });
        it('sets the retry sequence', async () => {
            await chai_1.expect(p.delay([10, 20, 20]).execute(s)).to.eventually.be.rejectedWith(MyErrorA);
            chai_1.expect(delays).to.deep.equal([10, 20, 20]);
            chai_1.expect(s).to.have.callCount(4);
        });
        it('sets the retry attempts', async () => {
            await chai_1.expect(p.delay([10, 20, 20]).attempts(1).execute(s)).to.eventually.be.rejectedWith(MyErrorA);
            chai_1.expect(delays).to.deep.equal([10]);
            chai_1.expect(s).to.have.been.calledTwice;
        });
    });
    it('retries all errors', async () => {
        const s = sinon_1.stub().onFirstCall().throws(new MyErrorA()).onSecondCall().returns('ok');
        chai_1.expect(await Policy_1.Policy.handleAll().retry().execute(s)).to.equal('ok');
        chai_1.expect(s).to.have.been.calledTwice;
    });
    it('filters error types', async () => {
        const s = sinon_1.stub().onFirstCall().throws(new MyErrorA()).onSecondCall().throws(new MyErrorB());
        await chai_1.expect(Policy_1.Policy.handleType(MyErrorA).retry().attempts(5).execute(s)).to.eventually.be.rejectedWith(MyErrorB);
        chai_1.expect(s).to.have.been.calledTwice;
    });
    it('filters returns', async () => {
        const s = sinon_1.stub().onFirstCall().returns(1).onSecondCall().returns(2);
        chai_1.expect(await Policy_1.Policy.handleWhenResult(r => typeof r === 'number' && r < 2)
            .retry()
            .attempts(5)
            .execute(s)).to.equal(2);
        chai_1.expect(s).to.have.been.calledTwice;
    });
    it('permits specifying exponential backoffs', async () => {
        const s = sinon_1.stub().returns(1);
        chai_1.expect(await Policy_1.Policy.handleWhenResult(r => typeof r === 'number')
            .retry()
            .exponential({ generator: Backoff_1.noJitterGenerator, maxAttempts: 2 })
            .execute(s)).to.equal(1);
        chai_1.expect(s).to.have.callCount(3);
    });
    it('bubbles returns when retry attempts exceeded', async () => {
        const s = sinon_1.stub().returns(1);
        chai_1.expect(await Policy_1.Policy.handleWhenResult(r => typeof r === 'number' && r < 2)
            .retry()
            .attempts(5)
            .execute(s)).to.equal(1);
        chai_1.expect(s).to.have.callCount(6);
    });
    it('bubbles errors when retry attempts exceeded', async () => {
        const s = sinon_1.stub().throws(new MyErrorB());
        await chai_1.expect(Policy_1.Policy.handleAll().retry().attempts(5).execute(s)).to.eventually.be.rejectedWith(MyErrorB);
        chai_1.expect(s).to.have.callCount(6);
    });
    it('does not unref by default', async () => {
        const output = await util_test_1.runInChild(`
      Policy.handleAll()
        .retry()
        .attempts(1)
        .delay(1)
        .execute(() => {
          console.log('attempt');
          throw new Error('oh no!');
        });
    `);
        chai_1.expect(output).to.contain('oh no!');
    });
    it('unrefs as requested', async () => {
        const output = await util_test_1.runInChild(`
      Policy.handleAll()
        .retry()
        .dangerouslyUnref()
        .attempts(1)
        .delay(1)
        .execute(() => {
          console.log('attempt');
          throw new Error('oh no!');
        });
    `);
        chai_1.expect(output).to.equal('attempt');
    });
    it('stops retries if cancellation is requested', async () => {
        const parent = new CancellationToken_1.CancellationTokenSource();
        const err = new Error();
        let calls = 0;
        await chai_1.expect(Policy_1.Policy.handleAll()
            .retry()
            .attempts(3)
            .execute(({ cancellationToken: cancellation }) => {
            calls++;
            chai_1.expect(cancellation.isCancellationRequested).to.be.false;
            parent.cancel();
            chai_1.expect(cancellation.isCancellationRequested).to.be.true;
            throw err;
        }, parent.token)).to.eventually.be.rejectedWith(err);
        chai_1.expect(calls).to.equal(1);
    });
});
//# sourceMappingURL=RetryPolicy.test.js.map