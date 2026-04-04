import type { MockReview } from "@/fixtures/factories";

import type { ReviewService } from "../types";

export const mockReviewService: ReviewService = {
  async fetchForUser(_userId: string): Promise<MockReview[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MOCK_REVIEWS } = require("../../fixtures") as {
      MOCK_REVIEWS: MockReview[];
    };
    return MOCK_REVIEWS;
  },
};
