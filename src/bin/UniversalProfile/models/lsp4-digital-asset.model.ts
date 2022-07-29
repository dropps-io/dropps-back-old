import {Link, MetadataAsset, MetadataImage} from '../../../models/types/metadata-objects';

export interface LSP4DigitalAsset {
    name: string,
    symbol: string,
    metadata: LSP4DigitalAssetMetadata
}

export interface LSP4DigitalAssetMetadata {
    description: string;
    links: Link[];
    icon: MetadataAsset;
    images: MetadataImage[];
    assets: MetadataAsset[];
}

export function initialDigitalAssetMetadata(): LSP4DigitalAssetMetadata {
    return {
        description: '',
        links: [],
        icon: {
            url: '',
            hash: '',
            hashFunction: '',
            fileType: ''
        },
        images: [],
        assets: []
    };
}
