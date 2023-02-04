import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import { URLDataWithHash } from '@erc725/erc725.js/build/main/src/types/encodeData/JSONURL';
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import axios from 'axios';
import { AbiItem } from 'web3-utils';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';
import Web3 from 'web3';

import { DecodedParameter } from '../../../models/types/decoded-parameter';
import { MethodDisplayTable } from '../../../models/types/tables/method-display-table';
import { queryMethodDisplay } from '../../db/method-display.table';
import { getWordsBetweenCurlies } from '../../utils/words-between-curlies';
import { getDisplayParam } from './display-params';
import { queryContract } from '../../db/contract.table';
import { queryContractIsNFT } from '../../db/contract-metadata.table';
import { insertImage, queryImages } from '../../db/image.table';
import { queryMethodParameterDisplayType } from '../../db/method-parameter.table';
import { FeedDisplay, FeedDisplayParam } from '../../../models/types/feed-post';
import { selectImage } from '../../utils/select-image';
import { EventTable } from '../../../models/types/tables/event-table';
import { KeyDisplayTable } from '../../../models/types/tables/key-display-table';
import { queryKeyDisplay } from '../../db/key-display.table';
import { queryErc725ySchema } from '../../db/erc725y-schema.table';
import { Erc725ySchema } from '../../../models/types/erc725y-schema';
import { formatUrl } from '../../utils/format-url';
import { web3 } from '../../web3/web3';
import { LSP4DigitalAsset } from '../../UniversalProfile/models/lsp4-digital-asset.model';
import { MetadataImage } from '../../../models/types/metadata-objects';
import { IPFS_GATEWAY } from '../../../environment/config';
import {
  TYPEID_LSP7_TOKENSRECIPIENT,
  TYPEID_LSP7_TOKENSSENDER,
  TYPEID_LSP8_TOKENSRECIPIENT,
  TYPEID_LSP8_TOKENSSENDER,
} from '../../utils/constants';
import { logError } from '../../logger';
import { decodeKeyHash } from '../../erc725/decodeKeyHash';

export async function generateEventDisplay(
  methodId: string,
  params: Map<string, DecodedParameter>,
  context?: { senderProfile?: string; executionContract?: string },
): Promise<FeedDisplay> {
  const methodDisplay: MethodDisplayTable = await queryMethodDisplay(methodId);
  const tags: { standard: string | null; copies: string | null; standardType: string | null } = {
    standard: null,
    copies: null,
    standardType: null,
  };
  let image = '';
  const displayParams: { [key: string]: FeedDisplayParam } = {};

  if (!methodDisplay) throw 'Unknown function';

  for (const word of getWordsBetweenCurlies(methodDisplay.text)) {
    const param = params.get(word);
    if (param) {
      const displayType = await queryMethodParameterDisplayType(methodId, param.name);
      displayParams[param.name] = await getDisplayParam(
        param.value,
        displayType ? displayType : param.type,
      );
    } else if (context?.senderProfile && word === 'senderProfile')
      displayParams['senderProfile'] = await getDisplayParam(context.senderProfile, 'address');
    else if (context?.executionContract && word === 'executionContract')
      displayParams['executionContract'] = await getDisplayParam(
        context.executionContract,
        'address',
      );
    else if (word === 'nativeToken')
      displayParams['nativeToken'] = {
        value: 'LYXt',
        display: 'LYXt',
        type: 'string',
        additionalProperties: {},
      };
  }

  if (methodDisplay.standardFrom) {
    const param = params.get(methodDisplay.standardFrom);
    let address = '';
    if (param) address = param.value;
    else if (methodDisplay.standardFrom === 'senderProfile' && context?.senderProfile)
      address = context.senderProfile;
    else if (methodDisplay.standardFrom === 'executionContract' && context?.executionContract)
      address = context.executionContract;

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
    let address = '';
    if (param) address = param.value;
    else if (methodDisplay.imageFrom === 'senderProfile' && context?.senderProfile)
      address = context.senderProfile;
    else if (methodDisplay.imageFrom === 'executionContract' && context?.executionContract)
      address = context.executionContract;

    if (address) {
      image = await fetchImageFromAddress(address, tags.standard ? tags.standard : '');
    }
  }
  return { text: methodDisplay.text, params: displayParams, image, tags };
}

