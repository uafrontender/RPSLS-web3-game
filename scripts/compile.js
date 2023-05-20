const fs = require('fs')
const solc = require('solc');

function main() {
    const input = fs.readFileSync('./contracts/RPS.sol');
    const output = solc.compile(input.toString(), 1);
    const bytecode = output.contracts[':RPS'].bytecode;
    const abi = JSON.parse(output.contracts[':RPS'].interface);
    fs.writeFileSync('./contracts/RPS.json', JSON.stringify({abi, bytecode}, null, 2));
    fs.writeFileSync('../src/ABI/RPS.json', JSON.stringify({abi}));
}
 
main();