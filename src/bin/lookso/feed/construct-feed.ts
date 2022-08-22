import {queryDecodedEventParameters} from "../../db/decoded-event-parameter.table";
import {queryEvent} from "../../db/event.table";
import {Post} from "../../../models/types/post";
import {DecodedParameter} from "../../../models/types/decoded-parameter";
import {Event} from "../../../models/types/event";
import {generateDataChangedDisplay, generateEventDisplay} from "./generate-event-display";
import {queryDecodedFunctionParameters} from "../../db/decoded-function-parameter.table";
import {queryContractName} from "../../db/contract-metadata.table";
import {queryImagesByType} from "../../db/image.table";
import {selectImage} from "../../utils/select-image";
import {queryPostLike, queryPostLikesCount} from "../../db/like.table";
import {queryPostCommentsCount, queryPostRepostsCount} from "../../db/post.table";
import {FeedPost} from "../../../models/types/feed-post";


export async function constructFeed(posts: Post[], profile?: string): Promise<FeedPost[]> {
    const feed: FeedPost[] = [];

    for (let post of posts) {
      const authorName = await queryContractName(post.author);
      const authorPic = selectImage(await queryImagesByType(post.author, 'profile'), {minWidthExpected: 50});
      const postLikes = await queryPostLikesCount(post.hash);
      const postComments = await queryPostCommentsCount(post.hash);
      const postReposts = await queryPostRepostsCount(post.hash);
      let isLiked = false;
      if (profile) {
        isLiked = await queryPostLike(profile, post.hash);
      }

        if (post.eventId) {
            const event: Event = await queryEvent(post.eventId);
            const parameters: Map<string, DecodedParameter> = new Map((await queryDecodedEventParameters(post.eventId)).map(x => {return [x.name, x]}));

            const feedObject: FeedPost = {
              hash: post.hash,
              author:
                {
                  address: post.author,
                  name: authorName,
                  image: authorPic ? authorPic.url : ''
                },
              type: 'event',
              name: event.type,
              date: post.date,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
              display: {
                text: '',
                params: {},
                image: '',
                tags: {copies: null, standardType: null, standard: null}
              },
              likes: postLikes,
              comments: postComments,
              reposts: postReposts,
              isLiked: isLiked
            };

            switch (event.type) {
                case 'ContractCreated':
                    feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                    break;
                case 'Executed':
                    const [selector, executionContract] = [parameters.get('selector'), parameters.get('to')];
                    const transactionParameters: Map<string, DecodedParameter> = new Map((await queryDecodedFunctionParameters(event.transactionHash)).map(x => {return [x.name, x]}));
                    try {
                      feedObject.display = await generateEventDisplay(selector ? selector.value : '', transactionParameters, {executionContract: executionContract ? executionContract.value : '', senderProfile: event.address});
                    } catch (e) {
                      feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                    }
                    break;
                case 'DataChanged':
                  feedObject.display = await generateDataChangedDisplay(event, parameters);
                  break;
                case 'OwnershipTransferred':
                    feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                    break;
                case 'ValueReceived':
                    feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                    break;
            }
            feed.push(feedObject);
        } else {
          const feedObject: FeedPost = {
            hash: post.hash,
            author:
              {
                address: post.author,
                name: authorName,
                image: authorPic ? authorPic.url : ''
              },
            type: 'post',
            name: '',
            date: post.date,
            blockNumber: 0,
            transactionHash: post.transactionHash ? post.transactionHash : '',
            display: {
              text: post.text,
              params: {},
              image: post.mediaUrl ? post.mediaUrl.split(';')[1] : '',
              tags: {copies: null, standardType: null, standard: null}
            },
            likes: postLikes,
            comments: postComments,
            reposts: postReposts,
            isLiked: isLiked,
            inRegistry: post.inRegistry
          };
          feed.push(feedObject);
        }
    }

    return feed;
}
