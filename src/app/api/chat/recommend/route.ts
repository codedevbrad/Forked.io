import { auth } from "@/auth";
import { getRecipeSummariesForAIAction } from "@/src/domains/recipes/db";
import {
  streamConversation,
  type ChatMessage,
  type ChatFilters,
} from "@/src/services/openai/ai.conversation";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const messages: ChatMessage[] = body.messages;
    const filters: ChatFilters = body.filters ?? { spicy: false, airfryer: false };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages are required", { status: 400 });
    }

    // Fetch user's recipes as context for the AI
    const recipeSummaries = await getRecipeSummariesForAIAction();

    // Stream the response
    const stream = await streamConversation(messages, recipeSummaries, filters);

    // Convert the string stream to a byte stream for the Response
    const encoder = new TextEncoder();
    const readableStream = stream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(chunk));
        },
      })
    );

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat recommend error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(message, { status: 500 });
  }
}
