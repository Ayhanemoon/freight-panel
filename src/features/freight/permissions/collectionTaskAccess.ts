import { CurrentUserCapabilities } from
  'features/accounts/types/currentUser';

const COLLECTION_TASK_PERMISSIONS = {
  view: 'freight.view_collectiontask',
  create: 'freight.add_collectiontask',
  assign: 'freight.assign_collection_task',
  start: 'freight.start_collection_task',
  verify: 'freight.verify_collection_task',
  complete: 'freight.complete_collection_task',
  cancel: 'freight.cancel_collection_task',
  fail: 'freight.fail_collection_task',
} as const;

const hasPermission = (
  user: CurrentUserCapabilities,
  permission: string
): boolean => user.permissions.includes(permission);

const isSuperAdmin = (
  user: CurrentUserCapabilities
): boolean => user.roles.includes('SuperAdmin');

const isBranchManager = (
  user: CurrentUserCapabilities
): boolean => user.roles.includes('BranchManager');

const isCargoCollector = (
  user: CurrentUserCapabilities
): boolean => user.roles.includes('CargoCollector');

const hasAnyCollectionPermission = (
  user: CurrentUserCapabilities
): boolean =>
  Object.values(COLLECTION_TASK_PERMISSIONS).some(
    (permission) => hasPermission(user, permission)
  );

export const canViewCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  isSuperAdmin(user) ||
  isBranchManager(user) ||
  isCargoCollector(user) ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.view) ||
  hasAnyCollectionPermission(user);

export const canCreateCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  isSuperAdmin(user) ||
  (
    (isBranchManager(user) || user.roles.includes('Operator')) &&
    hasPermission(user, COLLECTION_TASK_PERMISSIONS.create)
  );

export const canAssignCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  isSuperAdmin(user) ||
  isBranchManager(user) ||
  (
    user.roles.includes('Operator') &&
    hasPermission(user, COLLECTION_TASK_PERMISSIONS.assign)
  );

export const canVerifyCollectionTaskParcels = (
  user: CurrentUserCapabilities
): boolean =>
  isSuperAdmin(user) ||
  isBranchManager(user) ||
  isCargoCollector(user) ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.verify);

export const canCompleteCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  isSuperAdmin(user) || isCargoCollector(user);

export const canCancelCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  isSuperAdmin(user) ||
  isBranchManager(user) ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.create) ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.assign) ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.cancel);

export const canFailCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  isSuperAdmin(user) ||
  isBranchManager(user) ||
  isCargoCollector(user) ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.fail);

export const canFilterCollectionTasksByBranch = (
  user: CurrentUserCapabilities
): boolean => isSuperAdmin(user);