import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { getDriver } from "../get-driver.js";
import { executeQuery } from "../execute-query.js";

export function registerWriteCypherTool(server: McpServer) {
  const writeCypherTool = server.registerTool(
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

  return writeCypherTool;
}
