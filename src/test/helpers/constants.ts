import {generateJWT} from "../../bin/json-web-token";
import {SocialRegistry} from "../../bin/lookso/registry/types/social-registry";

export const UNIVERSAL_PROFILE_1 = '0xA5284665954a54d12737Da405824160cCE05B0B0';
export const UNIVERSAL_PROFILE_2 = '0xB1a2B3518c30Eb82bb18Fe75456e83B692A75FFa';
export const UNIVERSAL_PROFILE_3 = '0xB1a2B3518c30Eb82bb18Fe75456e83B692A75FFb';

export const HACKER_MAN_UP = '0x8E3772C0f495953FdA17bb89e68f2a2da18556A4';
export const HACKER_MAN_UP_CLOSE_ADDRESS = '0x8E3772C0f495953FdA17bb89e68f2a2da0dF2714';
export const SERIOUS_MAN_UP = '0x7741002f573940488265c8b676EE236FC0dF2714';
export const UNIT_TEST_UP = '0x201B8E5E3Dd6329B307B9206dd99BEF7Ac6Ff24E';

export const HACKER_MAN_JWT = generateJWT(HACKER_MAN_UP);
export const SERIOUS_MAN_JWT = generateJWT(SERIOUS_MAN_UP);
export const UNIT_TEST_UP_JWT = generateJWT(UNIT_TEST_UP);

export const POST_HASH = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3';
export const POST_HASH2 = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f2';
export const POST_HASH3 = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f4';
export const POST_HASH4 = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f5';
export const POST_HASH5 = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f6';
export const POST_HASH6 = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f7';

const UNIT_TEST_UP_REGISTRY: SocialRegistry = {
  likes: [],
  posts: [],
  follows: []
}