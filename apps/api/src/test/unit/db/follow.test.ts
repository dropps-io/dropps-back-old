import { clearDB } from '../../helpers/database-helper';
import { UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2 } from '../../helpers/constants';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { shouldThrow } from '../../helpers/should-throw';
import {
  insertFollow,
  queryFollow,
  queryFollowers,
  queryFollowersCount,
  queryFollowing,
  queryFollowingCount,
  removeFollow,
} from '../../../lib/db/queries/follow.table';

describe('Table FollowTable', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContract(UNIVERSAL_PROFILE_1, null);
    await insertContract(UNIVERSAL_PROFILE_2, null);
  });

  it('should be able to insert a follow', async () => {
    expect(!(await shouldThrow(insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2)))).toBe(true);
  });

  it('should be able to query a follow', async () => {
    await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    const up1followup2 = await queryFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    const up2followup1 = await queryFollow(UNIVERSAL_PROFILE_2, UNIVERSAL_PROFILE_1);

    expect(up1followup2).toEqual(true);
    expect(up2followup1).toEqual(false);
  });

  it('should be able to get all following', async () => {
    await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    const following: string[] = await queryFollowing(UNIVERSAL_PROFILE_1);

    expect(following[0]).toEqual(UNIVERSAL_PROFILE_2);
  });

  it('should be able to get all followers', async () => {
    await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    const followers: string[] = await queryFollowers(UNIVERSAL_PROFILE_2);

    expect(followers[0]).toEqual(UNIVERSAL_PROFILE_1);
  });

  it('should be able to count following', async () => {
    await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    const following: number = await queryFollowingCount(UNIVERSAL_PROFILE_1);

    expect(following).toEqual(1);
  });

  it('should be able to get all followers', async () => {
    await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    const followers: number = await queryFollowersCount(UNIVERSAL_PROFILE_2);

    expect(followers).toEqual(1);
  });

  it('should be able to remove a follow', async () => {
    await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    await removeFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
    const up1followup2 = await queryFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);

    expect(up1followup2).toEqual(false);
  });
});
