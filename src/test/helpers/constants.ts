import {generateJWT} from "../../bin/json-web-token";
import {SocialRegistry} from "../../bin/lookso/registry/types/social-registry";

export const UNIVERSAL_PROFILE_1 = '0xA5284665954a54d12737Da405824160cCE05B0B0';
export const UNIVERSAL_PROFILE_2 = '0xB1a2B3518c30Eb82bb18Fe75456e83B692A75FFa';
export const UNIVERSAL_PROFILE_3 = '0xB1a2B3518c30Eb82bb18Fe75456e83B692A75FFb';

export const HACKER_MAN_UP = '0x8E3772C0f495953FdA17bb89e68f2a2da18556A4';
export const HACKER_MAN_UP_CLOSE_ADDRESS = '0x8E3772C0f495953FdA17bb89e68f2a2da0dF2714';
export const SERIOUS_MAN_UP = '0x7741002f573940488265c8b676EE236FC0dF2714';
export const UNIT_TEST_UP = '0xb09Ce58C06Bd4e7a282b8e7F6c93981B2c107D24';

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
  posts: [
    {
      url: "ar://JQX12AnTIXF0XRa-PrP_HrMSWKPK27VhcOQy_v1NK4s",
      hash: "0xa45bd3209e9d20732f8c2ee58228621cd481723e12b791391404842353f0643d"
    },
    {
      url: "ar://Say4JONkYPXt7lycWxVRWj-VMAYRtPtzGf2FuMMVIBA",
      hash: "0x36db447f03b9d0888e0bb2677584cacb343c74ccbb4e22577aa4d1c185e37d72"
    },
    {
      url: "ar://t_3sxpRuvXuDar7G7AnY-sIGfWs4JjtYNJxsZrKiTLM",
      hash: "0xe63a9f69b2085f1ec27de48bc93941fd9d2f06e5982c57190a27cba4c6cd4a1f"
    },
    {
      url: "ar://6QCcu06r_6_qvcIjMPoaWbMtQ9QIRhDrUT29YR4Lk3Q",
      hash: "0xcc386bae78f0df9020dee579f43d1d035ad5f6ebdb246b8cabec1ede8075c4cd"
    },
    {
      url: "ar://LMlIOFw5yO08rretX73XzxgEIMfYtq-GzKdGg2Izp-0",
      hash: "0x2f6de8865ad7f3b4c79cf25c08aa53139f0ba2198f5793e313d8087f8614fe4c"
    },
    {
      url: "ar://lMcz9ywZjUo0RgsRWelb6ksx2Db37wwlSpiRHrO19sw",
      hash: "0x06f4c5b3bce9ada506d1af34c68c7a1e7c81d4814f45dd034321c526742a6a15"
    },
    {
      url: "ar://hFr-4EyDGZYeeBhyHmNIRJ5CcGrgUxniajtyF0uB1GY",
      hash: "0xcbb1f595004056835fffd769ba4b25f760bb2772c14c93ec47c125acbe033126"
    },
    {
      url: "ar://eBlCzaj_HQHJEuCBfurMPtWyY94GhiNqV9e_MXh-qg4",
      hash: "0x988c77b96a2d92466f0c74dd94de2ae4b19cd6383184b517c292f991c4d6f67a"
    },
    {
      url: "ar://MlbvVLtrTEa-705Kd9jKFeTSXVAh0pJy-PYlUmZjN1o",
      hash: "0x04b270db98fd082d86c725a20f316c911e24062d45478af77eb3c878a92dace8"
    },
    {
      url: "ar://c4SeS_ONSc88zj8NXfjs7agX9PYa-XiFiAOI9mEmy5w",
      hash: "0x40b0a03db0b19d0b95e3d4cbe1003bddd7ded5ffe625a70c8cd83011db7a7925"
    }
  ],
  likes: [
    "0xb08e8b46c770b822012c2c984f5220d63e868c3cff471a54a21c302c27d4ddec",
    "0x9d6d663af9a4b6c2bc56ed91b90a57b8ad13bf330500b00993a4f6887bc392c4",
    "0x8c20c526a9e352a65f137b17e78b6afa3f30956712f7a9fc6c4a451aa50a0b28",
    "0xd719d60cdbedb7457944c1d50b6fd123a46984c8fdf96fee2473b4dcda9b11b9"
  ],
  follows: [
    "0x83D1C029846cB8AC418C57B025f79D23ca2820Ef",
    "0x315CA7ED08927f483D76042b1F64866Ba9805710",
    "0xf690b19c4A631FeD032e5367C54E3c350CB9BD38"
  ]
}