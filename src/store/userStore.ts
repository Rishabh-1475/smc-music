import { create } from "zustand";

interface UserProfile {
  userName: string;
  userAge: string;
  isOnboarded: boolean;
}

interface UserStore extends UserProfile {
  setOnboardingData: (name: string, age: string) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  resetOnboarding: () => void;
}

const STORAGE_KEY = "rhythmx_user_profile";

const loadUserProfile = (): UserProfile => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.userName && parsed.isOnboarded) {
          return {
            userName: String(parsed.userName).trim(),
            userAge: String(parsed.userAge || "").trim(),
            isOnboarded: Boolean(parsed.isOnboarded),
          };
        }
      }
    } catch {
      // Fallback
    }
  }
  return {
    userName: "",
    userAge: "",
    isOnboarded: false,
  };
};

export const useUserStore = create<UserStore>((set) => ({
  ...loadUserProfile(),

  setOnboardingData: (name: string, age: string) => {
    const profile = {
      userName: name.trim() || "Guest",
      userAge: age.trim() || "20",
      isOnboarded: true,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (err) {
        console.warn("Failed to save profile to localStorage:", err);
      }
    }
    set(profile);
  },

  updateProfile: (partial) => {
    set((state) => {
      const updated = {
        userName: partial.userName !== undefined ? partial.userName.trim() : state.userName,
        userAge: partial.userAge !== undefined ? partial.userAge.trim() : state.userAge,
        isOnboarded: partial.isOnboarded !== undefined ? partial.isOnboarded : state.isOnboarded,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  },

  resetOnboarding: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    set({
      userName: "",
      userAge: "",
      isOnboarded: false,
    });
  },
}));
