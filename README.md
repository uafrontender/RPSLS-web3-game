Rock Paper Scissor Lizard Spock Game

![My Image](/public/scnshot.png)

# Getting Started

Created as a submission for Kleros Technical Round, not intended for public usage.

Run `yarn` then `yarn dev` in your terminal, and then open [localhost:3000](http://localhost:3000) in your browser. Note that `RPS.sol` is compiled into ABI and bytecode after the dependencies installation using `postinstall` hook.

The game runs on the `Goerli` Network.

Live at [rps-lizard-spock.vercel.app](https://rps-lizard-spock.vercel.app/)


# Salt Generation Rationale and Criteria
This game is based on commit&reveal cryptographic scheme, where the deployer (game initiator) commits his move choice digest (as a hash) for concealing his choice on-chain, after the counter-party picks a known move. The deployer needs to send his move hash pre-image to solve the game for both parties. The pre-image of this game is made from a `move` and a `salt`.

A completely random salt can be directly picked by the deployer from the range `[0 -> 2^256-1]`, and be memorized later for reveal phase. This process can be unsecure (in case of guessable small digit salt) or secure but hard to memorize, or store which is also potentially dangerous through the means of being lost or stolen.

A better solution for providing a better user experience while preserving player security over his staked assets, and in order for `salt` to be cryptographically secure it need to meet the below criteria: 
- Be derived from a secret only known to the user, we assume the deployer `private key` is only known to him.
- Be deterministic - contain intuitive or memorable constants like `move`. (can be stored safely in the client)
- Be Unique for each game by adding some game specific nonce - `game address` can be good for uniqueness.


## Salt Generation Algorithm
Salt in this game is the unsigned numerical representation of the hash of a message signed using deployer private key, the message consists of arbitrary fixed words + game address and player chosen move in that particular game. The salt is generated using the below algorithm:

1. Player choose a `move` from 1 to 5.
2. `account_nonce = Account total transactions`.
3. To be deployed contract (game contract) address is determined using `keccak256(rlp([sender, account_nonce]))`.
4. User sign this message using his private key `I'm signing that my hand is [move] for the game $[gameAddress]`.
5. Signed message is hashed using `Keccak256`.
6. Hash is numerically represented using unsiged256 representation.


# What is the Mixed strategy Nash equilibria of this game?

In the game of RPSSL (Rock Paper Scissor Spock Lizard) the outcome of the game is represented below:
- Rock beats Lizard and Scissors
- Paper beats Rock and Spock
- Scissors beats Paper and Lizard
- Spock beats Scissors and Rock
- Lizard beats Spock and Paper


## Payoff Matrix of RPSSL 
In order to know if there is a mixed strategy nash equilibria for this game (and what it is), we need to first see it's payoff matrix to see If there's pure strategies/dominant strategy.

When we represent it's payoff matrix it becomes like this: 

| Player1/Player2 |  Rock   |  Paper  | Scissors |  Spock  |  Lizard |
|-----------------|---------|---------|----------|---------|---------|
| Rock            |   0,0   |  -1,1   |   1,-1   |  -1,1   |   1,-1  |
| Paper           |   1,-1  |   0,0   |  -1,1    |   1,-1  |  -1,1   |
| Scissors        |  -1,1   |   1,-1  |   0,0    |  -1,1   |   1,-1  |
| Spock           |   1,-1  |  -1,1   |   1,-1   |   0,0   |  -1,1   |
| Lizard          |  -1,1   |   1,-1  |  -1,1    |   1,-1  |   0,0   |

When we look at the matrix, we conclude that:

- There is no dominant strategy for any player in this matrix. As there is no single action that guarantees a player the highest payoff regardless of the opponent's choice.
- For the above matrix, with no player guessing or knowing the probabilities of other player choices, There is no pure strategy equilibria.

## Mixed strategy nash equilibria is playing `1/5` each hand

To determine the mixed strategy Nash equilibrium for this game, we can assign probabilities to each action that players can take. In a mixed strategy, players randomize their choices based on these probabilities.

Assuming both players are rational and have perfect knowledge of the game, and their counter player choice is completely unknowm to them(completely randomized), the mixed strategy Nash equilibrium is achieved when each player selects their actions with equal probabilities. This means that each action has a probability of `1/5` of being chosen.

Therefore, the mixed strategy Nash equilibrium is the probability of `1/5` for playing each hand. This can potentially increase a player's expected payoffs.

If the player can recongize a pattern or knows the other player, he can assign different probabilities to the payoff matrix to find a pure strategy to follow.





