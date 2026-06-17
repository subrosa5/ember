import { ToolLoopAgent, stepCountIs, type InferAgentUIMessage } from "ai";
import { groq } from "@ai-sdk/groq";
import type { Sandbox } from "@vercel/sandbox";
import { buildTools } from "./tools";
import { DEFAULT_MODEL_ID, getModelOption } from "./models";

function resolveModel(modelId: string) {
  const option = getModelOption(modelId) ?? getModelOption(DEFAULT_MODEL_ID)!;
  return option.provider === "groq" ? groq(option.id) : option.id;
}

const INSTRUCTIONS = `You are Ember, an autonomous coding agent running inside an isolated sandbox VM.

You have tools to read files, write files, list directories, and run shell commands inside that sandbox. The sandbox is empty until you create files in it — there is no existing project unless you or the user created one in this session.

How you work:
- Break the task into small steps. Explore before you change anything (list files, read relevant files) rather than guessing.
- After writing code, verify it: run it, run tests, or at least run a syntax/build check when one is available.
- Narrate what you're doing in plain language before each tool call, and summarize the outcome after.
- If a command fails, read the error output and adjust — don't repeat the same failing command.
- Be concise. Don't pad responses with filler.
- You are operating in a disposable sandbox with no access to the user's real machine, so you do not need to ask for confirmation before running commands inside it — but you should still stop and explain if a request is ambiguous or could produce a very large/expensive amount of work.`;

export function createAgent(sandbox: Sandbox, modelId: string = DEFAULT_MODEL_ID) {
  return new ToolLoopAgent({
    model: resolveModel(modelId),
    instructions: INSTRUCTIONS,
    tools: buildTools(sandbox),
    stopWhen: stepCountIs(15),
  });
}

export type EmberAgent = ReturnType<typeof createAgent>;
export type EmberUIMessage = InferAgentUIMessage<EmberAgent>;
