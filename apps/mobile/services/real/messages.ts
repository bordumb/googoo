import type { Message } from "@googoo/shared";

import { getSupabase } from "../supabase";
import type { MessageService } from "../types";

export const realMessageService: MessageService = {
  async fetchThreads() {
    // Real implementation would query threads — stub for now
    return [];
  },

  async fetchThread(threadId: string): Promise<Message[]> {
    const { data, error } = await getSupabase()
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Message[];
  },

  async send(threadId: string, content: string): Promise<Message> {
    const { data, error } = await getSupabase()
      .from("messages")
      .insert({ thread_id: threadId, content, sender_id: "" })
      .select()
      .single();
    if (error) throw error;
    return data as Message;
  },
};
