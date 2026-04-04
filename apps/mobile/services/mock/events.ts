import type { MockEvent } from "@/fixtures/factories";

import type { EventService } from "../types";

export const mockEventService: EventService = {
  async fetchForGroup(groupId: string): Promise<MockEvent[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MOCK_EVENTS } = require("../../fixtures") as {
      MOCK_EVENTS: MockEvent[];
    };
    return MOCK_EVENTS.filter((e) => e.group_id === groupId);
  },

  async fetchUpcoming(): Promise<MockEvent[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MOCK_EVENTS } = require("../../fixtures") as {
      MOCK_EVENTS: MockEvent[];
    };
    return MOCK_EVENTS.sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  },
};
