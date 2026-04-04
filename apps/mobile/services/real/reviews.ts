import type { ReviewService } from "../types";

export const realReviewService: ReviewService = {
  async fetchForUser(_userId: string) {
    // Real implementation would query reviews table
    return [];
  },
};
