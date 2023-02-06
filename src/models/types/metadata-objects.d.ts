export interface Link {
  title: string;
  url: string;
}

export interface MetadataImage {
  width: number;
  height: number;
  hashFunction: string;
  hash: string;
  url: string;
}

export interface MetadataAsset {
  hashFunction: string;
  hash: string;
  url: string;
  fileType: string;
}
