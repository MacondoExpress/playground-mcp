import { spawn } from "child_process";
import { appendFileSync } from "fs";
import * as readline from "readline";

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node json-rpc-client.js <subprocess JSON-RPC 2.0>");
  process.exit(1);
}

// Spawn the child process
const childProcess = spawn(args[0], args.slice(1), {
  stdio: ["pipe", "pipe", "pipe"],
});

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Handle child process stdout
childProcess.stdout.on("data", (data) => {
  console.log("Response:", data.toString().trim());
  promptForMessage();
});

childProcess.stderr.on("data", (data) => {
  appendFileSync(`json-rpc-client-${childProcess.pid}.debuglog`, data + "\n", {
    encoding: "utf-8",
  });
  childProcess.pid;
});

//Handle child process errors
childProcess.on("error", (err) => {
  console.error("Process error:", err.message);
  process.exit(1);
});

childProcess.on("close", (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code);
});

// Function to prompt for JSON-RPC message
function promptForMessage() {
  rl.question('Enter JSON-RPC 2.0 message (or "quit" to exit): ', (input) => {
    if (input.toLowerCase() === "quit") {
      childProcess.kill();
      rl.close();
      process.exit(0);
    }

    try {
      // Validate JSON format
      const message = JSON.parse(input);

      // Send message to child process
      childProcess.stdin.write(input + "\n");
    } catch (err) {
      console.error("Invalid JSON:", err.message);
      promptForMessage();
    }
  });
}

// Start the interaction
console.log(`JSON-RPC Client started. Process: ${args.join(" ")}`);
promptForMessage();
