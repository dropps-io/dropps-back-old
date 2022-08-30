import {SocialRegistry} from "./types/social-registry";
import {queryRegistryChangesOfAddress} from "../../db/registry-change.table";
import {generateNewRegistry, getRegistryUpdatesToPush} from "./utils/generate-new-registry";
import {insertLike, querySenderLikes, removeLike} from "../../db/like.table";
import {insertFollow, queryFollowing, removeFollow} from "../../db/follow.table";
import {getProfileRegistry} from "./utils/get-address-registry";
import {tryExecuting} from "../../utils/try-executing";

export async function applyChangesToRegistry(address: string): Promise<SocialRegistry> {
  let registry: SocialRegistry = await getProfileRegistry(address);
  const registryChanges = await queryRegistryChangesOfAddress(address);
  const newRegistry = generateNewRegistry(registry, registryChanges);
  const centralizedRegistry: SocialRegistry = {
    posts: [],
    likes: await querySenderLikes(address),
    follows: await queryFollowing(address),
  }
  const toPush = getRegistryUpdatesToPush(centralizedRegistry, newRegistry);

  for (const hash of toPush.toAdd.likes) await tryExecuting(insertLike(address, hash));
  for (const following of toPush.toAdd.follows) await tryExecuting(insertFollow(address, following));
  for (const hash of toPush.toRemove.likes) await tryExecuting(removeLike(address, hash));
  for (const following of toPush.toRemove.follows) await tryExecuting(removeFollow(address, following));

  return newRegistry;
}