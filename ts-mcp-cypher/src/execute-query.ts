import * as neo4j from "neo4j-driver";

export async function executeQuery({
  query,
  params = {},
  driver,
  readOnly = true,
}: {
  query: string;
  params: Record<string, any> | undefined;
  driver: neo4j.Driver;
  readOnly: boolean;
}): Promise<string> {
  try {
    const driverResponse = await driver.executeQuery(query, params, {
      // READ-ONLY not guaranteed
      routing: readOnly ? "READ" : "WRITE",
    });
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
