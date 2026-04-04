import type { Group, Post } from "@googoo/shared";

import { MOCK_GROUPS, MOCK_POSTS } from "@/fixtures";

import type { GroupService } from "../types";

export const mockGroupService: GroupService = {
  async fetchNearby(_lat: number, _lng: number): Promise<Group[]> {
    return MOCK_GROUPS;
  },

  async fetchPosts(groupId: string): Promise<Post[]> {
    return MOCK_POSTS.filter((p) => p.group_id === groupId);
  },

  async fetchById(id: string): Promise<Group | null> {
    return MOCK_GROUPS.find((g) => g.id === id) ?? null;
  },
};