export async function generateDataChangedDisplay(
  event: EventTable,
  parameters: Map<string, DecodedParameter>,
): Promise<FeedDisplay> {
  const dataKey = parameters.get('dataKey');
  const dataValue = parameters.get('dataValue');
  let schema: Erc725ySchema, display: KeyDisplayTable;

  if (!dataKey) return await generateEventDisplay(event.topic.slice(0, 10), parameters);

  try {
    schema = await queryErc725ySchema(dataKey.value);
  } catch (e) {
    return await generateEventDisplay(event.topic.slice(0, 10), parameters);
  }

  try {
    display = await queryKeyDisplay(dataKey ? dataKey.value : '');
  } catch (e) {
    if (!dataValue) return await generateEventDisplay(event.topic.slice(0, 10), parameters);
    parameters.set(dataKey.name, {
      name: dataKey.name,
      value: schema.name,
      displayType: '',
      type: 'string',
    });
    parameters.set('dataValue', { ...dataValue, type: schema.valueType });

    if (schema.key !== dataKey.value && schema.keyType === 'Array') {
      parameters.set(dataKey.name, {
        name: dataKey.name,
        value:
          schema.name.slice(0, schema.name.length - 1) +
          web3.utils.toNumber(dataKey.value.slice(34)).toString() +
          ']',
        displayType: '',
        type: 'string',
      });
    } else if (schema.key === dataKey.value && schema.keyType === 'Array' && dataValue) {
      parameters.set('dataValue', {
        ...dataValue,
        value: web3.utils.toNumber(dataValue.value).toString(),
        type: 'number',
      });
    }
    return await generateEventDisplay(event.topic.slice(0, 10), parameters);
  }

  const displayParams: { [key: string]: FeedDisplayParam } = {};

  for (const dynamicPart of decodeKeyHash(dataKey.value, schema)) {
    displayParams[dynamicPart.type] = await getDisplayParam(
      dynamicPart.value.toString(),
      dynamicPart.type,
    );
  }

  if (dataValue) {
    for (const word of getWordsBetweenCurlies(display.display)) {
      if (word === 'dataValue')
        displayParams['dataValue'] = await getDisplayParam(
          dataValue.value,
          schema.valueDisplay ? schema.valueDisplay : schema.valueType,
        );
    }

    return {
      text: display.display,
      params: displayParams,
      image: '',
      tags: { standard: 'ERC725Y', standardType: null, copies: null },
    };
  } else {
    logError(
      'Failed to fetch the value of the key ' +
        dataKey.value +
        ' at the block ' +
        event.blockNumber +
        ' for the address ' +
        event.address,
    );
    return {
      text: display.displayWithoutValue,
      params: displayParams,
      image: '',
      tags: { standard: null, standardType: null, copies: null },
    };
  }
}

export async function generateUniversalReceiverEventDisplay(
  params: Map<string, DecodedParameter>,
): Promise<FeedDisplay> {
  try {
    const displayParams: { [key: string]: FeedDisplayParam } = {};
    const assetAddress = params.get('from');
    const typeId = params.get('typeId');
    const receivedData = params.get('receivedData');
    if (!assetAddress || !typeId || !receivedData)
      return {
        text: 'Universal receiver triggered',
        params: {},
        image: '',
        tags: { copies: '', standardType: '', standard: '' },
      };
    displayParams['asset'] = await getDisplayParam(assetAddress.value, 'address');

    switch (typeId.value) {
      case TYPEID_LSP7_TOKENSRECIPIENT:
        return await getUniversalReceiverDisplayForLSP7(
          assetAddress.value,
          receivedData.value,
          displayParams,
          'recipient',
        );
      case TYPEID_LSP7_TOKENSSENDER:
        return await getUniversalReceiverDisplayForLSP7(
          assetAddress.value,
          receivedData.value,
          displayParams,
          'sender',
        );
      case TYPEID_LSP8_TOKENSRECIPIENT:
        return await getUniversalReceiverDisplayForLSP8(
          assetAddress.value,
          receivedData.value,
          displayParams,
          'recipient',
        );
      case TYPEID_LSP8_TOKENSSENDER:
        return await getUniversalReceiverDisplayForLSP8(
          assetAddress.value,
          receivedData.value,
          displayParams,
          'sender',
        );
      default:
        return {
          text: 'Universal receiver triggered',
          params: {},
          image: '',
          tags: { copies: '', standardType: '', standard: '' },
        };
    }
  } catch (e) {
    logError(e);
    return {
      text: 'Universal receiver triggered',
      params: {},
      image: '',
      tags: { copies: '', standardType: '', standard: '' },
    };
  }
}

