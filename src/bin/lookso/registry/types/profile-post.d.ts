import {Link} from '../../../../models/types/metadata-objects';

export type LSP19ProfilePost = {
  version: string,
  author: string, // Address (UP)
  locale?: string, // language code - Country Code (de_DE)
  app?: string, // The platform that originated this post
  validator: string,
  nonce: string,
  message: string,
  links?: Link[],
  tags?: string[],
  medias?: {
    hashFunction: 'keccak256(bytes)',
    hash: string,
    url: string,
    fileType: string
  }[],
  assets?: {interface: string, contract: string, tokenId?: string | null}[]
  parentPost?: {
    url: string,
    hash: string
  },
  childPost?: {
    url: string,
    hash: string
  }
}

export type ProfilePost = {
  LSP19ProfilePost: LSP19ProfilePost
  LSP19ProfilePostHash: string,
  LSP19ProfilePostSignature?: string
}