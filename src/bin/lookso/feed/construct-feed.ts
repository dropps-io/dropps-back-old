import {queryDecodedEventParameters} from "../../db/decoded-event-parameter.table";
import {queryEvent} from "../../db/event.table";
import {Post} from "../../../models/types/post";
import {DecodedParameter} from "../../../models/types/decoded-parameter";
import {Event} from "../../../models/types/event";
import {generateEventDisplay} from "./generate-event-display";
import {queryDecodedFunctionParameters} from "../../db/decoded-function-parameter.table";
import {queryContractName} from "../../db/contract-metadata.table";
import {queryImagesByType} from "../../db/image.table";
import {selectImage} from "../../utils/select-image";
import {queryPostLikesCount} from "../../db/like.table";
import {queryPostCommentsCount, queryPostRepostsCount} from "../../db/post.table";


export async function constructFeed(posts: Post[]) {
    const feed = [];

    for (let post of posts) {
      const authorName = await queryContractName(post.author);
      const authorPic = selectImage(await queryImagesByType(post.author, 'profile'), {minWidthExpected: 50});
      const postLikes = await queryPostLikesCount(post.hash);
      const postComments = await queryPostCommentsCount(post.hash);
      const postReposts = await queryPostRepostsCount(post.hash);

        if (post.eventId) {
            const event: Event = await queryEvent(post.eventId);
            const parameters: Map<string, DecodedParameter> = new Map((await queryDecodedEventParameters(post.eventId)).map(x => {return [x.name, x]}));

            const feedObject = {
              author:
                {
                  address: post.author,
                  name: authorName,
                  image: authorPic
                },
              type: 'event',
              name: event.type,
              date: post.date,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
              display: {},
              likes: postLikes,
              comments: postComments,
              reposts: postReposts
            };

            switch (event.type) {
                case 'ContractCreated':
                    feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                    break;
                case 'Executed':
                    const [selector, executionContract] = [parameters.get('selector'), parameters.get('to')];
                    const transactionParameters: Map<string, DecodedParameter> = new Map((await queryDecodedFunctionParameters(event.transactionHash)).map(x => {return [x.name, x]}));
                    feedObject.display = await generateEventDisplay(selector ? selector.value : '', transactionParameters, {executionContract: executionContract ? executionContract.value : '', senderProfile: event.address});
                    break;
                case 'DataChanged':
                    break;
                case 'OwnershipTransferred':
                    feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                    break;
                case 'ValueReceived':
                    feedObject.display = await generateEventDisplay(event.topic.slice(0, 10), parameters);
                    break;
            }
            feed.push(feedObject);
        }
    }

    return feed;
}
