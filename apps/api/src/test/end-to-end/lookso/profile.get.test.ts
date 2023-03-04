import { LightMyRequestResponse } from 'fastify';

import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { fastify } from '../../../api/fastify';
import { insertLink } from '../../../lib/db/queries/link.table';
import { insertImage } from '../../../lib/db/queries/image.table';
import { HACKER_MAN_UP, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_3 } from '../../helpers/constants';
import { insertContractMetadata } from '../../../lib/db/queries/contract-metadata.table';
import { insertTag } from '../../../lib/db/queries/tag.table';

describe('GET lookso/profile/:address', () => {
  let res: LightMyRequestResponse;
  let profile: any;

  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContractMetadata(HACKER_MAN_UP, 'HackerMan', 'HM', 'Description', false, '');
    await insertImage(HACKER_MAN_UP, 'profile-url', 300, 300, 'profile', '0x00');
    await insertImage(HACKER_MAN_UP, 'background-url', 1900, 500, 'background', '0x00');
    await insertTag(HACKER_MAN_UP, 'tag');
    await insertTag(HACKER_MAN_UP, 'tag1');
    await insertLink(HACKER_MAN_UP, 'link', 'url');
    await insertLink(HACKER_MAN_UP, 'link1', 'url1');

    res = await fastify.inject({ method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}` });
    profile = JSON.parse(res.payload);
  });

  it('should return 200', async () => {
    expect(res.statusCode).toEqual(200);
  });

  it('should return the right metadata', async () => {
    expect(profile.address).toEqual(HACKER_MAN_UP);
    expect(profile.name).toEqual('HackerMan');
    expect(profile.description).toEqual('Description');
  });

  it('should return the right tags', async () => {
    expect(profile.tags.length).toEqual(2);
    expect(profile.tags.includes('tag')).toBe(true);
    expect(profile.tags.includes('tag1')).toBe(true);
  });

  it('should return the right links', async () => {
    expect(profile.links.length).toEqual(2);
    expect(profile.links.filter((l: { title: string }) => l.title === 'link')[0].url).toEqual(
      'url',
    );
    expect(profile.links.filter((l: { title: string }) => l.title === 'link1')[0].url).toEqual(
      'url1',
    );
  });

  it('should return the right images', async () => {
    expect(profile.profileImage).toEqual('profile-url');
    expect(profile.backgroundImage).toEqual('background-url');
  });

  it('should return 400 if invalid address', async () => {
    res = await fastify.inject({ method: 'GET', url: `/lookso/profile/${UNIVERSAL_PROFILE_3}q` });
    expect(res.statusCode).toEqual(400);
  });

  it('should return 404 if profile not found', async () => {
    res = await fastify.inject({ method: 'GET', url: `/lookso/profile/${UNIVERSAL_PROFILE_3}` });
    expect(res.statusCode).toEqual(404);
  });
});

describe('GET lookso/profile/:username/:digits', () => {
  let res: LightMyRequestResponse;
  let profile: any;

  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContract(SERIOUS_MAN_UP, 'LSP0');
    await insertContractMetadata(HACKER_MAN_UP, 'HackerMan', 'HM', 'Description', false, '');
    await insertContractMetadata(SERIOUS_MAN_UP, 'SeriousMan', 'HM', 'Description', false, '');
    await insertImage(HACKER_MAN_UP, 'profile-url', 300, 300, 'profile', '0x00');
    await insertImage(HACKER_MAN_UP, 'background-url', 1900, 500, 'background', '0x00');
    await insertTag(HACKER_MAN_UP, 'tag');
    await insertTag(HACKER_MAN_UP, 'tag1');
    await insertLink(HACKER_MAN_UP, 'link', 'url');
    await insertLink(HACKER_MAN_UP, 'link1', 'url1');

    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/HackerMan/${HACKER_MAN_UP.slice(2, 6)}`,
    });
    profile = JSON.parse(res.payload);
  });

  it('should return 200', async () => {
    expect(res.statusCode).toEqual(200);
  });

  it('should return the right address', async () => {
    expect(profile.address).toEqual(HACKER_MAN_UP);
  });

  it('should be case sensitive', async () => {
    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/hackerman/${HACKER_MAN_UP.slice(2, 6)}`,
    });
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 if wrong digits', async () => {
    res = await fastify.inject({ method: 'GET', url: `/lookso/profile/HackerMan/1234` });
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 if wrong username', async () => {
    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/SeriousMan/${HACKER_MAN_UP.slice(2, 6)}`,
    });
    expect(res.statusCode).toEqual(404);
  });
});
