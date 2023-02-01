import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {shouldThrow} from "../../helpers/should-throw";
import {insertFollow, queryFollow, queryFollowers, queryFollowersCount, queryFollowing, queryFollowingCount, removeFollow} from "../../../bin/db/follow.table";

export const FollowTests = () => {
    describe('Table FollowTable', () => {

        beforeEach(async () => {
            await clearDB();
            await insertContract(UNIVERSAL_PROFILE_1, null);
            await insertContract(UNIVERSAL_PROFILE_2, null);
        });

        it ('should be able to insert a follow', async () => {
            assert(!await shouldThrow(insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2)));
        });

        it('should be able to query a follow', async () => {
            await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            const up1followup2 = await queryFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            const up2followup1 = await queryFollow(UNIVERSAL_PROFILE_2, UNIVERSAL_PROFILE_1);

            expect(up1followup2).to.be.equal(true);
            expect(up2followup1).to.be.equal(false);
        });

        it('should be able to get all following', async () => {
            await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            const following: string[] = await queryFollowing(UNIVERSAL_PROFILE_1);

            expect(following[0]).to.equal(UNIVERSAL_PROFILE_2);
        });

        it('should be able to get all followers', async () => {
            await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            const followers: string[] = await queryFollowers(UNIVERSAL_PROFILE_2);

            expect(followers[0]).to.equal(UNIVERSAL_PROFILE_1);
        });

        it('should be able to count following', async () => {
            await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            const following: number = await queryFollowingCount(UNIVERSAL_PROFILE_1);

            expect(following).to.equal(1);
        });

        it('should be able to get all followers', async () => {
            await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            const followers: number = await queryFollowersCount(UNIVERSAL_PROFILE_2);

            expect(followers).to.equal(1);
        });

        it('should be able to remove a follow', async () => {
            await insertFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            await removeFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);
            const up1followup2 = await queryFollow(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2);

            expect(up1followup2).to.be.equal(false);
        });
    });
}