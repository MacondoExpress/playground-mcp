# Makefile for MCP Playground
.PHONY:
	install-ts
	run-ts
	build-ts 
	node-ts 
	clean-ts
	inspect-ts
# GO targets
	install-go
	run-go
	build-go 
	clean-go
	inspect-go



# TypeScript MCP Cypher targets
install-ts:
	cd ts-mcp-cypher && yarn install

build-ts:
	cd ts-mcp-cypher && yarn build

node-ts:
	cd ts-mcp-cypher && node ./build/index.js

run-ts:
	# Change transport protocol: make run-ts ARGS="--transport stdio"
	cd ts-mcp-cypher && yarn build && node ./build/index.js $(ARGS)
	
inspect-ts:
	cd ts-mcp-cypher && yarn build && npx @modelcontextprotocol/inspector node ./build/index.js

clean-ts:
	cd ts-mcp-cypher && rm -rf build/

# Go MCP Cypher targets
install-go:
	cd go-mcp-cypher && go mod download

build-go:
	cd go-mcp-cypher && go build -o bin/mcp-cypher main.go

run-go:
	cd go-mcp-cypher && go run main.go

inspect-go:
	cd go-mcp-cypher && go build -o bin/mcp-cypher main.go && npx @modelcontextprotocol/inspector ./bin/mcp-cypher

clean-go:
	cd go-mcp-cypher && rm -rf bin/
