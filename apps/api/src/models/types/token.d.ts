import { Link } from './metadata-objects';

export interface Token {
  tokenId: string;
  decodedTokenId: string;
  name: string;
  image: string;
  description: string;
  links: Link[];
}
