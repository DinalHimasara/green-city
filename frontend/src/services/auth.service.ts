import axios from "axios";
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "driver";
  profilePic?: string;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
}

export const authService = {
      login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await axios.post("http://localhost:5000/users/login", { email, password });
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      const user: User = {
        id: payload._id,
        name: payload.firstName + " " + payload.lastName,
        email: payload.email,
        role: payload.role,
      };

      setCookie("auth_token", token);
      setCookie("user_role", user.role);
      localStorage.setItem("token", token);
      localStorage.setItem("user_profile", JSON.stringify(user));

      return { token, user };
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Invalid email or password.");
    }
  },

    logout: async (): Promise<void> => {
      deleteCookie("auth_token");
      deleteCookie("user_role");
      localStorage.removeItem("token");
      localStorage.removeItem("user_profile");
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = getCookie("auth_token");
    if (!token) return null;

    const profileStr = localStorage.getItem("user_profile");
    if (profileStr) {
      try {
        return JSON.parse(profileStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};
