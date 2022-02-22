const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

// Compiled Directory
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

//Getting contract code
const MicroBloggingContractPath = path.resolve(__dirname, "contracts", "MicroBlogging.sol");
const source = fs.readFileSync(MicroBloggingContractPath, "utf8");

//Compile contract
const input = {
    language: 'Solidity',
    sources: {
      'MicroBlogging': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts.MicroBlogging;

//Save compiled version of contract in build path
fs.ensureDirSync(buildPath);
for (let contract in output) {
    console.log(contract)
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}
