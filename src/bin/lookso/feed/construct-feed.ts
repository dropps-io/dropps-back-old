import {queryDecodedEventParameters} from "../../db/decoded-event-parameter.table";
import {queryEvent} from "../../db/event.table";
import {Post} from "../../../models/types/post";
import {DecodedParameter} from "../../../models/types/decoded-parameter";
import {Event} from "../../../models/types/event";
import {generateEventDisplay} from "./generate-event-display";
import {queryDecodedFunctionParameters} from "../../db/decoded-function-parameter.table";


export async function constructFeed(posts: Post[]) {
    const feed = [];

    for (let post of posts) {
        if (post.eventId) {
            const event: Event = await queryEvent(post.eventId);
            const parameters: Map<string, DecodedParameter> = new Map((await queryDecodedEventParameters(post.eventId)).map(x => {return [x.name, x]}));
            const feedObject = {author: post.author, type: 'event', name: event.type, date: post.date, blockNumber: event.blockNumber, transactionHash: event.transactionHash, display: {}};
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
