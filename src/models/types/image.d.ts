export type ImageType = 'profile' | 'background' | 'icon' | '';

export interface Image {
    address: string;
    url: string;
    width: number;
    height: number;
    type: ImageType;
    hash: string
}