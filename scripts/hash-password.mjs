// Prints a password hash for GERARDO_PASSWORD_HASH / GENESIS_PASSWORD_HASH.
// Usage: npm run hash-password   (prompts; typing is hidden)
//
// Format must match lib/auth.ts: `<salt hex>:<scrypt hash hex>`, 64-byte key,
// Node's default scrypt cost.
import { randomBytes, scryptSync } from "node:crypto";

function fail(message) {
  console.error(message);
  process.exit(1);
}

// Reads one line without echoing it.
function ask(question) {
  const { stdin, stdout } = process;
  stdout.write(question);
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.resume();

  return new Promise((resolve) => {
    let input = "";
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\u0003") {
          stdout.write("\n");
          process.exit(130); // Ctrl+C
        } else if (ch === "\r" || ch === "\n") {
          stdin.off("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write("\n");
          return resolve(input);
        } else if (ch === "\u007f" || ch === "\b") {
          input = input.slice(0, -1);
        } else {
          input += ch;
        }
      }
    };
    stdin.on("data", onData);
  });
}

if (!process.stdin.isTTY) fail("Run this in a terminal: npm run hash-password");

const password = await ask("New password: ");
if (password.length < 12) fail("Use at least 12 characters.");
if ((await ask("Repeat password: ")) !== password) fail("Passwords don't match.");

const salt = randomBytes(16);
console.log(`\n${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`);
