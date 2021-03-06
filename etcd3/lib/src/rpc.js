"use strict";
// AUTOGENERATED CODE, DO NOT EDIT
// tslint:disable
Object.defineProperty(exports, "__esModule", { value: true });
class KVClient {
    constructor(client) {
        this.client = client;
    }
    /**
     * Range gets the keys in the range from the key-value store.
     */
    range(req, options) {
        return this.client.exec('KV', 'range', req, options);
    }
    /**
     * Put puts the given key into the key-value store.
     * A put request increments the revision of the key-value store
     * and generates one event in the event history.
     */
    put(req, options) {
        return this.client.exec('KV', 'put', req, options);
    }
    /**
     * DeleteRange deletes the given range from the key-value store.
     * A delete request increments the revision of the key-value store
     * and generates a delete event in the event history for every deleted key.
     */
    deleteRange(req, options) {
        return this.client.exec('KV', 'deleteRange', req, options);
    }
    /**
     * Txn processes multiple requests in a single transaction.
     * A txn request increments the revision of the key-value store
     * and generates events with the same revision for every completed request.
     * It is not allowed to modify the same key several times within one txn.
     */
    txn(req, options) {
        return this.client.exec('KV', 'txn', req, options);
    }
    /**
     * Compact compacts the event history in the etcd key-value store. The key-value
     * store should be periodically compacted or the event history will continue to grow
     * indefinitely.
     */
    compact(req, options) {
        return this.client.exec('KV', 'compact', req, options);
    }
}
exports.KVClient = KVClient;
class WatchClient {
    constructor(client) {
        this.client = client;
    }
    /**
     * Watch watches for events happening or that have happened. Both input and output
     * are streams; the input stream is for creating and canceling watchers and the output
     * stream sends events. One watch RPC can watch on multiple key ranges, streaming events
     * for several watches at once. The entire event history can be watched starting from the
     * last compaction revision.
     */
    watch(options) {
        return this.client.getConnection('Watch').then(({ resource, client, metadata }) => {
            const stream = client.watch(metadata, options);
            stream.on('error', () => this.client.markFailed(resource));
            return stream;
        });
    }
}
exports.WatchClient = WatchClient;
class LeaseClient {
    constructor(client) {
        this.client = client;
    }
    /**
     * LeaseGrant creates a lease which expires if the server does not receive a keepAlive
     * within a given time to live period. All keys attached to the lease will be expired and
     * deleted if the lease expires. Each expired key generates a delete event in the event history.
     */
    leaseGrant(req, options) {
        return this.client.exec('Lease', 'leaseGrant', req, options);
    }
    /**
     * LeaseRevoke revokes a lease. All keys attached to the lease will expire and be deleted.
     */
    leaseRevoke(req, options) {
        return this.client.exec('Lease', 'leaseRevoke', req, options);
    }
    /**
     * LeaseKeepAlive keeps the lease alive by streaming keep alive requests from the client
     * to the server and streaming keep alive responses from the server to the client.
     */
    leaseKeepAlive(options) {
        return this.client.getConnection('Lease').then(({ resource, client, metadata }) => {
            const stream = client.leaseKeepAlive(metadata, options);
            stream.on('error', () => this.client.markFailed(resource));
            return stream;
        });
    }
    /**
     * LeaseTimeToLive retrieves lease information.
     */
    leaseTimeToLive(req, options) {
        return this.client.exec('Lease', 'leaseTimeToLive', req, options);
    }
    /**
     * LeaseLeases lists all existing leases.
     */
    leaseLeases(options) {
        return this.client.exec('Lease', 'leaseLeases', {}, options);
    }
}
exports.LeaseClient = LeaseClient;
class ClusterClient {
    constructor(client) {
        this.client = client;
    }
    /**
     * MemberAdd adds a member into the cluster.
     */
    memberAdd(req, options) {
        return this.client.exec('Cluster', 'memberAdd', req, options);
    }
    /**
     * MemberRemove removes an existing member from the cluster.
     */
    memberRemove(req, options) {
        return this.client.exec('Cluster', 'memberRemove', req, options);
    }
    /**
     * MemberUpdate updates the member configuration.
     */
    memberUpdate(req, options) {
        return this.client.exec('Cluster', 'memberUpdate', req, options);
    }
    /**
     * MemberList lists all the members in the cluster.
     */
    memberList(options) {
        return this.client.exec('Cluster', 'memberList', {}, options);
    }
}
exports.ClusterClient = ClusterClient;
class MaintenanceClient {
    constructor(client) {
        this.client = client;
    }
    /**
     * Alarm activates, deactivates, and queries alarms regarding cluster health.
     */
    alarm(req, options) {
        return this.client.exec('Maintenance', 'alarm', req, options);
    }
    /**
     * Status gets the status of the member.
     */
    status(options) {
        return this.client.exec('Maintenance', 'status', {}, options);
    }
    /**
     * Defragment defragments a member's backend database to recover storage space.
     */
    defragment(options) {
        return this.client.exec('Maintenance', 'defragment', {}, options);
    }
    /**
     * Hash computes the hash of the KV's backend.
     * This is designed for testing; do not use this in production when there
     * are ongoing transactions.
     */
    hash(options) {
        return this.client.exec('Maintenance', 'hash', {}, options);
    }
    /**
     * HashKV computes the hash of all MVCC keys up to a given revision.
     */
    hashKV(req, options) {
        return this.client.exec('Maintenance', 'hashKV', req, options);
    }
    /**
     * Snapshot sends a snapshot of the entire backend from a member over a stream to a client.
     */
    snapshot(options) {
        return this.client.getConnection('Maintenance').then(({ resource, client, metadata }) => {
            const stream = client.snapshot(metadata, options, {});
            stream.on('error', () => this.client.markFailed(resource));
            return stream;
        });
    }
    /**
     * MoveLeader requests current leader node to transfer its leadership to transferee.
     */
    moveLeader(req, options) {
        return this.client.exec('Maintenance', 'moveLeader', req, options);
    }
}
exports.MaintenanceClient = MaintenanceClient;
class AuthClient {
    constructor(client) {
        this.client = client;
    }
    /**
     * AuthEnable enables authentication.
     */
    authEnable(options) {
        return this.client.exec('Auth', 'authEnable', {}, options);
    }
    /**
     * AuthDisable disables authentication.
     */
    authDisable(options) {
        return this.client.exec('Auth', 'authDisable', {}, options);
    }
    /**
     * Authenticate processes an authenticate request.
     */
    authenticate(req, options) {
        return this.client.exec('Auth', 'authenticate', req, options);
    }
    /**
     * UserAdd adds a new user.
     */
    userAdd(req, options) {
        return this.client.exec('Auth', 'userAdd', req, options);
    }
    /**
     * UserGet gets detailed user information.
     */
    userGet(req, options) {
        return this.client.exec('Auth', 'userGet', req, options);
    }
    /**
     * UserList gets a list of all users.
     */
    userList(options) {
        return this.client.exec('Auth', 'userList', {}, options);
    }
    /**
     * UserDelete deletes a specified user.
     */
    userDelete(req, options) {
        return this.client.exec('Auth', 'userDelete', req, options);
    }
    /**
     * UserChangePassword changes the password of a specified user.
     */
    userChangePassword(req, options) {
        return this.client.exec('Auth', 'userChangePassword', req, options);
    }
    /**
     * UserGrant grants a role to a specified user.
     */
    userGrantRole(req, options) {
        return this.client.exec('Auth', 'userGrantRole', req, options);
    }
    /**
     * UserRevokeRole revokes a role of specified user.
     */
    userRevokeRole(req, options) {
        return this.client.exec('Auth', 'userRevokeRole', req, options);
    }
    /**
     * RoleAdd adds a new role.
     */
    roleAdd(req, options) {
        return this.client.exec('Auth', 'roleAdd', req, options);
    }
    /**
     * RoleGet gets detailed role information.
     */
    roleGet(req, options) {
        return this.client.exec('Auth', 'roleGet', req, options);
    }
    /**
     * RoleList gets lists of all roles.
     */
    roleList(options) {
        return this.client.exec('Auth', 'roleList', {}, options);
    }
    /**
     * RoleDelete deletes a specified role.
     */
    roleDelete(req, options) {
        return this.client.exec('Auth', 'roleDelete', req, options);
    }
    /**
     * RoleGrantPermission grants a permission of a specified key or range to a specified role.
     */
    roleGrantPermission(req, options) {
        return this.client.exec('Auth', 'roleGrantPermission', req, options);
    }
    /**
     * RoleRevokePermission revokes a key or range permission of a specified role.
     */
    roleRevokePermission(req, options) {
        return this.client.exec('Auth', 'roleRevokePermission', req, options);
    }
}
exports.AuthClient = AuthClient;
var SortOrder;
(function (SortOrder) {
    /**
     * default, no sorting
     */
    SortOrder[SortOrder["None"] = 0] = "None";
    /**
     * lowest target value first
     */
    SortOrder[SortOrder["Ascend"] = 1] = "Ascend";
    /**
     * highest target value first
     */
    SortOrder[SortOrder["Descend"] = 2] = "Descend";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
var SortTarget;
(function (SortTarget) {
    SortTarget[SortTarget["Key"] = 0] = "Key";
    SortTarget[SortTarget["Version"] = 1] = "Version";
    SortTarget[SortTarget["Create"] = 2] = "Create";
    SortTarget[SortTarget["Mod"] = 3] = "Mod";
    SortTarget[SortTarget["Value"] = 4] = "Value";
})(SortTarget = exports.SortTarget || (exports.SortTarget = {}));
var CompareResult;
(function (CompareResult) {
    CompareResult[CompareResult["Equal"] = 0] = "Equal";
    CompareResult[CompareResult["Greater"] = 1] = "Greater";
    CompareResult[CompareResult["Less"] = 2] = "Less";
    CompareResult[CompareResult["NotEqual"] = 3] = "NotEqual";
})(CompareResult = exports.CompareResult || (exports.CompareResult = {}));
var CompareTarget;
(function (CompareTarget) {
    CompareTarget[CompareTarget["Version"] = 0] = "Version";
    CompareTarget[CompareTarget["Create"] = 1] = "Create";
    CompareTarget[CompareTarget["Mod"] = 2] = "Mod";
    CompareTarget[CompareTarget["Value"] = 3] = "Value";
    CompareTarget[CompareTarget["Lease"] = 4] = "Lease";
})(CompareTarget = exports.CompareTarget || (exports.CompareTarget = {}));
var FilterType;
(function (FilterType) {
    /**
     * filter out put event.
     */
    FilterType[FilterType["Noput"] = 0] = "Noput";
    /**
     * filter out delete event.
     */
    FilterType[FilterType["Nodelete"] = 1] = "Nodelete";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var AlarmType;
(function (AlarmType) {
    /**
     * default, used to query if any alarm is active
     */
    AlarmType[AlarmType["None"] = 0] = "None";
    /**
     * space quota is exhausted
     */
    AlarmType[AlarmType["Nospace"] = 1] = "Nospace";
    /**
     * kv store corruption detected
     */
    AlarmType[AlarmType["Corrupt"] = 2] = "Corrupt";
})(AlarmType = exports.AlarmType || (exports.AlarmType = {}));
var AlarmAction;
(function (AlarmAction) {
    AlarmAction[AlarmAction["Get"] = 0] = "Get";
    AlarmAction[AlarmAction["Activate"] = 1] = "Activate";
    AlarmAction[AlarmAction["Deactivate"] = 2] = "Deactivate";
})(AlarmAction = exports.AlarmAction || (exports.AlarmAction = {}));
var EventType;
(function (EventType) {
    EventType[EventType["Put"] = 0] = "Put";
    EventType[EventType["Delete"] = 1] = "Delete";
})(EventType = exports.EventType || (exports.EventType = {}));
var Permission;
(function (Permission) {
    Permission[Permission["Read"] = 0] = "Read";
    Permission[Permission["Write"] = 1] = "Write";
    Permission[Permission["Readwrite"] = 2] = "Readwrite";
})(Permission = exports.Permission || (exports.Permission = {}));
exports.Services = {
    KV: KVClient,
    Watch: WatchClient,
    Lease: LeaseClient,
    Cluster: ClusterClient,
    Maintenance: MaintenanceClient,
    Auth: AuthClient,
};
