import { BrokenCircuitError } from './BrokenCircuitError';
import { BulkheadRejectedError } from './BulkheadRejectedError';
import { IsolatedCircuitError } from './IsolatedCircuitError';
import { TaskCancelledError } from './TaskCancelledError';
export * from './BrokenCircuitError';
export * from './BulkheadRejectedError';
export * from './IsolatedCircuitError';
export * from './TaskCancelledError';
export declare const isBrokenCircuitError: (e: unknown) => e is BrokenCircuitError;
export declare const isBulkheadRejectedError: (e: unknown) => e is BulkheadRejectedError;
export declare const isIsolatedCircuitError: (e: unknown) => e is IsolatedCircuitError;
export declare const isTaskCancelledError: (e: unknown) => e is TaskCancelledError;