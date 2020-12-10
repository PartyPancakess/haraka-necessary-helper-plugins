/// <reference types="node" />
import * as grpc from '@grpc/grpc-js';
import type { CallOptionsFactory } from './options';
export interface ICallable<T> {
    exec<T>(service: keyof typeof Services, method: string, params: unknown, options?: grpc.CallOptions): Promise<T>;
    withConnection<R>(service: keyof typeof Services, fn: (args: {
        resource: T;
        client: grpc.Client;
        metadata: grpc.Metadata;
    }) => Promise<R> | R): Promise<R>;
    markFailed(resource: T, error: Error): void;
    readonly callOptionsFactory: CallOptionsFactory | undefined;
}
export interface IResponseStream<T> {
    on(event: 'data', fn: (item: T) => void): this;
    on(event: 'end', fn: () => void): this;
    on(event: 'status', fn: (status: grpc.StatusObject) => void): this;
    on(event: 'error', fn: (err: Error) => void): this;
}
export interface IRequestStream<T> {
    write(item: T): void;
    end(): void;
    cancel(): void;
}
export interface IDuplexStream<T, R> extends IRequestStream<T>, IResponseStream<R> {
}
export declare class KVClient {
    private readonly client;
    constructor(client: ICallable<unknown>);
    /**
     * Range gets the keys in the range from the key-value store.
     */
    range(req: IRangeRequest, options?: grpc.CallOptions): Promise<IRangeResponse>;
    /**
     * Put puts the given key into the key-value store.
     * A put request increments the revision of the key-value store
     * and generates one event in the event history.
     */
    put(req: IPutRequest, options?: grpc.CallOptions): Promise<IPutResponse>;
    /**
     * DeleteRange deletes the given range from the key-value store.
     * A delete request increments the revision of the key-value store
     * and generates a delete event in the event history for every deleted key.
     */
    deleteRange(req: IDeleteRangeRequest, options?: grpc.CallOptions): Promise<IDeleteRangeResponse>;
    /**
     * Txn processes multiple requests in a single transaction.
     * A txn request increments the revision of the key-value store
     * and generates events with the same revision for every completed request.
     * It is not allowed to modify the same key several times within one txn.
     */
    txn(req: ITxnRequest, options?: grpc.CallOptions): Promise<ITxnResponse>;
    /**
     * Compact compacts the event history in the etcd key-value store. The key-value
     * store should be periodically compacted or the event history will continue to grow
     * indefinitely.
     */
    compact(req: ICompactionRequest, options?: grpc.CallOptions): Promise<ICompactionResponse>;
}
export declare class WatchClient {
    private readonly client;
    constructor(client: ICallable<unknown>);
    /**
     * Watch watches for events happening or that have happened. Both input and output
     * are streams; the input stream is for creating and canceling watchers and the output
     * stream sends events. One watch RPC can watch on multiple key ranges, streaming events
     * for several watches at once. The entire event history can be watched starting from the
     * last compaction revision.
     */
    watch(options?: grpc.CallOptions): Promise<IDuplexStream<IWatchRequest, IWatchResponse>>;
}
export declare class LeaseClient {
    private readonly client;
    constructor(client: ICallable<unknown>);
    /**
     * LeaseGrant creates a lease which expires if the server does not receive a keepAlive
     * within a given time to live period. All keys attached to the lease will be expired and
     * deleted if the lease expires. Each expired key generates a delete event in the event history.
     */
    leaseGrant(req: ILeaseGrantRequest, options?: grpc.CallOptions): Promise<ILeaseGrantResponse>;
    /**
     * LeaseRevoke revokes a lease. All keys attached to the lease will expire and be deleted.
     */
    leaseRevoke(req: ILeaseRevokeRequest, options?: grpc.CallOptions): Promise<ILeaseRevokeResponse>;
    /**
     * LeaseKeepAlive keeps the lease alive by streaming keep alive requests from the client
     * to the server and streaming keep alive responses from the server to the client.
     */
    leaseKeepAlive(options?: grpc.CallOptions): Promise<IDuplexStream<ILeaseKeepAliveRequest, ILeaseKeepAliveResponse>>;
    /**
     * LeaseTimeToLive retrieves lease information.
     */
    leaseTimeToLive(req: ILeaseTimeToLiveRequest, options?: grpc.CallOptions): Promise<ILeaseTimeToLiveResponse>;
    /**
     * LeaseLeases lists all existing leases.
     */
    leaseLeases(options?: grpc.CallOptions): Promise<ILeaseLeasesResponse>;
}
export declare class ClusterClient {
    private readonly client;
    constructor(client: ICallable<unknown>);
    /**
     * MemberAdd adds a member into the cluster.
     */
    memberAdd(req: IMemberAddRequest, options?: grpc.CallOptions): Promise<IMemberAddResponse>;
    /**
     * MemberRemove removes an existing member from the cluster.
     */
    memberRemove(req: IMemberRemoveRequest, options?: grpc.CallOptions): Promise<IMemberRemoveResponse>;
    /**
     * MemberUpdate updates the member configuration.
     */
    memberUpdate(req: IMemberUpdateRequest, options?: grpc.CallOptions): Promise<IMemberUpdateResponse>;
    /**
     * MemberList lists all the members in the cluster.
     */
    memberList(req: IMemberListRequest, options?: grpc.CallOptions): Promise<IMemberListResponse>;
    /**
     * MemberPromote promotes a member from raft learner (non-voting) to raft voting member.
     */
    memberPromote(req: IMemberPromoteRequest, options?: grpc.CallOptions): Promise<IMemberPromoteResponse>;
}
export declare class MaintenanceClient {
    private readonly client;
    constructor(client: ICallable<unknown>);
    /**
     * Alarm activates, deactivates, and queries alarms regarding cluster health.
     */
    alarm(req: IAlarmRequest, options?: grpc.CallOptions): Promise<IAlarmResponse>;
    /**
     * Status gets the status of the member.
     */
    status(options?: grpc.CallOptions): Promise<IStatusResponse>;
    /**
     * Defragment defragments a member's backend database to recover storage space.
     */
    defragment(options?: grpc.CallOptions): Promise<IDefragmentResponse>;
    /**
     * Hash computes the hash of whole backend keyspace,
     * including key, lease, and other buckets in storage.
     * This is designed for testing ONLY!
     * Do not rely on this in production with ongoing transactions,
     * since Hash operation does not hold MVCC locks.
     * Use "HashKV" API instead for "key" bucket consistency checks.
     */
    hash(options?: grpc.CallOptions): Promise<IHashResponse>;
    /**
     * HashKV computes the hash of all MVCC keys up to a given revision.
     * It only iterates "key" bucket in backend storage.
     */
    hashKV(req: IHashKVRequest, options?: grpc.CallOptions): Promise<IHashKVResponse>;
    /**
     * Snapshot sends a snapshot of the entire backend from a member over a stream to a client.
     */
    snapshot(options?: grpc.CallOptions): Promise<IResponseStream<ISnapshotResponse>>;
    /**
     * MoveLeader requests current leader node to transfer its leadership to transferee.
     */
    moveLeader(req: IMoveLeaderRequest, options?: grpc.CallOptions): Promise<IMoveLeaderResponse>;
    /**
     * Downgrade requests downgrade, cancel downgrade on the cluster version.
     */
    downgrade(req: IDowngradeRequest, options?: grpc.CallOptions): Promise<IDowngradeResponse>;
}
export declare class AuthClient {
    private readonly client;
    constructor(client: ICallable<unknown>);
    /**
     * AuthEnable enables authentication.
     */
    authEnable(options?: grpc.CallOptions): Promise<IAuthEnableResponse>;
    /**
     * AuthDisable disables authentication.
     */
    authDisable(options?: grpc.CallOptions): Promise<IAuthDisableResponse>;
    /**
     * AuthStatus displays authentication status.
     */
    authStatus(options?: grpc.CallOptions): Promise<IAuthStatusResponse>;
    /**
     * Authenticate processes an authenticate request.
     */
    authenticate(req: IAuthenticateRequest, options?: grpc.CallOptions): Promise<IAuthenticateResponse>;
    /**
     * UserAdd adds a new user. User name cannot be empty.
     */
    userAdd(req: IAuthUserAddRequest, options?: grpc.CallOptions): Promise<IAuthUserAddResponse>;
    /**
     * UserGet gets detailed user information.
     */
    userGet(req: IAuthUserGetRequest, options?: grpc.CallOptions): Promise<IAuthUserGetResponse>;
    /**
     * UserList gets a list of all users.
     */
    userList(options?: grpc.CallOptions): Promise<IAuthUserListResponse>;
    /**
     * UserDelete deletes a specified user.
     */
    userDelete(req: IAuthUserDeleteRequest, options?: grpc.CallOptions): Promise<IAuthUserDeleteResponse>;
    /**
     * UserChangePassword changes the password of a specified user.
     */
    userChangePassword(req: IAuthUserChangePasswordRequest, options?: grpc.CallOptions): Promise<IAuthUserChangePasswordResponse>;
    /**
     * UserGrant grants a role to a specified user.
     */
    userGrantRole(req: IAuthUserGrantRoleRequest, options?: grpc.CallOptions): Promise<IAuthUserGrantRoleResponse>;
    /**
     * UserRevokeRole revokes a role of specified user.
     */
    userRevokeRole(req: IAuthUserRevokeRoleRequest, options?: grpc.CallOptions): Promise<IAuthUserRevokeRoleResponse>;
    /**
     * RoleAdd adds a new role. Role name cannot be empty.
     */
    roleAdd(req: IAuthRoleAddRequest, options?: grpc.CallOptions): Promise<IAuthRoleAddResponse>;
    /**
     * RoleGet gets detailed role information.
     */
    roleGet(req: IAuthRoleGetRequest, options?: grpc.CallOptions): Promise<IAuthRoleGetResponse>;
    /**
     * RoleList gets lists of all roles.
     */
    roleList(options?: grpc.CallOptions): Promise<IAuthRoleListResponse>;
    /**
     * RoleDelete deletes a specified role.
     */
    roleDelete(req: IAuthRoleDeleteRequest, options?: grpc.CallOptions): Promise<IAuthRoleDeleteResponse>;
    /**
     * RoleGrantPermission grants a permission of a specified key or range to a specified role.
     */
    roleGrantPermission(req: IAuthRoleGrantPermissionRequest, options?: grpc.CallOptions): Promise<IAuthRoleGrantPermissionResponse>;
    /**
     * RoleRevokePermission revokes a key or range permission of a specified role.
     */
    roleRevokePermission(req: IAuthRoleRevokePermissionRequest, options?: grpc.CallOptions): Promise<IAuthRoleRevokePermissionResponse>;
}
export interface IResponseHeader {
    /**
     * cluster_id is the ID of the cluster which sent the response.
     */
    cluster_id: string;
    /**
     * member_id is the ID of the member which sent the response.
     */
    member_id: string;
    /**
     * revision is the key-value store revision when the request was applied.
     * For watch progress responses, the header.revision indicates progress. All future events
     * recieved in this stream are guaranteed to have a higher revision number than the
     * header.revision number.
     */
    revision: string;
    /**
     * raft_term is the raft term when the request was applied.
     */
    raft_term: string;
}
export declare enum SortOrder {
    /**
     * default, no sorting
     */
    None = 0,
    /**
     * lowest target value first
     */
    Ascend = 1,
    /**
     * highest target value first
     */
    Descend = 2
}
export declare enum SortTarget {
    Key = 0,
    Version = 1,
    Create = 2,
    Mod = 3,
    Value = 4
}
export interface IRangeRequest {
    /**
     * key is the first key for the range. If range_end is not given, the request only looks up key.
     */
    key?: Buffer;
    /**
     * range_end is the upper bound on the requested range [key, range_end).
     * If range_end is '\0', the range is all keys >= key.
     * If range_end is key plus one (e.g., "aa"+1 == "ab", "a\xff"+1 == "b"),
     * then the range request gets all keys prefixed with key.
     * If both key and range_end are '\0', then the range request returns all keys.
     */
    range_end?: Buffer;
    /**
     * limit is a limit on the number of keys returned for the request. When limit is set to 0,
     * it is treated as no limit.
     */
    limit?: string | number;
    /**
     * revision is the point-in-time of the key-value store to use for the range.
     * If revision is less or equal to zero, the range is over the newest key-value store.
     * If the revision has been compacted, ErrCompacted is returned as a response.
     */
    revision?: string | number;
    /**
     * sort_order is the order for returned sorted results.
     */
    sort_order?: SortOrder | keyof typeof SortOrder;
    /**
     * sort_target is the key-value field to use for sorting.
     */
    sort_target?: SortTarget | keyof typeof SortTarget;
    /**
     * serializable sets the range request to use serializable member-local reads.
     * Range requests are linearizable by default; linearizable requests have higher
     * latency and lower throughput than serializable requests but reflect the current
     * consensus of the cluster. For better performance, in exchange for possible stale reads,
     * a serializable range request is served locally without needing to reach consensus
     * with other nodes in the cluster.
     */
    serializable?: boolean;
    /**
     * keys_only when set returns only the keys and not the values.
     */
    keys_only?: boolean;
    /**
     * count_only when set returns only the count of the keys in the range.
     */
    count_only?: boolean;
    /**
     * min_mod_revision is the lower bound for returned key mod revisions; all keys with
     * lesser mod revisions will be filtered away.
     */
    min_mod_revision?: string | number;
    /**
     * max_mod_revision is the upper bound for returned key mod revisions; all keys with
     * greater mod revisions will be filtered away.
     */
    max_mod_revision?: string | number;
    /**
     * min_create_revision is the lower bound for returned key create revisions; all keys with
     * lesser create revisions will be filtered away.
     */
    min_create_revision?: string | number;
    /**
     * max_create_revision is the upper bound for returned key create revisions; all keys with
     * greater create revisions will be filtered away.
     */
    max_create_revision?: string | number;
}
export interface IRangeResponse {
    header: IResponseHeader;
    /**
     * kvs is the list of key-value pairs matched by the range request.
     * kvs is empty when count is requested.
     */
    kvs: IKeyValue[];
    /**
     * more indicates if there are more keys to return in the requested range.
     */
    more: boolean;
    /**
     * count is set to the number of keys within the range when requested.
     */
    count: string;
}
export interface IPutRequest {
    /**
     * key is the key, in bytes, to put into the key-value store.
     */
    key?: Buffer;
    /**
     * value is the value, in bytes, to associate with the key in the key-value store.
     */
    value?: Buffer;
    /**
     * lease is the lease ID to associate with the key in the key-value store. A lease
     * value of 0 indicates no lease.
     */
    lease?: string | number;
    /**
     * If prev_kv is set, etcd gets the previous key-value pair before changing it.
     * The previous key-value pair will be returned in the put response.
     */
    prev_kv?: boolean;
    /**
     * If ignore_value is set, etcd updates the key using its current value.
     * Returns an error if the key does not exist.
     */
    ignore_value?: boolean;
    /**
     * If ignore_lease is set, etcd updates the key using its current lease.
     * Returns an error if the key does not exist.
     */
    ignore_lease?: boolean;
}
export interface IPutResponse {
    header: IResponseHeader;
    /**
     * if prev_kv is set in the request, the previous key-value pair will be returned.
     */
    prev_kv: IKeyValue;
}
export interface IDeleteRangeRequest {
    /**
     * key is the first key to delete in the range.
     */
    key?: Buffer;
    /**
     * range_end is the key following the last key to delete for the range [key, range_end).
     * If range_end is not given, the range is defined to contain only the key argument.
     * If range_end is one bit larger than the given key, then the range is all the keys
     * with the prefix (the given key).
     * If range_end is '\0', the range is all keys greater than or equal to the key argument.
     */
    range_end?: Buffer;
    /**
     * If prev_kv is set, etcd gets the previous key-value pairs before deleting it.
     * The previous key-value pairs will be returned in the delete response.
     */
    prev_kv?: boolean;
}
export interface IDeleteRangeResponse {
    header: IResponseHeader;
    /**
     * deleted is the number of keys deleted by the delete range request.
     */
    deleted: string;
    /**
     * if prev_kv is set in the request, the previous key-value pairs will be returned.
     */
    prev_kvs: IKeyValue[];
}
export interface IRequestOp {
    request_range?: IRangeRequest;
    request_put?: IPutRequest;
    request_delete_range?: IDeleteRangeRequest;
    request_txn?: ITxnRequest;
}
export interface IResponseOp {
    response_range: IRangeResponse;
    response_put: IPutResponse;
    response_delete_range: IDeleteRangeResponse;
    response_txn: ITxnResponse;
}
export declare enum CompareResult {
    Equal = 0,
    Greater = 1,
    Less = 2,
    NotEqual = 3
}
export declare enum CompareTarget {
    Version = 0,
    Create = 1,
    Mod = 2,
    Value = 3,
    Lease = 4
}
export interface ICompare {
    /**
     * result is logical comparison operation for this comparison.
     */
    result?: CompareResult | keyof typeof CompareResult;
    /**
     * target is the key-value field to inspect for the comparison.
     */
    target?: CompareTarget | keyof typeof CompareTarget;
    /**
     * key is the subject key for the comparison operation.
     */
    key?: Buffer;
    /**
     * version is the version of the given key
     */
    version?: string | number;
    /**
     * create_revision is the creation revision of the given key
     */
    create_revision?: string | number;
    /**
     * mod_revision is the last modified revision of the given key.
     */
    mod_revision?: string | number;
    /**
     * value is the value of the given key, in bytes.
     */
    value?: Buffer;
    /**
     * lease is the lease id of the given key.
     */
    lease?: string | number;
    /**
     * range_end compares the given target to all keys in the range [key, range_end).
     * See RangeRequest for more details on key ranges.
     */
    range_end?: Buffer;
}
export interface ITxnRequest {
    /**
     * compare is a list of predicates representing a conjunction of terms.
     * If the comparisons succeed, then the success requests will be processed in order,
     * and the response will contain their respective responses in order.
     * If the comparisons fail, then the failure requests will be processed in order,
     * and the response will contain their respective responses in order.
     */
    compare?: ICompare[];
    /**
     * success is a list of requests which will be applied when compare evaluates to true.
     */
    success?: IRequestOp[];
    /**
     * failure is a list of requests which will be applied when compare evaluates to false.
     */
    failure?: IRequestOp[];
}
export interface ITxnResponse {
    header: IResponseHeader;
    /**
     * succeeded is set to true if the compare evaluated to true or false otherwise.
     */
    succeeded: boolean;
    /**
     * responses is a list of responses corresponding to the results from applying
     * success if succeeded is true or failure if succeeded is false.
     */
    responses: IResponseOp[];
}
export interface ICompactionRequest {
    /**
     * revision is the key-value store revision for the compaction operation.
     */
    revision?: string | number;
    /**
     * physical is set so the RPC will wait until the compaction is physically
     * applied to the local database such that compacted entries are totally
     * removed from the backend database.
     */
    physical?: boolean;
}
export interface ICompactionResponse {
    header: IResponseHeader;
}
export interface IHashRequest {
}
export interface IHashKVRequest {
    /**
     * revision is the key-value store revision for the hash operation.
     */
    revision?: string | number;
}
export interface IHashKVResponse {
    header: IResponseHeader;
    /**
     * hash is the hash value computed from the responding member's MVCC keys up to a given revision.
     */
    hash: string;
    /**
     * compact_revision is the compacted revision of key-value store when hash begins.
     */
    compact_revision: string;
}
export interface IHashResponse {
    header: IResponseHeader;
    /**
     * hash is the hash value computed from the responding member's KV's backend.
     */
    hash: string;
}
export interface ISnapshotRequest {
}
export interface ISnapshotResponse {
    /**
     * header has the current key-value store information. The first header in the snapshot
     * stream indicates the point in time of the snapshot.
     */
    header: IResponseHeader;
    /**
     * remaining_bytes is the number of blob bytes to be sent after this message
     */
    remaining_bytes: string;
    /**
     * blob contains the next chunk of the snapshot in the snapshot stream.
     */
    blob: Buffer;
}
export interface IWatchRequest {
    create_request?: IWatchCreateRequest;
    cancel_request?: IWatchCancelRequest;
    progress_request?: IWatchProgressRequest;
}
export declare enum FilterType {
    /**
     * filter out put event.
     */
    Noput = 0,
    /**
     * filter out delete event.
     */
    Nodelete = 1
}
export interface IWatchCreateRequest {
    /**
     * key is the key to register for watching.
     */
    key?: Buffer;
    /**
     * range_end is the end of the range [key, range_end) to watch. If range_end is not given,
     * only the key argument is watched. If range_end is equal to '\0', all keys greater than
     * or equal to the key argument are watched.
     * If the range_end is one bit larger than the given key,
     * then all keys with the prefix (the given key) will be watched.
     */
    range_end?: Buffer;
    /**
     * start_revision is an optional revision to watch from (inclusive). No start_revision is "now".
     */
    start_revision?: string | number;
    /**
     * progress_notify is set so that the etcd server will periodically send a WatchResponse with
     * no events to the new watcher if there are no recent events. It is useful when clients
     * wish to recover a disconnected watcher starting from a recent known revision.
     * The etcd server may decide how often it will send notifications based on current load.
     */
    progress_notify?: boolean;
    /**
     * filters filter the events at server side before it sends back to the watcher.
     */
    filters?: (FilterType | keyof typeof FilterType)[];
    /**
     * If prev_kv is set, created watcher gets the previous KV before the event happens.
     * If the previous KV is already compacted, nothing will be returned.
     */
    prev_kv?: boolean;
    /**
     * If watch_id is provided and non-zero, it will be assigned to this watcher.
     * Since creating a watcher in etcd is not a synchronous operation,
     * this can be used ensure that ordering is correct when creating multiple
     * watchers on the same stream. Creating a watcher with an ID already in
     * use on the stream will cause an error to be returned.
     */
    watch_id?: string | number;
    /**
     * fragment enables splitting large revisions into multiple watch responses.
     */
    fragment?: boolean;
}
export interface IWatchCancelRequest {
    /**
     * watch_id is the watcher id to cancel so that no more events are transmitted.
     */
    watch_id?: string | number;
}
export interface IWatchProgressRequest {
}
export interface IWatchResponse {
    header: IResponseHeader;
    /**
     * watch_id is the ID of the watcher that corresponds to the response.
     */
    watch_id: string;
    /**
     * created is set to true if the response is for a create watch request.
     * The client should record the watch_id and expect to receive events for
     * the created watcher from the same stream.
     * All events sent to the created watcher will attach with the same watch_id.
     */
    created: boolean;
    /**
     * canceled is set to true if the response is for a cancel watch request.
     * No further events will be sent to the canceled watcher.
     */
    canceled: boolean;
    /**
     * compact_revision is set to the minimum index if a watcher tries to watch
     * at a compacted index.
     *
     * This happens when creating a watcher at a compacted revision or the watcher cannot
     * catch up with the progress of the key-value store.
     *
     * The client should treat the watcher as canceled and should not try to create any
     * watcher with the same start_revision again.
     */
    compact_revision: string;
    /**
     * cancel_reason indicates the reason for canceling the watcher.
     */
    cancel_reason: string;
    /**
     * framgment is true if large watch response was split over multiple responses.
     */
    fragment: boolean;
    events: IEvent[];
}
export interface ILeaseGrantRequest {
    /**
     * TTL is the advisory time-to-live in seconds. Expired lease will return -1.
     */
    TTL?: string | number;
    /**
     * ID is the requested ID for the lease. If ID is set to 0, the lessor chooses an ID.
     */
    ID?: string | number;
}
export interface ILeaseGrantResponse {
    header: IResponseHeader;
    /**
     * ID is the lease ID for the granted lease.
     */
    ID: string;
    /**
     * TTL is the server chosen lease time-to-live in seconds.
     */
    TTL: string;
    error: string;
}
export interface ILeaseRevokeRequest {
    /**
     * ID is the lease ID to revoke. When the ID is revoked, all associated keys will be deleted.
     */
    ID?: string | number;
}
export interface ILeaseRevokeResponse {
    header: IResponseHeader;
}
export interface ILeaseCheckpoint {
    /**
     * ID is the lease ID to checkpoint.
     */
    ID?: string | number;
    /**
     * Remaining_TTL is the remaining time until expiry of the lease.
     */
    remaining_TTL?: string | number;
}
export interface ILeaseCheckpointRequest {
    checkpoints?: ILeaseCheckpoint[];
}
export interface ILeaseCheckpointResponse {
    header?: IResponseHeader;
}
export interface ILeaseKeepAliveRequest {
    /**
     * ID is the lease ID for the lease to keep alive.
     */
    ID?: string | number;
}
export interface ILeaseKeepAliveResponse {
    header: IResponseHeader;
    /**
     * ID is the lease ID from the keep alive request.
     */
    ID: string;
    /**
     * TTL is the new time-to-live for the lease.
     */
    TTL: string;
}
export interface ILeaseTimeToLiveRequest {
    /**
     * ID is the lease ID for the lease.
     */
    ID?: string | number;
    /**
     * keys is true to query all the keys attached to this lease.
     */
    keys?: boolean;
}
export interface ILeaseTimeToLiveResponse {
    header: IResponseHeader;
    /**
     * ID is the lease ID from the keep alive request.
     */
    ID: string;
    /**
     * TTL is the remaining TTL in seconds for the lease; the lease will expire in under TTL+1 seconds.
     */
    TTL: string;
    /**
     * GrantedTTL is the initial granted time in seconds upon lease creation/renewal.
     */
    grantedTTL: string;
    /**
     * Keys is the list of keys attached to this lease.
     */
    keys: Buffer[];
}
export interface ILeaseLeasesRequest {
}
export interface ILeaseStatus {
    ID: string;
}
export interface ILeaseLeasesResponse {
    header: IResponseHeader;
    leases: ILeaseStatus[];
}
export interface IMember {
    /**
     * ID is the member ID for this member.
     */
    ID: string;
    /**
     * name is the human-readable name of the member. If the member is not started, the name will be an empty string.
     */
    name: string;
    /**
     * peerURLs is the list of URLs the member exposes to the cluster for communication.
     */
    peerURLs: string[];
    /**
     * clientURLs is the list of URLs the member exposes to clients for communication. If the member is not started, clientURLs will be empty.
     */
    clientURLs: string[];
    /**
     * isLearner indicates if the member is raft learner.
     */
    isLearner: boolean;
}
export interface IMemberAddRequest {
    /**
     * peerURLs is the list of URLs the added member will use to communicate with the cluster.
     */
    peerURLs?: string[];
    /**
     * isLearner indicates if the added member is raft learner.
     */
    isLearner?: boolean;
}
export interface IMemberAddResponse {
    header: IResponseHeader;
    /**
     * member is the member information for the added member.
     */
    member: IMember;
    /**
     * members is a list of all members after adding the new member.
     */
    members: IMember[];
}
export interface IMemberRemoveRequest {
    /**
     * ID is the member ID of the member to remove.
     */
    ID?: string | number;
}
export interface IMemberRemoveResponse {
    header: IResponseHeader;
    /**
     * members is a list of all members after removing the member.
     */
    members: IMember[];
}
export interface IMemberUpdateRequest {
    /**
     * ID is the member ID of the member to update.
     */
    ID?: string | number;
    /**
     * peerURLs is the new list of URLs the member will use to communicate with the cluster.
     */
    peerURLs?: string[];
}
export interface IMemberUpdateResponse {
    header: IResponseHeader;
    /**
     * members is a list of all members after updating the member.
     */
    members: IMember[];
}
export interface IMemberListRequest {
    linearizable?: boolean;
}
export interface IMemberListResponse {
    header: IResponseHeader;
    /**
     * members is a list of all members associated with the cluster.
     */
    members: IMember[];
}
export interface IMemberPromoteRequest {
    /**
     * ID is the member ID of the member to promote.
     */
    ID?: string | number;
}
export interface IMemberPromoteResponse {
    header: IResponseHeader;
    /**
     * members is a list of all members after promoting the member.
     */
    members: IMember[];
}
export interface IDefragmentRequest {
}
export interface IDefragmentResponse {
    header: IResponseHeader;
}
export interface IMoveLeaderRequest {
    /**
     * targetID is the node ID for the new leader.
     */
    targetID?: string | number;
}
export interface IMoveLeaderResponse {
    header: IResponseHeader;
}
export declare enum AlarmType {
    /**
     * default, used to query if any alarm is active
     */
    None = 0,
    /**
     * space quota is exhausted
     */
    Nospace = 1,
    /**
     * kv store corruption detected
     */
    Corrupt = 2
}
export declare enum AlarmAction {
    Get = 0,
    Activate = 1,
    Deactivate = 2
}
export interface IAlarmRequest {
    /**
     * action is the kind of alarm request to issue. The action
     * may GET alarm statuses, ACTIVATE an alarm, or DEACTIVATE a
     * raised alarm.
     */
    action?: AlarmAction | keyof typeof AlarmAction;
    /**
     * memberID is the ID of the member associated with the alarm. If memberID is 0, the
     * alarm request covers all members.
     */
    memberID?: string | number;
    /**
     * alarm is the type of alarm to consider for this request.
     */
    alarm?: AlarmType | keyof typeof AlarmType;
}
export interface IAlarmMember {
    /**
     * memberID is the ID of the member associated with the raised alarm.
     */
    memberID: string;
    /**
     * alarm is the type of alarm which has been raised.
     */
    alarm: keyof typeof AlarmType;
}
export interface IAlarmResponse {
    header: IResponseHeader;
    /**
     * alarms is a list of alarms associated with the alarm request.
     */
    alarms: IAlarmMember[];
}
export declare enum DowngradeAction {
    Validate = 0,
    Enable = 1,
    Cancel = 2
}
export interface IDowngradeRequest {
    /**
     * action is the kind of downgrade request to issue. The action may
     * VALIDATE the target version, DOWNGRADE the cluster version,
     * or CANCEL the current downgrading job.
     */
    action?: DowngradeAction | keyof typeof DowngradeAction;
    /**
     * version is the target version to downgrade.
     */
    version?: string;
}
export interface IDowngradeResponse {
    header: IResponseHeader;
    /**
     * version is the current cluster version.
     */
    version: string;
}
export interface IStatusRequest {
}
export interface IStatusResponse {
    header: IResponseHeader;
    /**
     * version is the cluster protocol version used by the responding member.
     */
    version: string;
    /**
     * dbSize is the size of the backend database physically allocated, in bytes, of the responding member.
     */
    dbSize: string;
    /**
     * leader is the member ID which the responding member believes is the current leader.
     */
    leader: string;
    /**
     * raftIndex is the current raft committed index of the responding member.
     */
    raftIndex: string;
    /**
     * raftTerm is the current raft term of the responding member.
     */
    raftTerm: string;
    /**
     * raftAppliedIndex is the current raft applied index of the responding member.
     */
    raftAppliedIndex: string;
    /**
     * errors contains alarm/health information and status.
     */
    errors: string[];
    /**
     * dbSizeInUse is the size of the backend database logically in use, in bytes, of the responding member.
     */
    dbSizeInUse: string;
    /**
     * isLearner indicates if the member is raft learner.
     */
    isLearner: boolean;
}
export interface IAuthEnableRequest {
}
export interface IAuthDisableRequest {
}
export interface IAuthStatusRequest {
}
export interface IAuthenticateRequest {
    name?: string;
    password?: string;
}
export interface IAuthUserAddRequest {
    name?: string;
    password?: string;
    options?: IUserAddOptions;
}
export interface IAuthUserGetRequest {
    name?: string;
}
export interface IAuthUserDeleteRequest {
    /**
     * name is the name of the user to delete.
     */
    name?: string;
}
export interface IAuthUserChangePasswordRequest {
    /**
     * name is the name of the user whose password is being changed.
     */
    name?: string;
    /**
     * password is the new password for the user.
     */
    password?: string;
}
export interface IAuthUserGrantRoleRequest {
    /**
     * user is the name of the user which should be granted a given role.
     */
    user?: string;
    /**
     * role is the name of the role to grant to the user.
     */
    role?: string;
}
export interface IAuthUserRevokeRoleRequest {
    name?: string;
    role?: string;
}
export interface IAuthRoleAddRequest {
    /**
     * name is the name of the role to add to the authentication system.
     */
    name?: string;
}
export interface IAuthRoleGetRequest {
    role?: string;
}
export interface IAuthUserListRequest {
}
export interface IAuthRoleListRequest {
}
export interface IAuthRoleDeleteRequest {
    role?: string;
}
export interface IAuthRoleGrantPermissionRequest {
    /**
     * name is the name of the role which will be granted the permission.
     */
    name?: string;
    /**
     * perm is the permission to grant to the role.
     */
    perm?: IPermission;
}
export interface IAuthRoleRevokePermissionRequest {
    role?: string;
    key?: Buffer;
    range_end?: Buffer;
}
export interface IAuthEnableResponse {
    header: IResponseHeader;
}
export interface IAuthDisableResponse {
    header: IResponseHeader;
}
export interface IAuthStatusResponse {
    header: IResponseHeader;
    enabled: boolean;
    /**
     * authRevision is the current revision of auth store
     */
    authRevision: string;
}
export interface IAuthenticateResponse {
    header: IResponseHeader;
    /**
     * token is an authorized token that can be used in succeeding RPCs
     */
    token: string;
}
export interface IAuthUserAddResponse {
    header: IResponseHeader;
}
export interface IAuthUserGetResponse {
    header: IResponseHeader;
    roles: string[];
}
export interface IAuthUserDeleteResponse {
    header: IResponseHeader;
}
export interface IAuthUserChangePasswordResponse {
    header: IResponseHeader;
}
export interface IAuthUserGrantRoleResponse {
    header: IResponseHeader;
}
export interface IAuthUserRevokeRoleResponse {
    header: IResponseHeader;
}
export interface IAuthRoleAddResponse {
    header: IResponseHeader;
}
export interface IAuthRoleGetResponse {
    header: IResponseHeader;
    perm: IPermission[];
}
export interface IAuthRoleListResponse {
    header: IResponseHeader;
    roles: string[];
}
export interface IAuthUserListResponse {
    header: IResponseHeader;
    users: string[];
}
export interface IAuthRoleDeleteResponse {
    header: IResponseHeader;
}
export interface IAuthRoleGrantPermissionResponse {
    header: IResponseHeader;
}
export interface IAuthRoleRevokePermissionResponse {
    header: IResponseHeader;
}
export interface IKeyValue {
    /**
     * key is the first key for the range. If range_end is not given, the request only looks up key.
     */
    key: Buffer;
    create_revision: string;
    mod_revision: string;
    /**
     * version is the version of the given key
     */
    version: string;
    /**
     * If ignore_value is set, etcd updates the key using its current value.
     * Returns an error if the key does not exist.
     */
    value: Buffer;
    /**
     * If ignore_lease is set, etcd updates the key using its current lease.
     * Returns an error if the key does not exist.
     */
    lease: string;
}
export declare enum EventType {
    Put = 0,
    Delete = 1
}
export interface IEvent {
    type: keyof typeof EventType;
    /**
     * if prev_kv is set in the request, the previous key-value pair will be returned.
     */
    kv: IKeyValue;
    /**
     * If prev_kv is set, etcd gets the previous key-value pairs before deleting it.
     * The previous key-value pairs will be returned in the delete response.
     */
    prev_kv: IKeyValue;
}
export interface IUserAddOptions {
    no_password?: boolean;
}
export interface IUser {
    name?: Buffer;
    password?: Buffer;
    roles?: string[];
    options?: IUserAddOptions;
}
export declare enum Permission {
    Read = 0,
    Write = 1,
    Readwrite = 2
}
export interface IPermission {
    permType: keyof typeof Permission;
    key: Buffer;
    range_end: Buffer;
}
export interface IRole {
    name?: Buffer;
    keyPermission?: IPermission[];
}
export declare const Services: {
    KV: typeof KVClient;
    Watch: typeof WatchClient;
    Lease: typeof LeaseClient;
    Cluster: typeof ClusterClient;
    Maintenance: typeof MaintenanceClient;
    Auth: typeof AuthClient;
};
export declare type CallContext = {
    service: 'KV';
    method: 'range';
    isStream: false;
    params: IRangeRequest;
} | {
    service: 'KV';
    method: 'put';
    isStream: false;
    params: IPutRequest;
} | {
    service: 'KV';
    method: 'deleteRange';
    isStream: false;
    params: IDeleteRangeRequest;
} | {
    service: 'KV';
    method: 'txn';
    isStream: false;
    params: ITxnRequest;
} | {
    service: 'KV';
    method: 'compact';
    isStream: false;
    params: ICompactionRequest;
} | {
    service: 'Watch';
    method: 'watch';
    isStream: true;
} | {
    service: 'Lease';
    method: 'leaseGrant';
    isStream: false;
    params: ILeaseGrantRequest;
} | {
    service: 'Lease';
    method: 'leaseRevoke';
    isStream: false;
    params: ILeaseRevokeRequest;
} | {
    service: 'Lease';
    method: 'leaseKeepAlive';
    isStream: true;
} | {
    service: 'Lease';
    method: 'leaseTimeToLive';
    isStream: false;
    params: ILeaseTimeToLiveRequest;
} | {
    service: 'Lease';
    method: 'leaseLeases';
    isStream: false;
} | {
    service: 'Cluster';
    method: 'memberAdd';
    isStream: false;
    params: IMemberAddRequest;
} | {
    service: 'Cluster';
    method: 'memberRemove';
    isStream: false;
    params: IMemberRemoveRequest;
} | {
    service: 'Cluster';
    method: 'memberUpdate';
    isStream: false;
    params: IMemberUpdateRequest;
} | {
    service: 'Cluster';
    method: 'memberList';
    isStream: false;
    params: IMemberListRequest;
} | {
    service: 'Cluster';
    method: 'memberPromote';
    isStream: false;
    params: IMemberPromoteRequest;
} | {
    service: 'Maintenance';
    method: 'alarm';
    isStream: false;
    params: IAlarmRequest;
} | {
    service: 'Maintenance';
    method: 'status';
    isStream: false;
} | {
    service: 'Maintenance';
    method: 'defragment';
    isStream: false;
} | {
    service: 'Maintenance';
    method: 'hash';
    isStream: false;
} | {
    service: 'Maintenance';
    method: 'hashKV';
    isStream: false;
    params: IHashKVRequest;
} | {
    service: 'Maintenance';
    method: 'snapshot';
    isStream: true;
} | {
    service: 'Maintenance';
    method: 'moveLeader';
    isStream: false;
    params: IMoveLeaderRequest;
} | {
    service: 'Maintenance';
    method: 'downgrade';
    isStream: false;
    params: IDowngradeRequest;
} | {
    service: 'Auth';
    method: 'authEnable';
    isStream: false;
} | {
    service: 'Auth';
    method: 'authDisable';
    isStream: false;
} | {
    service: 'Auth';
    method: 'authStatus';
    isStream: false;
} | {
    service: 'Auth';
    method: 'authenticate';
    isStream: false;
    params: IAuthenticateRequest;
} | {
    service: 'Auth';
    method: 'userAdd';
    isStream: false;
    params: IAuthUserAddRequest;
} | {
    service: 'Auth';
    method: 'userGet';
    isStream: false;
    params: IAuthUserGetRequest;
} | {
    service: 'Auth';
    method: 'userList';
    isStream: false;
} | {
    service: 'Auth';
    method: 'userDelete';
    isStream: false;
    params: IAuthUserDeleteRequest;
} | {
    service: 'Auth';
    method: 'userChangePassword';
    isStream: false;
    params: IAuthUserChangePasswordRequest;
} | {
    service: 'Auth';
    method: 'userGrantRole';
    isStream: false;
    params: IAuthUserGrantRoleRequest;
} | {
    service: 'Auth';
    method: 'userRevokeRole';
    isStream: false;
    params: IAuthUserRevokeRoleRequest;
} | {
    service: 'Auth';
    method: 'roleAdd';
    isStream: false;
    params: IAuthRoleAddRequest;
} | {
    service: 'Auth';
    method: 'roleGet';
    isStream: false;
    params: IAuthRoleGetRequest;
} | {
    service: 'Auth';
    method: 'roleList';
    isStream: false;
} | {
    service: 'Auth';
    method: 'roleDelete';
    isStream: false;
    params: IAuthRoleDeleteRequest;
} | {
    service: 'Auth';
    method: 'roleGrantPermission';
    isStream: false;
    params: IAuthRoleGrantPermissionRequest;
} | {
    service: 'Auth';
    method: 'roleRevokePermission';
    isStream: false;
    params: IAuthRoleRevokePermissionRequest;
};
