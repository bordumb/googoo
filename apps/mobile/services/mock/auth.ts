import { MOCK_CURRENT_USER } from "@/fixtures";

import type { AuthService } from "../types";

export const mockAuthService: AuthService = {
  async signIn(_email: string, _password: string) {
    return { user: { id: MOCK_CURRENT_USER.id } };
  },

  async signUp(_email: string, _password: string) {
    return { user: { id: MOCK_CURRENT_USER.id } };
  },

  async signOut() {
    // no-op in mock mode
  },

  async getSession() {
    return { user: { id: MOCK_CURRENT_USER.id } };
  },
};
