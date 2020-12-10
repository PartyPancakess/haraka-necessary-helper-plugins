import { IBackoff } from './Backoff';
export declare const expectDurations: <T>(backoff: IBackoff<T> | undefined, expected: readonly (number | undefined)[], context?: T | undefined) => void;
