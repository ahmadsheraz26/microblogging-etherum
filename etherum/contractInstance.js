import web3 from "./web3";
import MicroBlogging from './build/MicroBlogging.json'

const instance = new web3.eth.Contract(
    MicroBlogging.abi,
    '0x9a189876a351ebc0D21a14a9fEADBFdD1F16DceC'
)
export default instance