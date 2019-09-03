#!/usr/bin/env node
import fs from 'fs';
import {start, getBashStubs} from '../';

async function main() {
    try {
        const [, , mode, jsFile, bashCoprocName] = process.argv;
        switch(mode) {
            case 'coproc': 

                const input = fs.createReadStream('', {fd: 3});
                input.pause();
                const output = fs.createWriteStream('', {fd: 4});

                const commands = require(jsFile).default;

                output.write(await getBashStubs(bashCoprocName, commands));

                await start({
                    commands,
                    input,
                    output
                });
                break;

            case 'bootstrap':
                console.log(`
                    # Launch coprocess
                    {
                        coproc ${bashCoprocName} { bash-node-ipc coproc ${ jsFile } ${ bashCoprocName }; } 3<&0 4>&1 0<&5 1>&6
                    } 5<&0 6>&1
                    # Read stubs from coprocess, then eval them
                    bash_node_ipc_stubs=''
                    while IFS='' read -r -d $'\n' bash_node_ipc_stub_line
                    do
                        [[ "$bash_node_ipc_stub_line" != "EOF" ]] || break
                        bash_node_ipc_stubs+="$bash_node_ipc_stub_line"$'\\n'
                    done <&"\${node_coproc[0]}"
                    eval "$bash_node_ipc_stubs"
                `);
                break;
            default:
                throw new Error(`Unexpected mode ${mode}`);
        }
    } catch(e) {
        console.error('Unhandled error in bash-node-ipc main(): ' + e);
    } finally {
        fs.closeSync(0);
        fs.closeSync(1);
        fs.closeSync(2);
        // fs.closeSync(3);
        fs.closeSync(4);
    }
}

main();
