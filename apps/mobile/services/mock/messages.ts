import type { Message } from "@googoo/shared";

import type { Thread } from "@/fixtures/factories";

import type { MessageService } from "../types";

let mockMessages: Message[] = [];
let mockThreads: Thread[] = [];
let fixturesLoaded = false;

async function ensureFixtures() {
  if (!fixturesLoaded) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fixtures = require("../../fixtures") as {
      MOCK_MESSAGES: Message[];
      MOCK_THREADS: Thread[];
      MOCK_CURRENT_USER: { id: string };
    };
    mockMessages = [...fixtures.MOCK_MESSAGES];
    mockThreads = [...fixtures.MOCK_THREADS];
    fixturesLoaded = true;
  }
}

export const mockMessageService: MessageService = {
  async fetchThreads(): Promise<Thread[]> {
    await ensureFixtures();
    return mockThreads.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  },

  async fetchThread(threadId: string): Promise<Message[]> {
    await ensureFixtures();
    return mockMessages.filter((m) => m.thread_id === threadId);
  },

  async send(threadId: string, content: string): Promise<Message> {
    await ensureFixtures();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MOCK_CURRENT_USER } = require("../../fixtures") as {
      MOCK_CURRENT_USER: { id: string };
    };

    const msg: Message = {
      id: `mock-${Date.now()}`,
      thread_id: threadId,
      sender_id: MOCK_CURRENT_USER.id,
      content,
      listing_id: null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    mockMessages.push(msg);

    // Update thread preview
    const thread = mockThreads.find((t) => t.id === threadId);
    if (thread) {
      thread.lastMessage = content;
      thread.lastMessageAt = msg.created_at;
    }

    // Auto-reply after 1-2 seconds
    setTimeout(() => {
      const replies = [
        "Sounds great! When works for you?",
        "Still available! Want to meet at Wright Park?",
        "I can do Saturday afternoon if that works?",
        "Sure thing! It's in great condition.",
        "Let me check and get back to you!",
      ];
      const replyContent = replies[Math.floor(Math.random() * replies.length)]!;
      const reply: Message = {
        id: `mock-${Date.now()}-reply`,
        thread_id: threadId,
        sender_id: thread?.otherUser.id ?? "unknown",
        content: replyContent,
        listing_id: null,
        read_at: null,
        created_at: new Date().toISOString(),
      };
      mockMessages.push(reply);

      if (thread) {
        thread.lastMessage = replyContent;
        thread.lastMessageAt = reply.created_at;
      }
    }, 1000 + Math.random() * 1500);

    return msg;
  },
};
