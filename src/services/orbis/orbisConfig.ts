import { OrbisDB } from "@useorbis/db-sdk";

console.log('Initializing OrbisDB...');
export const db = new OrbisDB({
    ceramic: {
        gateway: "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/"
    },
    nodes: [
        {
            gateway: "https://studio.useorbis.com",
            env: "did:pkh:eip155:1:0x25b4048c3b3c58973571db2dbbf87103f7406966"
        }
    ]
});
