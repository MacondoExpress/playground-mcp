import * as neo4j from "neo4j-driver";
const NEO4J_URI = process.env.NEO4J_URI ?? "bolt://localhost:7687";
const NEO4J_USERNAME = process.env.NEO4J_URI ?? "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD ?? "password";

// TODO: return driver depending on the session for http connection to ao
export function getDriver(): neo4j.Driver {
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
  );
  return driver;
}
