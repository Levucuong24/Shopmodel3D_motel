const AUTH_KEYS = ["userRole", "authToken", "userData"];

export function clearLegacyAuthStorage() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function setAuthSession(token, user) {
  clearLegacyAuthStorage();
  sessionStorage.setItem("authToken", token);
  sessionStorage.setItem("userRole", user.role);
  sessionStorage.setItem("userData", JSON.stringify(user));
}

export function clearAuthSession() {
  AUTH_KEYS.forEach((key) => sessionStorage.removeItem(key));
  clearLegacyAuthStorage();
}

export function getAuthToken() {
  return sessionStorage.getItem("authToken");
}

export function getUserRole() {
  return sessionStorage.getItem("userRole");
}

export function getUserId() {
  return getUserData()?._id || null;
}

export function getUserData() {
  try {
    return JSON.parse(sessionStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
}

export function setUserData(user) {
  sessionStorage.setItem("userData", JSON.stringify(user));
}

export function getWelcomePath(user) {
  const userId = user?._id;
  return userId ? `/welcome/${userId}` : "/welcome";
}
