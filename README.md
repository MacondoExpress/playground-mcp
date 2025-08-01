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

```bash
make inspect-ts
```

You should see a browser tab open with the mcp inspector.

You can do a simple flow such as:

- connect
- list tools
- click on read-cypher
- click on Run Tool

The the server logs are visible in the STDERR visible on the bottom-left of the inspector.
It is also possible to review the History on the bottom.

### Manually enable tool "Admin Cypher"

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

# Experiments NEXT

- experiment with http server
- experiment with auth0
- convert experiments to mark3labs/mcp-go / official SDKs
- experiment with genai-toolbox
