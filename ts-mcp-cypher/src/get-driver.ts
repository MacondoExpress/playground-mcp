import * as neo4j from "neo4j-driver";

// TODO: return driver depending on the session for http connection to ao
export function getDriver(): neo4j.Driver {
  const NEO4J_URI = process.env.NEO4J_URI ?? "bolt://localhost:7687";
  const NEO4J_USERNAME = process.env.NEO4J_USERNAME ?? "neo4j";
  const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD ?? "password";
  console.error(`NEO4J_URI: ${NEO4J_URI}`);
  console.error(`NEO4J_USERNAME: ${NEO4J_USERNAME}`);
  console.error(`NEO4J_PASSWORD: ${NEO4J_PASSWORD}`);
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
  );
  return driver;
}
