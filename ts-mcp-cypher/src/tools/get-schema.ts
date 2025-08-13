import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDriver } from "../get-driver.js";
import { executeQuery } from "../execute-query.js";

export function registerGetSchemaTool(server: McpServer) {
  const getSchemaTool = server.registerTool(
    "get-schema",
    {
      title: "Get Schema",
      description:
        "Extract Neo4j database schema including node labels, properties, and relationship types",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
      },
      inputSchema: {},
    },
    async () => {
      // Get comprehensive schema using APOC
      // An alternative could be to use db.schema.nodeTypeProperties() and db.schema.relTypeProperties()
      // Removing the dependencies from apoc
      // maybe we can remove some details from the properties
      const schemaQuery = `
        CALL apoc.meta.schema()
        YIELD value
        UNWIND keys(value) AS key
        WITH key, value[key] AS value
        RETURN key, value { .labels, .properties, .type, .relationships } as value
      `;
      const schemaResponse = await executeQuery({
        query: schemaQuery,
        params: {},
        driver: await getDriver(),
        readOnly: true,
      });

      const schemaInfo = JSON.parse(schemaResponse);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(schemaInfo, null, 2),
          },
        ],
      };
    }
  );

  return getSchemaTool;
}
