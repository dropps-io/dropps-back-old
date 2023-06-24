export type SocialRegistry = {
    posts: {url: string, hash: string}[],
    follows: string[],
    likes: { url: string, hash: string }[]
}