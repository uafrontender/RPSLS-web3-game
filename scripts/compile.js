const fs = require('fs')
const solc = require('solc')
var path = require("path")

const contractPath = path.resolve(__dirname, "../src/contracts", "RPS.sol")
const artifactPath = path.resolve(__dirname, "../src/contracts", "RPS.json")

function main() {
  const source = fs.readFileSync(contractPath, "utf8")
  const artifact = solc.compile(source.toString(), 1)

  const bytecode = artifact.contracts[":RPS"].bytecode
  const abi = JSON.parse(artifact.contracts[":RPS"].interface)

  // Writes the abi and bytecode to the artifact file
  fs.writeFileSync(artifactPath, JSON.stringify({ abi, bytecode }, null, 2))
}
 
main()