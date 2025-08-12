import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createHTTPStatefulMCPServer } from "./express-stateful-http-server.js";
import { registerMCPCypherTools } from "./tools/mcp-cypher.js";

export async function createMCPPlaygroundSerer(
  transport: "http" | "stdio",
  port: number
): Promise<McpServer> {
  // Create server instance
  const server = new McpServer({
    name: "mcp-cypher-playground",
    version: "0.0.1",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  registerMCPCypherTools(server);

  if (transport === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    await createHTTPStatefulMCPServer(server, port);
  }

  return server;
}
