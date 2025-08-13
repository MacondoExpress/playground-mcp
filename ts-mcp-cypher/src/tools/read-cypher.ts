import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { getDriver } from "../get-driver.js";
import { executeQuery } from "../execute-query.js";

export function registerReadCypherTool(server: McpServer) {
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

  return readCypherTool;
}
