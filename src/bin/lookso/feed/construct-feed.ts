import {queryDecodedEventParameters} from "../../db/decoded-event-parameter.table";
import {queryEvent} from "../../db/event.table";
import {Post} from "../../../models/types/post";
import {DecodedParameter} from "../../../models/types/decoded-parameter";
import {Event} from "../../../models/types/event";
import {generateDataChangedDisplay, generateEventDisplay, generateUniversalReceiverEventDisplay} from "./generate-event-display";
import {queryDecodedFunctionParameters} from "../../db/decoded-function-parameter.table";
import {queryContractName} from "../../db/contract-metadata.table";
import {queryImagesByType} from "../../db/image.table";
import {selectImage} from "../../utils/select-image";
import {queryPostLike, queryPostLikesCount} from "../../db/like.table";
import {queryPost, queryPostCommentsCount, queryPostRepostsCount} from "../../db/post.table";
import {FeedPost} from "../../../models/types/feed-post";


export async function constructFeed(posts: Post[], profile?: string, noRecursive?: boolean): Promise<FeedPost[]> {
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

          try {
            switch (event.topic) {
              case '0x01c42bd7e97a66166063b02fce6924e6656b6c2c61966630165095c4fb0b7b2f': // ContractCreated
                feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                break;
              case '0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e': // Executed
                const transactionParameters: Map<string, DecodedParameter> = new Map((await queryDecodedFunctionParameters(event.transactionHash)).map(x => {return [x.name, x]}));
                const [selector, executionContract] = [parameters.get('selector'), parameters.get('to')];
                try {
                  feedObject.display = await generateEventDisplay(selector ? selector.value : '', transactionParameters, {executionContract: executionContract ? executionContract.value : '', senderProfile: event.address});
                } catch (e) {
                  feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                }
                break;
              case '0xcdf4e344c0d23d4cdd0474039d176c55b19d531070dbe17856bfb993a5b5720b': // DataChanged(bytes32)
              case '0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2': // DataChanged(bytes32,bytes)
                feedObject.display = await generateDataChangedDisplay(event, parameters);
                break;
              case '0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2': // UniversalReceiver
                feedObject.display = await generateUniversalReceiverEventDisplay(parameters);
                break;
              case '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0': //OwnershipTransferred(address,address)
                feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                break;
              case '0x7e71433ddf847725166244795048ecf3e3f9f35628254ecbf736056664233493': // ValueReceived
                feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                break;
            }
          } catch (e) {
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

        if (!noRecursive && post.childHash){
          const childPost = await queryPost(post.childHash);
          feedObject.childPost = (await constructFeed([childPost], profile, true))[0];
        }
        else if (!noRecursive && post.parentHash){
          const parentPost = await queryPost(post.parentHash);
          feedObject.parentPost = (await constructFeed([parentPost], profile, true))[0];
        }

        feed.push(feedObject);
      }
    }

    return feed;
}
