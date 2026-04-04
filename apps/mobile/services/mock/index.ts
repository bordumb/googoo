import type { Services } from "../types";

import { mockAuthService } from "./auth";
import { mockEventService } from "./events";
import { mockGroupService } from "./groups";
import { mockListingService } from "./listings";
import { mockMessageService } from "./messages";
import { mockReviewService } from "./reviews";
import { mockStorageService } from "./storage";

export function createMockServices(): Services {
  return {
    listings: mockListingService,
    auth: mockAuthService,
    messages: mockMessageService,
    groups: mockGroupService,
    storage: mockStorageService,
    reviews: mockReviewService,
    events: mockEventService,
  };
}
