import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {shouldThrow} from "../../helpers/should-throw";
import {insertPost} from "../../../bin/db/post.table";
import {insertLike, queryPostLike, queryPostLikesCount, querySenderLikes, removeLike} from "../../../bin/db/like.table";

export const LikeTests = () => {
    describe('Table Like', () => {

        beforeEach(async () => {
            await clearDB();
            await insertContract(UNIVERSAL_PROFILE_1, null);
            await insertPost(
                '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                UNIVERSAL_PROFILE_1,
                new Date(),
                'Text',
                'url',
                null,
                null,
                null
            )
        });

        it ('should be able to insert values', async () => {
            assert(!await shouldThrow(insertLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428')));
        });

        it ('should not be able to insert twice a like', async () => {
            await insertLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            assert(await shouldThrow(insertLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428')));
        });

        it('should be able to count post likes', async () => {
            await insertLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            const likes: number = await queryPostLikesCount('0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            expect(likes).to.equal(1);
        });

        it('should be able to query a post like', async () => {
            await insertLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            const liked: boolean = await queryPostLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            const liked2: boolean = await queryPostLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a384906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            expect(liked).to.equal(true);
            expect(liked2).to.equal(false);
        });

        it('should be able to query post liked by a sender', async () => {
            await insertLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            const posts: string[] = await querySenderLikes(UNIVERSAL_PROFILE_1);
            expect(posts[0]).to.equal('0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
        });

        it('should be able to remove a post like', async () => {
            await insertLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            await removeLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            const liked: boolean = await queryPostLike(UNIVERSAL_PROFILE_1, '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
            expect(liked).to.equal(false);
        });
    });
}