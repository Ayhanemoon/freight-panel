
import { CurrentUserCapabilities } from
  'features/accounts/types/currentUser';

const COLLECTION_TASK_PERMISSIONS = {
  view: 'freight.view_collectiontask',
  create: 'freight.add_collectiontask',
  assign: 'freight.assign_collection_task',
  verify: 'freight.verify_collection_task',
} as const;

const hasPermission = (
  user: CurrentUserCapabilities,
  permission: string
): boolean => user.permissions.includes(permission);

const hasAnyCollectionPermission = (
  user: CurrentUserCapabilities
): boolean =>
  Object.values(COLLECTION_TASK_PERMISSIONS).some(
    (permission) => hasPermission(user, permission)
  );

export const canViewCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  user.roles.includes('SuperAdmin') ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.view) ||
  hasAnyCollectionPermission(user);

export const canCreateCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  user.roles.includes('SuperAdmin') ||
  (
    (
      user.roles.includes('BranchManager') ||
      user.roles.includes('Operator')
    ) &&
    hasPermission(user, COLLECTION_TASK_PERMISSIONS.create)
  );

export const canAssignCollectionTasks = (
  user: CurrentUserCapabilities
): boolean =>
  user.roles.includes('SuperAdmin') ||
  (
    (
      user.roles.includes('BranchManager') ||
      user.roles.includes('Operator')
    ) &&
    hasPermission(user, COLLECTION_TASK_PERMISSIONS.assign)
  );

export const canVerifyCollectionTaskParcels = (
  user: CurrentUserCapabilities
): boolean =>
  user.roles.includes('SuperAdmin') ||
  hasPermission(user, COLLECTION_TASK_PERMISSIONS.verify);

export const canFilterCollectionTasksByBranch = (
  user: CurrentUserCapabilities
): boolean => user.roles.includes('SuperAdmin');
