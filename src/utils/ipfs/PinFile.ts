
import { HeliaLibp2p } from "helia";
import { CID } from "multiformats";

export function PinFile(ipfshash: string, helia: HeliaLibp2p<any> | null) {
    try {
        const cidObj = CID.parse(ipfshash);
        if (!helia) return
        helia.pins.add(cidObj)
    } catch (error) {
        console.log(error);
    }
}