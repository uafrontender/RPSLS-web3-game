import { Address } from "wagmi"

export const formatAddress = (address: Address) : string | 0 => {
    return address?.toString().substring(0, 11) + '...' + address?.toString().substring(address.toString().length - 6)
}