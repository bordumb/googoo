import { getSupabase } from "../supabase";
import type { AuthService } from "../types";

export const realAuthService: AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session ? { user: { id: data.session.user.id } } : null;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) throw error;
    return data.session ? { user: { id: data.session.user.id } } : null;
  },

  async signOut() {
    await getSupabase().auth.signOut();
  },

  async getSession() {
    const { data } = await getSupabase().auth.getSession();
    return data.session ? { user: { id: data.session.user.id } } : null;
  },
};
