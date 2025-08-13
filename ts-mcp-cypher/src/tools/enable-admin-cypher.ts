import {
  McpServer,
  RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";

export function registerEnableAdminCypherTool(
  server: McpServer,
  adminCypherTool: RegisteredTool
) {
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

  return enableAdminCypher;
}
