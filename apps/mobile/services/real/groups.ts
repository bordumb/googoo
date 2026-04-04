import type { Group, Post } from "@googoo/shared";

import { getSupabase } from "../supabase";
import type { GroupService } from "../types";

export const realGroupService: GroupService = {
  async fetchNearby(_lat: number, _lng: number): Promise<Group[]> {
    const { data, error } = await getSupabase()
      .from("groups")
      .select("*")
      .limit(20);
    if (error) throw error;
    return (data ?? []) as Group[];
  },

  async fetchPosts(groupId: string): Promise<Post[]> {
    const { data, error } = await getSupabase()
      .from("posts")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Post[];
  },

  async fetchById(id: string): Promise<Group | null> {
    const { data, error } = await getSupabase()
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as Group;
  },
};
