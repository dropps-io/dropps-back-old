import {DecodedParameter} from "../../../models/types/decoded-parameter";
import {MethodDisplay} from "../../../models/types/method-display";
import {queryMethodDisplay} from "../../db/method-display.table";
import {getWordsBetweenCurlies} from "../../utils/words-between-curlies";
import {getDisplayParam} from "./display-params";
import {queryContract} from "../../db/contract.table";
import {queryContractIsNFT} from "../../db/contract-metadata.table";
import {queryImages} from "../../db/image.table";
import {queryMethodParameterDisplayType} from "../../db/method-parameter.table";
import {FeedDisplay, FeedDisplayParam} from "../../../models/types/feed-post";
import {selectImage} from "../../utils/select-image";

export async function generateEventDisplay(methodId: string, params: Map<string, DecodedParameter>, context?: {senderProfile?: string, executionContract?: string}): Promise<FeedDisplay> {
    const methodDisplay: MethodDisplay = await queryMethodDisplay(methodId);
    const tags: {standard: string | null, copies: string | null, standardType: string | null} = {standard: null, copies: null, standardType: null};
    let image: string = '';
    let displayParams: {[key: string]: FeedDisplayParam} = {}

    if (!methodDisplay) return {text:'', params: {}, image, tags};

    //TODO Delete displayType from decoded param tables

    for (let word of getWordsBetweenCurlies(methodDisplay.text)) {
        const param = params.get(word);
        if (param) {
            const displayType = await queryMethodParameterDisplayType(methodId, param.name);
            displayParams[param.name] = await getDisplayParam(param.value, displayType ? displayType : param.type);
        }
        else if (context?.senderProfile && word === 'senderProfile') displayParams['senderProfile'] = await getDisplayParam(context.senderProfile, 'address');
        else if (context?.executionContract && word === 'executionContract') displayParams['executionContract'] = await getDisplayParam(context.executionContract, 'address');
        else if (word === 'nativeToken') displayParams['nativeToken'] = {value: 'LYXt', display: 'LYXt', type: 'string', additionalProperties: {}};
    }

    if (methodDisplay.standardFrom) {
        const param = params.get(methodDisplay.standardFrom);
        let address: string = '';
        if (param) address = param.value;
        else if (methodDisplay.standardFrom === 'senderProfile' && context?.senderProfile) address = context.senderProfile;
        else if (methodDisplay.standardFrom === 'executionContract' && context?.executionContract) address = context.executionContract;

        if (address) {
            tags.standard = (await queryContract(address)).interfaceCode;
            switch (tags.standard) {
                case 'LSP7':
                    const isNFT = await queryContractIsNFT(address);
                    tags.standardType = isNFT ? 'NFT' : 'token';
                    break;
                case 'LSP8':
                    tags.standardType = 'NFT';
                    break;
                case 'ERC777':
                    tags.standardType = 'token';
                    break;
                case 'ERC721':
                    tags.standardType = 'NFT';
                    break;
                case 'ERC20':
                    tags.standardType = 'token';
                    break;
            }
        }
    }

    if (methodDisplay.standardFrom) {
        const param = params.get(methodDisplay.standardFrom);
        let address: string = '';
        if (param) address = param.value; else if (methodDisplay.standardFrom === 'senderProfile' && context?.senderProfile) address = context.senderProfile; else if (methodDisplay.standardFrom === 'executionContract' && context?.executionContract) address = context.executionContract;

        if (address) {
          const pickedImage = selectImage(await queryImages(address), {minWidthExpected: 100});
          image = pickedImage ? pickedImage.url : '';
        }
    }
    return {text: methodDisplay.text, params: displayParams, image, tags};
}