async function getUniversalReceiverDisplayForLSP7(
  assetAddress: string,
  receivedData: string,
  displayParams: any,
  type: 'sender' | 'recipient',
) {
  const from = web3.utils.toChecksumAddress(receivedData.slice(2, 42));
  const to = web3.utils.toChecksumAddress(receivedData.slice(42, 82));
  const amount = parseInt(receivedData.slice(82, 146), 16).toString();

  const lsp7contract = new web3.eth.Contract(LSP7DigitalAsset.abi as AbiItem[], assetAddress);
  const isNFT: boolean = (await lsp7contract.methods.decimals().call()) === '0';

  if (isNFT)
    displayParams['amount'] = {
      type: 'uint256',
      value: amount,
      display: amount,
      additionalProperties: {},
    };
  else
    displayParams['amount'] = {
      type: 'tokenAmount',
      value: amount,
      display: Web3.utils.fromWei(amount, 'ether'),
      additionalProperties: {},
    };
  displayParams['from'] = await getDisplayParam(from, 'address');
  displayParams['to'] = await getDisplayParam(to, 'address');

  return {
    text:
      type === 'recipient'
        ? 'Received {amount} {asset} from {from}'
        : 'Sent {amount} {asset} to {to}',
    params: displayParams,
    image: await fetchImageFromAddress(assetAddress, 'LSP7'),
    tags: { copies: '', standardType: isNFT ? 'NFT' : 'token', standard: 'LSP7' },
  };
}

async function getUniversalReceiverDisplayForLSP8(
  assetAddress: string,
  receivedData: string,
  displayParams: any,
  type: 'sender' | 'recipient',
) {
  const from = web3.utils.toChecksumAddress(receivedData.slice(2, 42));
  const to = web3.utils.toChecksumAddress(receivedData.slice(42, 82));
  const tokenId = receivedData.slice(82, 146);

  displayParams['tokenId'] = {
    type: 'bytes32',
    value: tokenId,
    display: tokenId,
    additionalProperties: {},
  };
  displayParams['from'] = await getDisplayParam(from, 'address');
  displayParams['to'] = await getDisplayParam(to, 'address');

  return {
    text:
      type === 'recipient'
        ? 'Received token {tokenId} of {asset} from {from}'
        : 'Sent token {tokenId} of {asset} to {to}',
    params: displayParams,
    image: await fetchImageFromAddress(assetAddress, 'LSP8'),
    tags: { copies: '', standardType: 'NFT', standard: 'LSP8' },
  };
}

async function tryInsertingImages(address: string, images: MetadataImage[]) {
  for (const image of images) {
    await insertImage(address, image.url, image.width, image.height, '', image.hash);
  }
}

async function fetchImageFromAddress(address: string, standard: string): Promise<string> {
  try {
    let pickedImage = selectImage(await queryImages(address), { minWidthExpected: 100 });
    let image = pickedImage ? pickedImage.url : '';

    if (image === '' && (standard === 'LSP7' || standard === 'LSP8')) {
      try {
        const erc725Y = new ERC725(
          LSP4DigitalAssetJSON as ERC725JSONSchema[],
          address,
          web3.currentProvider,
          { ipfsGateway: IPFS_GATEWAY },
        );
        const metadataData = await erc725Y.getData('LSP4Metadata');
        const url = formatUrl((metadataData.value as URLDataWithHash).url);
        const lsp4Metadata: LSP4DigitalAsset = (await axios.get(url, { timeout: 300 })).data;
        if (lsp4Metadata.metadata.images.length > 0) {
          tryInsertingImages(
            address,
            lsp4Metadata.metadata.images.flat().concat(lsp4Metadata.metadata.icon),
          );
          pickedImage = selectImage(await queryImages(address), { minWidthExpected: 100 });
          image = pickedImage ? pickedImage.url : '';
        }
      } catch (e) {}
    }
    return image;
  } catch (e) {
    return '';
  }
}
