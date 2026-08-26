const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
export const USER_API_END_POINT = `${BASE_URL}/api/v1/user`;
export const POST_API_END_POINT = `${BASE_URL}/api/v1/post`;
export const MESSAGE_API_END_POINT = `${BASE_URL}/api/v1/message`;