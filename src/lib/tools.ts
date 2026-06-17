import { tool } from "ai";
import { z } from "zod";
import path from "node:path";
import type { Sandbox } from "@vercel/sandbox";

const COMMAND_TIMEOUT_MS = 60_000;

export function buildTools(sandbox: Sandbox) {
  const readFile = tool({
    description:
      "Read the contents of a text file inside the sandbox workspace.",
    inputSchema: z.object({
      path: z.string().describe("Path to the file, relative to the workspace root"),
    }),
    execute: async ({ path: filePath }) => {
      try {
        const content = await sandbox.fs.readFile(filePath, "utf-8");
        return { content };
      } catch (err) {
        return { error: `Could not read ${filePath}: ${(err as Error).message}` };
      }
    },
  });

  const writeFile = tool({
    description:
      "Write (create or overwrite) a text file inside the sandbox workspace. Creates parent directories as needed.",
    inputSchema: z.object({
      path: z.string().describe("Path to the file, relative to the workspace root"),
      content: z.string().describe("Full content to write to the file"),
    }),
    execute: async ({ path: filePath, content }) => {
      try {
        const dir = path.posix.dirname(filePath);
        if (dir && dir !== ".") {
          await sandbox.fs.mkdir(dir, { recursive: true });
        }
        await sandbox.fs.writeFile(filePath, content, "utf-8");
        return { ok: true, bytesWritten: content.length };
      } catch (err) {
        return { error: `Could not write ${filePath}: ${(err as Error).message}` };
      }
    },
  });

  const listFiles = tool({
    description: "List files and directories at a given path in the sandbox workspace.",
    inputSchema: z.object({
      path: z.string().default(".").describe("Directory to list, relative to the workspace root"),
    }),
    execute: async ({ path: dirPath }) => {
      try {
        const entries = await sandbox.fs.readdir(dirPath, { withFileTypes: true });
        return {
          entries: entries.map((e) => ({
            name: e.name,
            type: e.isDirectory() ? "directory" : "file",
          })),
        };
      } catch (err) {
        return { error: `Could not list ${dirPath}: ${(err as Error).message}` };
      }
    },
  });

  const runCommand = tool({
    description:
      "Run a shell command inside the isolated sandbox VM and return its exit code, stdout, and stderr. The sandbox has no access to the host machine.",
    inputSchema: z.object({
      command: z.string().describe("The shell command to execute, e.g. 'npm install' or 'ls -la'"),
    }),
    execute: async ({ command }) => {
      try {
        const result = await sandbox.runCommand("bash", ["-lc", command], {
          timeoutMs: COMMAND_TIMEOUT_MS,
        });
        const [stdout, stderr] = await Promise.all([result.stdout(), result.stderr()]);
        return { exitCode: result.exitCode, stdout, stderr };
      } catch (err) {
        return { error: `Command failed: ${(err as Error).message}` };
      }
    },
  });

  return { readFile, writeFile, listFiles, runCommand };
}
