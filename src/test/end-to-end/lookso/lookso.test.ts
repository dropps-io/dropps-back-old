import {FollowPOSTRouteTests} from "./follow.post.test";
import {UnfollowDELETERouteTests} from "./unfollow.delete.test";
import {LikePOSTRouteTests} from "./like.post.test";
import {FeedGETTests} from "./feed.get.test";
import {before} from "mocha";
import {SearchGETTests} from "./search.get.test";


export const LooksoTests = () => {
  describe('lookso routes', () => {

    before(async () => {

    });

    FollowPOSTRouteTests();
    UnfollowDELETERouteTests();
    LikePOSTRouteTests();
    FeedGETTests();
    SearchGETTests();

  });
}

