import type { Services } from "../types";

import { realAuthService } from "./auth";
import { realEventService } from "./events";
import { realGroupService } from "./groups";
import { realListingService } from "./listings";
import { realMessageService } from "./messages";
import { realReviewService } from "./reviews";
import { realStorageService } from "./storage";

export function createRealServices(): Services {
  return {
    listings: realListingService,
    auth: realAuthService,
    messages: realMessageService,
    groups: realGroupService,
    storage: realStorageService,
    reviews: realReviewService,
    events: realEventService,
  };
}
