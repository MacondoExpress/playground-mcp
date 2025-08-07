import { Option, program } from "commander";
import { createMCPPlaygroundSerer } from "./mcp-cypher-playground.js";

function parseArgs() {
  // program.addOption(
  //   new Option(
  //     "-t, --transport <protocol>",
  //     "transport protocol used by the MCP server"
  //   ).choices(["stdio", "http"])
  // );
  // program.addOption(
  //   new Option("-p, --port <port>", "http port used by the MCP server").default(
  //     3000
  //   )
  // );
  // program.parse();
}

async function main() {
  parseArgs();
  const transportProtocol = program.getOptionValue("transport");
  const port = program.getOptionValue("port");
  await createMCPPlaygroundSerer(transportProtocol, port);

  console.error(
    `Cypher MCP Server running on ${
      transportProtocol === "http"
        ? `http on http://localhost:${port}/mcp`
        : "stdio"
    }`
  );
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
