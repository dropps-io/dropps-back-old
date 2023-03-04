import { Link, MetadataAsset, MetadataImage } from '../../api/src/models/types/metadata-objects';

export interface ContractFullMetadata {
  name: string;
  symbol: string;
  description: string;
  isNFT: boolean;
  links: Link[];
  tags: string[];
  profileImage: MetadataImage[];
  backgroundImage: MetadataImage[];
  images: MetadataImage[];
  icon: MetadataImage[];
  assets: MetadataAsset[];
  avatar?: MetadataAsset;
}
