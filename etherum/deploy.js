const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const compiledFactory = require('./build/MicroBlogging.json') 

const provider = new HDWalletProvider(
    'rack snow turkey grief sugar sea snow elephant void craft carbon napkin',
    'https://rinkeby.infura.io/v3/8074e642b8c94f0b870c83b5c5f981fe'
)
const web3 = new Web3(provider)

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account", accounts[0]);
    try {
        const result = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({data:compiledFactory.evm.bytecode.object})
        .send({gas:'3000000', from : accounts[0]})
        console.log('Contract deployed to', result.options.address);
    }catch(e){
        throw e
    }
    provider.engine.stop();
}
deploy()