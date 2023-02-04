import { SiweMessage } from 'siwe';

import { FRONT_URL } from '../../../../environment/config';

export const createSiweMessage = (
  address: string,
  issuedAt: string,
  path: string,
  nonce: string,
) => {
  return new SiweMessage({
    domain: FRONT_URL.split('//')[1],
    address,
    statement: 'Welcome to LOOKSO!',
    uri: FRONT_URL + path,
    version: '1',
    chainId: 2828, // For LUKSO L16
    nonce,
    issuedAt,
  }).prepareMessage();
};
