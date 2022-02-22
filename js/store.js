class Store {
    constructor(ipfs,web3,bytecode){
        this.Ipfs = ipfs
        this.Web3 = web3
        this.ByteCode = bytecode    
    }
    async init(){
        this.Accounts = await this.Web3.eth.getAccounts();
        await this.createNode()
        await this.createContract()
        this.onReady()
    }
    async createNode(){
        this.Node = await this.Ipfs.create();
    }
    async createContract(){
        this.Contract =  await new this.Web3.eth.Contract(
            this.ByteCode.abi,
            '0x9a189876a351ebc0D21a14a9fEADBFdD1F16DceC'
        )
    }
}

if (typeof web3 !== "undefined")  web3 = new Web3(web3.currentProvider);
else web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:5500"));

const BlogStore = new Store(window.Ipfs,web3, MicroBlogging)
