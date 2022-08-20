import { SocialRegistry } from "./types/social-registry";

export class Registry {

    protected _posts: {url: string, hash: string}[]
    protected _follows: string[];
    protected _likes: string[];

    constructor(registryJson?:SocialRegistry) {
        if (registryJson) {
            this._posts = registryJson.posts;
            this._follows = registryJson.follows;
            this._likes = registryJson.likes;
        } else {
            this._posts = [];
            this._follows = [];
            this._likes = [];
        }
    }

    set posts(posts: {url:string, hash:string}[]) {
        this._posts = posts;
    }

    set follows(follows:string[]) {
        this._follows = follows;
    }

    set likes(likes:string[]) {
        this._likes = likes;
    }

    get posts():{url:string, hash:string}[] {
        return this._posts;
    }

    public addPost(url: string, hash: string) {
        this._posts.push({url, hash});
    }

    public addFollow(address:string) {
        this._follows.push(address)
    }

    public addLike(contentHash:string) {
        this._likes.push(contentHash)
    }

    public toJson(): SocialRegistry{
        return { 
            posts: this._posts,
            follows: this._follows,
            likes: this._likes,
        }
    }

    public toData(): Buffer {
        return Buffer.from(JSON.stringify(this.toJson()));
    }

    public byteSize(): number {
        return new TextEncoder().encode(this.toData().toString()).length;
    }
}