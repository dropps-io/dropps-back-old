import {bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress, toBuffer} from 'ethereumjs-util';

export function generateAddressWithSignature(msg: string, signedMsg: string): string {
	// Convert nonce to hex string
	const msgHex = bufferToHex(Buffer.from(msg));

	// Check if signature is valid
	const msgBuffer = toBuffer(msgHex);
	const msgHash = hashPersonalMessage(msgBuffer);

	const signatureParams = fromRpcSig(signedMsg);
	const publicKey = ecrecover(
		msgHash,
		signatureParams.v,
		signatureParams.r,
		signatureParams.s
	);
	const addressBuffer = publicToAddress(publicKey);

	return bufferToHex(addressBuffer);
}

