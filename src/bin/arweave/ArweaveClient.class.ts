import Arweave from 'arweave';
import {JWK} from './types/JWK';
import {logMessage} from '../logger';
import {ARWEAVE_WALLET} from '../../environment/endpoints';
import {ENV} from '../../environment/config';


export class ArweaveClient {
	protected readonly _urlPrefix = 'ar://';
	protected readonly _provider;
	protected readonly _wallet;
	public readonly ARID = 5632;

	constructor () {
		this._provider = Arweave.init({
			host: 'arweave.net',
			port: 443,
			protocol: 'https'
		});
		this._wallet = ARWEAVE_WALLET;
	}

	get urlPrefix(): string {
		return this._urlPrefix;
	}

	get wallet(): JWK{
		return this._wallet;
	}

	get address():Promise<string> {
		return this._provider.wallets.getAddress(this._wallet);
	}


	public async upload(data: Buffer, contentType: string): Promise<string> {
		if (ENV === 'test') return 'transactionid';
		const tx = await this._provider.createTransaction({
			data: data
		}, (await this._wallet));
		// Add Tags if there are any
		tx.addTag('App-Name', 'Lookso');
		tx.addTag('Content-Type', contentType);

		// Sign
		await this._provider.transactions.sign(tx, this._wallet);
		const response = await this._provider.transactions.post(tx);

		switch (response.status) {
		case 200:
			logMessage('Transaction ' + tx.id + ' submitted successfully');
			return tx.id;
		default:
			throw new Error('uploadPost: Failed to upload post data');
		}
	}

	public async downloadJson(txId:string) {
		const response = await fetch(`https://arweave.net/${txId}`);
		switch (response.status) {
		case 200:
			try {
				return response.json();
			} catch (err: any) {
				throw new Error(`https://arweave.net/${txId}`+': Not a valid JSON object');
			}
		case 400 | 404:
			throw new Error(`https://arweave.net/${txId}`+': Unable to download. Transaction not found');
		default:
			throw new Error(`https://arweave.net/${txId}`+': Unknown response code');
		}
	}

	public async downloadImage(txId:string) {
		const response = await fetch(`https://arweave.net/${txId}`);
		switch (response.status) {
		case 200:
			try {
				return await response.json();
			} catch (err: any) {
				throw new Error(`https://arweave.net/${txId}`+': Not a valid JSON object');
			}
		case 400 | 404:
			throw new Error(`https://arweave.net/${txId}`+': Unable to download. Transaction not found');
		default:
			throw new Error(`https://arweave.net/${txId}`+': Unknown response code');

		}
	}

	public async getTxTags(): Promise<any> {
		const response = await fetch('https://arweave.net/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query: `
                    query {
                        transactions(ids: ["ZkepadSgVoWHk-v_O9DXFMRJcIOWXxfcpftGty8QRAw"]) {
                            edges {
                                node {
                                    id
                                    tags {
                                        name
                                        value
                                    }
                                }
                            }
                        }
                    }
                `,
			})
		});
		return (await response.json()).data.transactions.edges[0].node.tags;
	}

	public async estimateCost(byteSize:number): Promise<string> {
		const response = await this._provider.api.get(`/price/${byteSize}`);
		switch (response.status) {
		case 200:
			return await this.winstonToDollar(response.data);
		default:
			throw new Error('Request failed: estimateCost');
		}
	}

	private async winstonToDollar(valueInWinston: string): Promise<string> {
		return this.arToDollar(this._provider.ar.winstonToAr(valueInWinston));
	}
    
	private async arToDollar (valueInAR: string): Promise<string> {
		const headers = new Headers({'X-CMC_PRO_API_KEY':'b3042fe3-7f38-4787-847e-b72fa17657b0'});

		let response:any = {};
		try {
			response = await fetch(`https://pro-api.coinmarketcap.com/v2/tools/price-conversion?amount=${valueInAR}&id=${this.ARID}`, {headers});
		} catch (error: any) {
			return error.message? error.message :  'Error: Unable to convert to arToDollar';
		}
		return (await response.json()).data.quote.USD.price;
	}
    
    
}