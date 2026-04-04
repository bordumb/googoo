import { getSupabase } from "../supabase";
import type { StorageService } from "../types";

export const realStorageService: StorageService = {
  async uploadImage(uri: string, bucket: string): Promise<string | null> {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { error } = await getSupabase().storage.from(bucket).upload(fileName, uri);
    if (error) return null;
    const { data } = getSupabase().storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  },
};
