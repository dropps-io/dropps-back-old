import {Link} from "../../../../models/types/metadata-objects";

export type LSPXXProfilePost = {
  version: string,
  author: string, // Address (UP)
  eoa: string,
  message: string,
  links: Link[],
  asset?: {
    hashFunction: 'keccak256(bytes)',
    hash: string,
    url: string,
    fileType: string
  },
  parentHash?: string,
  childHash?: string
}

export type ProfilePost = {
  LSPXXProfilePost: LSPXXProfilePost
  LSPXXProfilePostHash: string,
  LSPXXProfilePostEOASignature?: string,
}