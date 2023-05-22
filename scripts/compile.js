const fs = require('fs')
const solc = require('solc')
var path = require("path")

const contractPath = path.resolve(__dirname, "../src/contracts", "RPS.sol")
const RPSArtifactPath = path.resolve(__dirname, "../src/contracts", "RPS.json")
const HasherArtifactPath = path.resolve(__dirname, "../src/contracts", "Hasher.json")

function main() {
  const source = fs.readFileSync(contractPath, "utf8")
  const artifact = solc.compile(source.toString(), 1)

  const RPSBytecode = artifact.contracts[":RPS"].bytecode
  const RPSAbi = JSON.parse(artifact.contracts[":RPS"].interface)

  const HasherBytecode = artifact.contracts[":Hasher"].bytecode
  const HasherAbi = JSON.parse(artifact.contracts[":Hasher"].interface)

  // Writes the abi and bytecode to the artifact file
  fs.writeFileSync(RPSArtifactPath, JSON.stringify({ abi: RPSAbi, bytecode: RPSBytecode }, null, 2))
  fs.writeFileSync(HasherArtifactPath, JSON.stringify({ 
    address: "0x027c97b35196704dc97c0e23a69fc2978192c519",
    abi: HasherAbi, 
    bytecode: HasherBytecode
  }, null, 2))
}
 
main()