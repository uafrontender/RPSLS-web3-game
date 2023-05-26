/* types & interfaces */
export type moveKey = keyof typeof moves
export type IAddress = number | `0x${string}` | undefined
export type INumber = number | undefined

  
//enum Move {Null, Rock, Paper, Scissors, Spock, Lizard}
export const moves = {
    'Rock': 1,
    'Paper': 2,
    'Scissors': 3,
    'Spock': 4,
    'Lizard': 5
}