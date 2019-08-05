const shellQuote = require('shell-quote');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
// terminate when bash closes the connection
process.stdin.on('closed', () => process.exit());

rl.on('line', function(line) {
    console.log(line);
});

// Read commands line-by-line from input pipe
while(const line of readAllLines()) {

  // parse command into array
  const [command, ...args] = shellQuote.parse(line);

  const result = await commands[command](...args);
  const encoded = shellQuote.quote(result).replace(/\n/g, () => `'$'\\n''`;
  
  // write encoded + trailing newline to output stream
}

const commands = {
  
};


// on the bash side of things
coproc node_slave "./node-functions.js"
function <commandName>() {
    createNodeSlaveIfNeeded
    printf "%q" "$@" 1>&nodeSlaveStreamSend
    local returnValueRaw
    local returnValues
    read returnValueRaw <&nodeSlaveStreamRecv
    
    # Parse returnValueRaw into array
    eval "returnValues=($returnValueRaw)"
    if [[ "${returnValues[0]}" != 0 ]]; then
      # write error message to stderr
      printf '%s' "${returnValues[1]}" >&2
      return "${returnValues[0]}"
    else
      printf '%s' "${returnValues[1]}"
    fi
    # first item in array is exit code (JS can send 1 for any exception, 0 for success)
    # second item is returned string to write to stdout
    # third value can be vars to set?
}