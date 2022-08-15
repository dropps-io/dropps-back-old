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
import {Event} from "../../../models/types/event";
import {queryDataKeyValueAtBlockNumber} from "../../db/data-changed.table";
import {KeyDisplay} from "../../../models/types/key-display";
import {queryKeyDisplay} from "../../db/key-display.table";
import {ERC725} from "@erc725/erc725.js";
import {queryErc725ySchema} from "../../db/erc725y-schema.table";
import {Erc725ySchema} from "../../../models/types/erc725y-schema";

export async function generateEventDisplay(methodId: string, params: Map<string, DecodedParameter>, context?: {senderProfile?: string, executionContract?: string}): Promise<FeedDisplay> {
    const methodDisplay: MethodDisplay = await queryMethodDisplay(methodId);
    const tags: {standard: string | null, copies: string | null, standardType: string | null} = {standard: null, copies: null, standardType: null};
    let image: string = '';
    let displayParams: {[key: string]: FeedDisplayParam} = {}

    if (!methodDisplay) throw 'Unknown function';

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

    if (methodDisplay.imageFrom) {
        const param = params.get(methodDisplay.imageFrom);
        let address: string = '';
        if (param) address = param.value;
        else if (methodDisplay.imageFrom === 'senderProfile' && context?.senderProfile) address = context.senderProfile;
        else if (methodDisplay.imageFrom === 'executionContract' && context?.executionContract) address = context.executionContract;

        if (address) {
          const pickedImage = selectImage(await queryImages(address), {minWidthExpected: 100});
          image = pickedImage ? pickedImage.url : '';
        }
    }
    return {text: methodDisplay.text, params: displayParams, image, tags};
}

export async function generateDataChangedDisplay(event: Event, parameters: Map<string, DecodedParameter>): Promise<FeedDisplay> {
  const dataKey = parameters.get('dataKey');
  let schema: Erc725ySchema, display: KeyDisplay, value: string;

  if (!dataKey) return await generateEventDisplay(event.topic.slice(0, 10), parameters);

  try {
      schema = await queryErc725ySchema(dataKey.value);
  } catch (e) {
      return await generateEventDisplay(event.topic.slice(0, 10), parameters);
  }

  try {
      display = await queryKeyDisplay(dataKey ? dataKey.value : '');
  } catch (e) {
      parameters.set(dataKey.name, {name: dataKey.name, value: schema.name, displayType: '', type: 'string'});
      return await generateEventDisplay(event.topic.slice(0, 10), parameters);
  }

  let displayParams: {[key: string]: FeedDisplayParam} = {};

  try {
    value = await queryDataKeyValueAtBlockNumber(event.address, dataKey ? dataKey.value : '', event.blockNumber);
    const decodedData = ERC725.decodeData([{value: value, keyName: schema.name}], [schema])[schema.name];
    console.log(decodedData);

    for (let word of getWordsBetweenCurlies(display.display)) {
      if (word === 'dataValue') displayParams['dataValue'] = await getDisplayParam(decodedData, schema.displayValueType ? schema.displayValueType : schema.valueType);
    }
    return {text: display.display, params: displayParams, image: '', tags: {standard: 'ERC725Y', standardType: null, copies: null}};
  } catch (e) {
    console.error('Failed to fetch the value of the key ' + dataKey + ' at the block ' + event.blockNumber + ' for the address ' + event.address);
    return {text: display.displayWithoutValue, params: displayParams, image: '', tags: {standard: null, standardType: null, copies: null}};
  }


}