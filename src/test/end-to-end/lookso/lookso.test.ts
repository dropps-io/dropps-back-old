import {FollowPOSTRouteTests} from "./follow.post.test";
import {UnfollowDELETERouteTests} from "./unfollow.delete.test";
import {LikePOSTRouteTests} from "./like.post.test";
import {FeedGETTests} from "./feed.get.test";
import {SearchGETTests} from "./search.get.test";
import {ProfileActivityGETTests} from "./profile-activity.get.test";
import {ProfileFeedGETTests} from "./profile-feed.get.test";
import {ProfileGETTests} from "./profile.get.test";
import {ProfileFollowCountGETTests} from "./profile-follow-count.get.test";
import {ProfileFollowersGETTests} from "./profile-followers.get.test";
import {ProfileFollowingGETTests} from "./profile-following.get.test";
import {ProfileNotificationsGETTests} from "./profile-notifications.get.test";
import {ProfileNotificationsPUTTests} from "./profile-notifications.put.test";


export const LooksoTests = () => {
  describe('lookso routes', () => {

    FollowPOSTRouteTests();
    UnfollowDELETERouteTests();
    LikePOSTRouteTests();
    FeedGETTests();
    SearchGETTests();
    ProfileActivityGETTests();
    ProfileFeedGETTests();
    ProfileGETTests();
    ProfileFollowCountGETTests();
    ProfileFollowersGETTests();
    ProfileFollowingGETTests();
    ProfileNotificationsGETTests();
    ProfileNotificationsPUTTests();

  });
}

