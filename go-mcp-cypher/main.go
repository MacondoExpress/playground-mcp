package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// ReadCypherArgs represents the input arguments for the read-cypher tool
type ReadCypherArgs struct {
	CypherQuery string `json:"cypherQuery"`
	URL         string `json:"url"`
}

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	//BANANA := os.Getenv("BANANA")
	//fmt.Print(BANANA)
	// Create a new MCP server
	mcpServer := server.NewMCPServer(
		"mcp-cypher-playground",
		"0.0.1",
	)

	// Register the read-cypher tool
	readCypher := mcp.NewTool("read-cypher",
		mcp.WithDescription("Perform a read-only Cypher against a Neo4j database"),
		mcp.WithString("cypherQuery",
			mcp.Description("The Cypher query to execute"),
			mcp.DefaultString("MATCH(n) RETURN n")),
		mcp.WithString("url",
			mcp.Description("Neo4j connection URL"),
			mcp.DefaultString("bolt://localhost:7687")),
		mcp.WithReadOnlyHintAnnotation(true),
	)
	mcpServer.AddTool(readCypher, handleReadCypher)

	// Start the server with stdio transport
	err = server.ServeStdio(mcpServer)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	fmt.Fprintf(os.Stderr, "Cypher MCP Server running on stdio")
	//fmt.Fprintf(os.Stderr, OS.get())
}

func handleReadCypher(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	var arguments = request.GetArguments()

	cypherQuery := arguments["cypherQuery"].(string)
	url := arguments["url"].(string)

	fmt.Fprintf(os.Stderr, "cypherQuery: %s\n", cypherQuery)
	fmt.Fprintf(os.Stderr, "url: %s\n", url)

	// Execute the Cypher query
	response, err := readCypher(cypherQuery)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("Error executing Cypher query: %v", err)), nil
	}

	return mcp.NewToolResultText(response), nil

}

func readCypher(cypher string) (string, error) {
	// Create Neo4j driver
	driver, err := neo4j.NewDriverWithContext(
		"bolt://localhost:7687",
		neo4j.BasicAuth("neo4j", "password", ""),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating Neo4j driver: %v\n", err)
		return "", err
	}
	defer driver.Close(context.Background())

	// Create session and execute query
	ctx := context.Background()
	session := driver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	result, err := session.Run(ctx, cypher, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error while executing Cypher Read: %v\n", err)
		return "", err
	}

	// Collect all records
	records, err := result.Collect(ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error collecting query results: %v\n", err)
		return "", err
	}

	var results []map[string]interface{}
	for _, record := range records {
		recordMap := make(map[string]interface{})
		for i, key := range record.Keys {
			recordMap[key] = record.Values[i]
		}
		results = append(results, recordMap)
	}

	formattedResponse, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error formatting response as JSON: %v\n", err)
		return "", err
	}

	formattedResponseStr := string(formattedResponse)
	fmt.Fprintf(os.Stderr, "The formatted response: %s\n", formattedResponseStr)

	return formattedResponseStr, nil
}
