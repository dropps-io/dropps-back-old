export interface FeedPost {
  hash: string,
  author:
    {
      address: string,
      name: string,
      image: string
    },
  type: 'event' | 'post',
  name: string,
  date: Date,
  blockNumber: number,
  transactionHash: string,
  display: FeedDisplay,
  likes: number,
  comments: number,
  reposts: number,
  isLiked: boolean,
  inRegistry?: boolean,
  childPost?: FeedPost
}

export interface FeedDisplay {
  text: string,
  params: {[key: string]: FeedDisplayParam},
  image: string,
  tags: {standard: string | null, copies: string | null, standardType: string | null}
}

export interface FeedDisplayParam {
  value: string,
  display: string,
  type: string,
  additionalProperties: any;
}