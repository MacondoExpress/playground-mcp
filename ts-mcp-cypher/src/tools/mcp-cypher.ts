import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { getDriver } from "../get-driver.js";
import { executeQuery } from "../execute-query.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

const EMPTY_OBJECT_JSON_SCHEMA = {
  type: "object" as const,
  properties: {},
} as const;

export async function registerMCPCypherTools(server: McpServer) {
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
        query: z.string().default("MATCH(n) RETURN n"),
        params: z.record(z.any()).optional(),
      },
    },
    async ({ query, params }) => {
      console.error(`Cypher Query: ${query}`);
      console.error(`Cypher Params: ${JSON.stringify(params)}`);
      const driver = await getDriver();
      const response = await executeQuery({
        query,
        params,
        driver,
        readOnly: true,
      });
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
        query: z.string().default("MATCH(n) RETURN n"),
        params: z.record(z.any()).optional(),
      },
    },
    async ({ query, params }) => {
      console.error(`Cypher Query: ${query}`);
      console.error(`Cypher Params: ${JSON.stringify(params)}`);
      const driver = await getDriver();
      const response = await executeQuery({
        query,
        params,
        driver,
        readOnly: false,
      });
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
        query: z.string().default("MATCH(n) RETURN n"),
        params: z.record(z.any()).optional(),
      },
    },
    async ({ query, params }) => {
      console.error(`Cypher Query: ${query}`);

      console.error(`Cypher Params: ${JSON.stringify(params)}`);
      const driver = await getDriver();
      const response = await executeQuery({
        query,
        params,
        driver,
        readOnly: false,
      });
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
}
