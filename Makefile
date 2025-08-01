# Makefile for MCP Playground

.PHONY : run-ts build-ts node-ts clean-ts inspect-ts run-go build-go clean-go inspect-go

# Default target
all : run-ts

# TypeScript MCP Cypher targets
build-ts :
	cd ts-mcp-cypher && yarn build

node-ts:
	cd ts-mcp-cypher && node ./build/index.js

run-ts :
	cd ts-mcp-cypher && yarn build && node ./build/index.js
	
inspect-ts :
	cd ts-mcp-cypher && yarn build && npx @modelcontextprotocol/inspector node ./build/index.js

clean-ts :
	cd ts-mcp-cypher && rm -rf build/

# Go MCP Cypher targets
build-go :
	cd go-mcp-cypher && go build -o bin/mcp-cypher main.go

run-go :
	cd go-mcp-cypher && go run main.go

inspect-go :
	cd go-mcp-cypher && go build -o bin/mcp-cypher main.go && npx @modelcontextprotocol/inspector ./bin/mcp-cypher

clean-go :
	cd go-mcp-cypher && rm -rf bin/
