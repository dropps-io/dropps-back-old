import {DecodedParameter} from "../../../models/types/decoded-parameter";
import {MethodDisplay} from "../../../models/types/method-display";
import {queryMethodDisplay} from "../../db/method-display.table";
import {getWordsBetweenCurlies} from "../../utils/words-between-curlies";
import {getDisplayParam} from "./display-params";
import {queryContract} from "../../db/contract.table";
import {queryContractIsNFT} from "../../db/contract-metadata.table";
import {queryImages} from "../../db/image.table";
import {Image} from "../../../models/types/image";

export async function generateEventDisplay(methodId: string, params: Map<string, DecodedParameter>, context?: {senderProfile?: string, executionContract?: string}) {
    const methodDisplay: MethodDisplay = await queryMethodDisplay(methodId);
    const tags: {standard: string | null, copies: string | null, standardType: string | null} = {standard: null, copies: null, standardType: null};
    let images: Image[] = [];
    let displayParams: {[key: string]: any} = {}

    if (!methodDisplay) return {text:'', params: []};

    for (let word of getWordsBetweenCurlies(methodDisplay.text)) {
        const param = params.get(word);
        if (param) displayParams[param.name] = await getDisplayParam(param.value, param.displayType ? param.displayType : param.type);
        else if(context?.senderProfile && word === 'senderProfile') displayParams['senderProfile'] = await getDisplayParam(context.senderProfile, 'address');
        else if(context?.executionContract && word === 'executionContract') displayParams['executionContract'] = await getDisplayParam(context.executionContract, 'address');
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
            images = await queryImages(address);
        }
    }
    return {text: methodDisplay.text, params: displayParams, images, tags};
}