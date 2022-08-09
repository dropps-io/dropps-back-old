import {Image} from "./image";

export interface FeedPost {
  author:
    {
      address: string,
      name: string,
      image: Image
    },
  type: 'event' | 'post',
  name: string,
  date: Date,
  blockNumber: number,
  transactionHash: string,
  display: FeedDisplay,
  likes: number,
  comments: number,
  reposts: number
}

export interface FeedDisplay {
  text: string,
  params: {[key: string]: FeedDisplayParam},
  image: Image | null,
  tags: {standard: string | null, copies: string | null, standardType: string | null}
}

export interface FeedDisplayParam {
  value: string,
  display: string,
  type: string,
  additionalProperties: any;
}