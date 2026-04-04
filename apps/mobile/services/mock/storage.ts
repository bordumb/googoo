import { listingImage } from "@/fixtures";

import type { StorageService } from "../types";

export const mockStorageService: StorageService = {
  async uploadImage(_uri: string, _bucket: string): Promise<string | null> {
    // Return a deterministic placeholder URL
    return listingImage("mock-upload", 0);
  },
};
