import NodeBundlr from "@bundlr-network/client";
import { FundData } from "@bundlr-network/client/build/common/types";
import {ARWEAVE_WALLET} from "../../environment/endpoints";
import {ENV} from "../../environment/config";

export class BundlrClient {
    protected readonly _provider;
    protected readonly _urlPrefix = "ar://";
    
    constructor () {
        this._provider = new NodeBundlr("http://node1.bundlr.network", "arweave", ARWEAVE_WALLET);
    }

    get urlPrefix(): string {
        return this._urlPrefix;
    }

    get address():string {
        return this._provider.address;
    }

    public async upload(data: Buffer, contentType: string): Promise<string> {
        if (ENV === 'test') return 'transactionid';

        // Add Tags if there are any
        const tags = [
            {name: "App-Name", value:"Lookso"},
            {name: "Content-Type", value: contentType},
        ] 
        const transaction = this._provider.createTransaction(data, {tags: tags});
        // Sign
        await transaction.sign();
        const response = await transaction.upload();
        return response.data.id;
    }

    public async balanceInWinston(): Promise<string> {
        return (await this._provider.getLoadedBalance()).toFixed();
    }

    public async estimateCostInWinston(byteSize:number): Promise<string> {
        return (await this._provider.getPrice(byteSize)).toFixed();
    }

    // Transfers AR between our Arweave account and the Node's
    // response:FundData = {
    //     id, // the txID of the fund transfer
    //     quantity, // how much is being transferred
    //     reward, // the amount taken by the network as a fee
    //     target // the address the funds were sent to
    // }
    public async fund(amountInWinston:string):Promise<FundData> { 
        return await this._provider.fund(amountInWinston);
    }

    // Transfers AR between the Node's account and our own
    public async withdraw(amountInWinston:string):Promise<any> { // Promise<AxiosResponse> would be the correct type, but I'm getting an error
        return await this._provider.withdrawBalance(amountInWinston);
    }


}