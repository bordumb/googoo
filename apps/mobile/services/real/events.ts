import type { EventService } from "../types";

export const realEventService: EventService = {
  async fetchForGroup(_groupId: string) {
    return [];
  },
  async fetchUpcoming() {
    return [];
  },
};
