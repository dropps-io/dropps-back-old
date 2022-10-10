import {Link, MetadataAsset, MetadataImage} from "../../../models/types/metadata-objects";

export interface ContractFullMetadata {
  name: string;
  symbol: string,
  description: string;
  isNFT: boolean;
  links: Link[];
  tags: string[];
  profileImage: MetadataImage[];
  backgroundImage: MetadataImage[];
  images: MetadataImage[];
  assets: MetadataAsset[];
  avatar?: MetadataAsset;
}