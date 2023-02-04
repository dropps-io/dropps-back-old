import { insertContract, updateContract } from '../../../bin/db/contract.table';
import { INDEX_DATA } from '../config';
import { reportIndexingScriptError } from '../index-logger';
import { ContractFullMetadata } from '../models/contract-metadata.model';
import { insertContractMetadata } from '../../../bin/db/contract-metadata.table';
import { insertAsset } from '../../../bin/db/asset.table';
import { insertImage } from '../../../bin/db/image.table';
import { insertLink } from '../../../bin/db/link.table';
import { insertTag } from '../../../bin/db/tag.table';

export async function indexContract(
  address: string,
  code: string | null,
  metadata: ContractFullMetadata | null,
  exists?: boolean,
) {
  if (!INDEX_DATA) return;
  try {
    if (!exists) await insertContract(address, code);
    else await updateContract(address, code);
  } catch (e) {
    await reportIndexingScriptError('indexContract', e, { address, code });
  }
  if (metadata) {
    try {
      await insertContractMetadata(
        address,
        metadata.name,
        metadata.symbol,
        metadata.description,
        metadata.isNFT,
        '',
      );
    } catch (e) {
      await reportIndexingScriptError('indexContract:metadata', e);
    }
    // Mapping used in each for loop to avoid duplicates
    if (metadata.assets)
      for (const asset of [...new Map(metadata.assets.map((m) => [m.url, m])).values()]) {
        try {
          await insertAsset(address, asset.url, asset.fileType, asset.hash);
        } catch (e) {
          await reportIndexingScriptError('indexContract:asset', e);
        }
      }
    if (metadata.images)
      for (const image of [...new Map(metadata.images.map((m) => [m.url, m])).values()]) {
        try {
          await insertImage(address, image.url, image.width, image.height, '', image.hash);
        } catch (e) {
          await reportIndexingScriptError('indexContract:image', e);
        }
      }
    if (metadata.links)
      for (const link of [...new Map(metadata.links.map((m) => [m.url, m])).values()]) {
        try {
          await insertLink(address, link.title, link.url);
        } catch (e) {
          await reportIndexingScriptError('indexContract:link', e);
        }
      }
    if (metadata.icon)
      for (const icon of [...new Map(metadata.icon.map((m) => [m.url, m])).values()]) {
        try {
          await insertImage(address, icon.url, icon.width, icon.height, 'icon', icon.hash);
        } catch (e) {
          await reportIndexingScriptError('indexContract:icon', e);
        }
      }
    if (metadata.backgroundImage)
      for (const image of [...new Map(metadata.backgroundImage.map((m) => [m.url, m])).values()]) {
        try {
          await insertImage(
            address,
            image.url,
            image.width,
            image.height,
            'background',
            image.hash,
          );
        } catch (e) {
          await reportIndexingScriptError('indexContract:backgroundImage', e);
        }
      }
    if (metadata.profileImage)
      for (const image of [...new Map(metadata.profileImage.map((m) => [m.url, m])).values()]) {
        try {
          await insertImage(address, image.url, image.width, image.height, 'profile', image.hash);
        } catch (e) {
          await reportIndexingScriptError('indexContract:profileImage', e);
        }
      }
    if (metadata.tags)
      for (const tag of [...new Set(metadata.tags)]) {
        try {
          await insertTag(address, tag);
        } catch (e) {
          await reportIndexingScriptError('indexContract:tags', e);
        }
      }
    if (metadata.avatar)
      try {
        await insertAsset(
          address,
          metadata.avatar.url,
          metadata.avatar.fileType,
          metadata.avatar.hash,
        );
      } catch (e) {
        await reportIndexingScriptError('indexContract:avatar', e);
      }
  }
}
