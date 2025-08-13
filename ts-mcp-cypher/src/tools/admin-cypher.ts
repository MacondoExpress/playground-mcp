import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { getDriver } from "../get-driver.js";
import { executeQuery } from "../execute-query.js";

export function registerAdminCypherTool(server: McpServer) {
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

  return adminCypherTool;
}
