import { create } from "zustand";

const STORAGE_KEY = "amazon_like_auth";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function save(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      })
    );
  } catch {
    // ignore
  }
}

const initial = load() || { token: null, refreshToken: null, user: null };

export const useAuthStore = create((set, get) => ({
  token: initial.token,
  refreshToken: initial.refreshToken,
  user: initial.user,
  setAuth: ({ token, accessToken, refreshToken, user }) => {
    const nextState = {
      token: accessToken || token || null,
      refreshToken: refreshToken || null,
      user,
    };
    set(nextState);
    save(nextState);
  },
  logout: () => {
    set({ token: null, refreshToken: null, user: null });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
}));
