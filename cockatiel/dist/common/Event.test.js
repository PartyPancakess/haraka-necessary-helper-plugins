"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const CancellationToken_1 = require("../CancellationToken");
const TaskCancelledError_1 = require("../errors/TaskCancelledError");
const Event_1 = require("./Event");
describe('Event', () => {
    it('emits events', () => {
        const s = sinon_1.stub();
        const emitter = new Event_1.EventEmitter();
        const l = emitter.addListener(s);
        emitter.emit(42);
        l.dispose();
        emitter.emit(43);
        chai_1.expect(s).to.have.been.calledOnceWith(42);
    });
    it('memorizes event emissions', () => {
        const s1 = sinon_1.stub();
        const s2 = sinon_1.stub();
        const emitter = new Event_1.MemorizingEventEmitter();
        chai_1.expect(emitter.hasEmitted).to.be.false;
        emitter.addListener(s1);
        emitter.emit(42);
        chai_1.expect(emitter.hasEmitted).to.be.true;
        emitter.addListener(s2);
        chai_1.expect(s1).to.have.been.calledOnceWith(42);
        chai_1.expect(s2).to.have.been.calledOnceWith(42);
    });
    it('emits events once', () => {
        const s = sinon_1.stub();
        const emitter = new Event_1.EventEmitter();
        Event_1.Event.once(emitter.addListener, s);
        emitter.emit(42);
        emitter.emit(42);
        chai_1.expect(s).to.have.been.calledOnceWith(42);
    });
    it('emits events once with sync call', () => {
        const s = sinon_1.stub();
        const emitter = new Event_1.MemorizingEventEmitter();
        emitter.emit(42);
        Event_1.Event.once(emitter.addListener, s);
        emitter.emit(42);
        chai_1.expect(s).to.have.been.calledOnceWith(42);
    });
    it('converts to promise', async () => {
        const emitter = new Event_1.EventEmitter();
        const v = Event_1.Event.toPromise(emitter.addListener);
        emitter.emit(42);
        chai_1.expect(await v).to.equal(42);
        chai_1.expect(emitter.listeners.size).to.equal(0);
    });
    it('cancels conversion to promise', async () => {
        const emitter = new Event_1.EventEmitter();
        const cts = new CancellationToken_1.CancellationTokenSource();
        setTimeout(() => cts.cancel(), 1);
        const v = Event_1.Event.toPromise(emitter.addListener, cts.token);
        await chai_1.expect(v).to.eventually.be.rejectedWith(TaskCancelledError_1.TaskCancelledError);
        chai_1.expect(emitter.listeners.size).to.equal(0);
    });
    it('cancels conversion to promise sync', async () => {
        const emitter = new Event_1.EventEmitter();
        const v = Event_1.Event.toPromise(emitter.addListener, CancellationToken_1.CancellationToken.Cancelled);
        await chai_1.expect(v).to.eventually.be.rejectedWith(TaskCancelledError_1.TaskCancelledError);
        chai_1.expect(emitter.listeners.size).to.equal(0);
    });
});
//# sourceMappingURL=Event.test.js.map