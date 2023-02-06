import { SocialRegistry } from '../types/social-registry';
import { RegistryChangeTable } from '../../../../models/types/tables/registry-change-table';

export function generateNewRegistry(
  decentralizedRegistry: SocialRegistry,
  changes: RegistryChangeTable[],
): SocialRegistry {
  const newRegistry = decentralizedRegistry;
  changes.forEach((change) => {
    if (change.type === 'like') {
      if (change.action === 'add' && !decentralizedRegistry.likes.includes(change.value))
        newRegistry.likes.push(change.value);
      else if (change.action === 'remove') {
        const index = newRegistry.likes.indexOf(change.value);
        if (index > -1) {
          // only splice array when item is found
          newRegistry.likes.splice(index, 1); // 2nd parameter means remove one item only
        }
      }
    } else {
      if (change.action === 'add' && !decentralizedRegistry.follows.includes(change.value))
        newRegistry.follows.push(change.value);
      else if (change.action === 'remove') {
        const index = newRegistry.follows.indexOf(change.value);
        if (index > -1) {
          // only splice array when item is found
          newRegistry.follows.splice(index, 1); // 2nd parameter means remove one item only
        }
      }
    }
  });

  return newRegistry;
}

export function getRegistryUpdatesToPush(
  centralizedRegistry: SocialRegistry,
  newDecentralizedRegistry: SocialRegistry,
): { toAdd: SocialRegistry; toRemove: SocialRegistry } {
  const toRemove: SocialRegistry = {
    posts: [],
    likes: centralizedRegistry.likes.filter(
      (x) => newDecentralizedRegistry.likes.indexOf(x) === -1,
    ),
    follows: centralizedRegistry.follows.filter(
      (x) => newDecentralizedRegistry.follows.indexOf(x) === -1,
    ),
  };

  const toAdd: SocialRegistry = {
    posts: [],
    likes: newDecentralizedRegistry.likes.filter(
      (x) => centralizedRegistry.likes.indexOf(x) === -1,
    ),
    follows: newDecentralizedRegistry.follows.filter(
      (x) => centralizedRegistry.follows.indexOf(x) === -1,
    ),
  };

  return { toAdd, toRemove };
}
