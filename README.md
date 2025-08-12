# MCP Playground

This is a personal playground for experimenting with MCP (Model Context Protocol) servers and Neo4j.
The `ts-mcp-cypher` directory contains TypeScript experiments while `go-mcp-cypher` contains Go experiments.

The `ts-mcp-cypher` contains all the experiments as it is used to experiment with the MCP protocol and an official SDK,
the other packages may have less features.

## Build and Development

The repository contains multiple language-specific implementation but a root MakeFile to keep consistency when switching between them:
Note that the MakeFile is used just as a task-runner; no incremental build is happening.

**Run the TS-MCP-SERVER**

```bash
make run-ts
```

**Inspect the TS-MCP-SERVER**

```bash
make inspect-ts
```

**Clean the TS-MCP-SERVER build**

```bash
make clean-ts
```

--- GO targets ---

**Build the GO-MCP-SERVER**

```bash
make build-go
```

**Run the GO-MCP-SERVER**

```bash
make run-go
```

**Inspect the GO-MCP-SERVER**

```bash
make inspect-go
```

**Clean the GO-MCP-SERVER build**

```bash
make clean-go
```

## Experiment with it

To start experimenting with it, you can:

### Use the inspector

> `make inspect-ts` - A shortcut for `npx @modelcontextprotocol/inspector our-stdio-server`
>
> For HTTP transport:
>
> 1. Create the HTTP server: `make run-ts ARGS="--transport http"`
> 2. Run the inspector as a separate process: `npx @modelcontextprotocol/inspector`

#### Inspect STDIO

```bash
make inspect-ts
```

You should see a browser tab open with the mcp inspector.

You can do a simple flow such as:

- connect (stdio)
- list tools
- click on read-cypher
- click on Run Tool

The the server logs are visible in the STDERR visible on the bottom-left of the inspector.
It is also possible to review the History on the bottom.

#### Inspect HTTP

Create the server:

```bash
make run-ts ARGS="--transport http"
```

Run the inspector separately:

```bash
`npx @modelcontextprotocol/inspector`
```

### Manually enable tool "Admin Cypher" (Not important flow - Just used to test sessions impact)

> Ignore this flow, this flow was used to test behaviour when disabling/enabling/removing tools in a multi-client environment
> Test it with the inspector could be misleading as it creates different session for tab but also different subprocess
> And tools seems not to be implicitly session bounded.

To demonstrate dynamic tooling for specific session a tool call `enable-admin-cypher` is exposed as a tool.

Execute the `enable-admin-cypher` passing "write" as permission to enable the `admin-cypher` tool.

You should see the server notifications with the event `list_changed` listed.

Refresh the tool, and you'll see `admin-cypher` available for that session, while `enable-admin-cypher` has been removed.

### HANDLE tool/list manually when the environment variable READ_ONLY is present

Add the environment variable `READ_ONLY=true` before running the server and the tool/list will return only `read-cypher`

```bash
READ_ONLY=true make inspect-ts
```

You should see the debug log `manually handle list/tools`

## Try manually the flow

**initialize**

```bash
echo '{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": { "protocolVersion": "2024-11-05", "capabilities": { "roots": { "listChanged": true }, "sampling": {}, "elicitation": {} }, "clientInfo": { "name": "bash-test", "title": "Bash test", "version": "1.0.0" } } }' | make run-ts
```

**tool/list**

```bash
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | make run-ts
```

**tool/call**

```bash
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "read-cypher", "arguments": {"cypherQuery": "MATCH (n) RETURN n LIMIT 5"}}}' | make run-ts
```

**tool/call with server notification**

```bash
echo '{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": { "name": "enable-admin-cypher", "arguments": { "permission": "write" }, "_meta": { "progressToken": 0 } } }' | make run-ts
```

**tool/call on disabled tool**

```bash
echo '{"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": { "name": "admin-cypher", "arguments": { "cypherQuery": "CREATE(n:User) SET n.name = \"MPC-USER\"", "url": "bolt://localhost:7687" }, "_meta": { "progressToken": 2 } } }' |  make run-ts
```

### json-rpc-client

The above recreate a new process for each tool calling, to test stateful operation such as the `enable-admin-cypher` -> `admin-cypher` flow,
I made a really simple REPL JSON-RPC 2.0 client that takes as input the JSON-RPC message and send it to the MCP Server subprocess.

Just run:

```bash
node json-rpc-client.js node ./ts-mcp-cypher/build/index.js
```

You will be prompted:

```bash
Enter JSON-RPC 2.0 message (or "quit" to exit):
```

Try the flow above, starting from:

```
{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": { "protocolVersion": "2024-11-05", "capabilities": { "roots": { "listChanged": true }, "sampling": {}, "elicitation": {} }, "clientInfo": { "name": "bash-test", "title": "Bash test", "version": "1.0.0" } } }
```

The `STDERR` is redirected to a file named `json-rpc-client-${pid}.debuglog`

## Test it with VSCode copilot

> Note the as only read-cypher/write-cypher are exposed with not detailed description
> and no schema is returned or no list-database is exposed the behavior it's actually limited

Run the http server:

```bash
make run-ts ARGS="--transport http"
```

Add it on VSCode:
**mcp.json**

```json
{
  "servers": {
    "mcp-cypher-playground": {
      "type": "http",
      "url": "http://localhost:3000/mcp/"
    }
  }
}
```

# Experiments NEXT

- experiment with auth0
- test confirmation as server-initiated elicitation
- test database discovery tool
- convert experiments to mark3labs/mcp-go / official SDKs
- experiment with genai-toolbox

