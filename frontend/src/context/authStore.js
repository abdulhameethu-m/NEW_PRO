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
      JSON.stringify({ token: state.token, user: state.user })
    );
  } catch {
    // ignore
  }
}

const initial = load() || { token: null, user: null };

export const useAuthStore = create((set, get) => ({
  token: initial.token,
  user: initial.user,
  setAuth: ({ token, user }) => {
    set({ token, user });
    save({ token, user });
  },
  logout: () => {
    set({ token: null, user: null });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
}));

