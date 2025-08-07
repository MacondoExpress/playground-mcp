import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as neo4j from "neo4j-driver";
import { createHTTPStatefulMCPServer } from "./express-stateful-http-server.js";

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

  const readCypherTool = server.registerTool(
    "read-cypher",
    {
      title: "Read Cypher",
      description: "Perform a read-only Cypher against a Neo4j database",

      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
      },
      inputSchema: {
        cypherQuery: z.string().default("MATCH(n) RETURN n"),
        url: z.string().url().default("bolt://localhost:7687"),
      },
    },
    async ({ cypherQuery, url }) => {
      console.error(`cypherQuery: ${cypherQuery}`);
      console.error(`url: ${url}`);
      const response = await executeQuery(cypherQuery);
      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    }
  );

  if (process.env.READ_ONLY === "true") {
    // Manually handle list tools if process.env.READ_ONLY is defined
    // TODO, demonstrated similar concept with HTTP HEADERS as well
    server.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error("manually handle list/tools");

      return {
        tools: [
          {
            name: "read-cypher",
            title: readCypherTool.title,
            description: readCypherTool.description,
            inputSchema: readCypherTool.inputSchema
              ? zodToJsonSchema(readCypherTool.inputSchema)
              : EMPTY_OBJECT_JSON_SCHEMA,
            annotations: readCypherTool.annotations,
          },
        ],
      };
    });
  }

  server.registerTool(
    "write-cypher",
    {
      title: "Write Cypher",
      description: "Perform write Cypher query",
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
      },
      inputSchema: {
        cypherQuery: z
          .string()
          .default('CREATE(n:User) SET n.name = "MPC-USER"'),
        url: z.string().url().default("bolt://localhost:7687"),
      },
    },
    async ({ cypherQuery, url }) => {
      console.error(`cypherQuery: ${cypherQuery}`);
      console.error(`url: ${url}`);
      const response = await executeQuery(cypherQuery, false);
      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    }
  );

  /**
   * Admin Cypher is a tool to perform Cypher Queries in write mode
   * but it used to test how to disable/enable tools depending on user input
   * and to debug the listNotification event
   **/
  const adminCypherTool = server.registerTool(
    "admin-cypher",
    {
      title: "Admin Cypher",
      description: "Perform cypher query with escalated privilege",
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
      },
      inputSchema: {
        cypherQuery: z
          .string()
          .default('CREATE(n:User) SET n.name = "MPC-USER"'),
        url: z.string().url().default("bolt://localhost:7687"),
      },
    },
    async ({ cypherQuery, url }) => {
      console.error(`cypherQuery: ${cypherQuery}`);
      console.error(`url: ${url}`);
      const response = await executeQuery(cypherQuery, false);
      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    }
  );
  adminCypherTool.disable();

  const enableAdminCypher = server.registerTool(
    "enable-admin-cypher",
    {
      title: "Enable Admin Cypher",
      description: "Enable Admin Cypher depending on the permission",
      inputSchema: { permission: z.enum(["read", "write"]) },
    },
    async ({ permission }) => {
      if (permission === "write") {
        adminCypherTool.enable();
        enableAdminCypher.remove();
        return {
          content: [
            {
              type: "text",
              text: "write tool enabled",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "Write permission is required to enable write-cypher",
          },
        ],
      };
    }
  );

  async function executeQuery(
    cypher: string,
    readOnly = true
  ): Promise<string> {
    const driver = neo4j.driver(
      "bolt://localhost:7687",
      neo4j.auth.basic("neo4j", "password")
    );
    try {
      const driverResponse = await driver.executeQuery(
        cypher,
        {},
        {
          // READ-ONLY not guaranteed
          routing: readOnly ? "READ" : "WRITE",
        }
      );
      // TODO: Are meta information helpful? or we want to return properties only?
      const formattedResponse = JSON.stringify(
        driverResponse.records.map((record) => record.toObject()),
        null,
        2
      );
      console.error(`The formatted response: ${formattedResponse}`);
      return formattedResponse;
    } catch (e) {
      console.error(`Error while executing Cypher Read:`, e);
      throw e;
    } finally {
      driver.close();
    }
  }
  console.log(`transport: ${transport}`)
  if (transport === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    await createHTTPStatefulMCPServer(server, port);
  }

  return server;
}
