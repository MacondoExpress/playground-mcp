import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createHTTPStatefulMCPServer } from "./express-stateful-http-server.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { registerReadCypherTool } from "./tools/read-cypher.js";
import { registerWriteCypherTool } from "./tools/write-cypher.js";
import { registerAdminCypherTool } from "./tools/admin-cypher.js";
import { registerEnableAdminCypherTool } from "./tools/enable-admin-cypher.js";
import { registerGetSchemaTool } from "./tools/get-schema.js";
import { zodToJsonSchema } from "zod-to-json-schema";

const EMPTY_OBJECT_JSON_SCHEMA = {
  type: "object" as const,
  properties: {},
} as const;

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
  //manually handle list/tools
  if (process.env.READ_ONLY === "true") {
    // Manually handle list tools if process.env.READ_ONLY is defined
    // TODO, demonstrated similar concept with HTTP HEADERS as well
    server.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error("manually handle list/tools");
      const readTool = registerReadCypherTool(server);
      return {
        tools: [
          {
            name: "read-cypher",
            title: readTool.title,
            description: readTool.description,
            inputSchema: readTool.inputSchema
              ? zodToJsonSchema(readTool.inputSchema)
              : EMPTY_OBJECT_JSON_SCHEMA,
            annotations: readTool.annotations,
          },
        ],
      };
    });
  }

  const toolset = process.env.NEO4J_TOOLSET ?? "all";

  const tools = toolset.split(",");
  if (tools.includes("all")) {
    registerReadCypherTool(server);
    registerWriteCypherTool(server);
    registerGetSchemaTool(server);
    const adminTool = registerAdminCypherTool(server);
    registerEnableAdminCypherTool(server, adminTool);
  } else {
    if (tools.includes("read-cypher")) {
      registerReadCypherTool(server);
    }
    if (tools.includes("write-cypher")) {
      registerWriteCypherTool(server);
    }
    if (tools.includes("get-schema")) {
      registerGetSchemaTool(server);
    }
    if (tools.includes("admin-cypher")) {
      const adminTool = registerAdminCypherTool(server);
      registerEnableAdminCypherTool(server, adminTool);
    }
  }

  if (transport === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    await createHTTPStatefulMCPServer(server, port);
  }

  return server;
}
