# MCP Playground

This is a personal playground for experimenting with MCP (Model Context Protocol) servers and Neo4j.
The `ts-mcp-cypher` directory contains TypeScript experiments while `go-mcp-cypher` contains Go experiments.

The `ts-mcp-cypher` contains all the experiments as it is used to experiment with the MCP protocol and an official SDK,
the other packages may have less features.

## Build and Development

The repository contains multiple language-specific implementation but a root MakeFile to keep consistency when switching between them:

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

**Run the GO-MCP-SERVER build it first**

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

Note that the MakeFile it is used just a task-runner.

## Play with it

To start playing with it, you can:

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
