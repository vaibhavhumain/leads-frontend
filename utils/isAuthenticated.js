// utils/isAuthenticated.js
import { jwtDecode } from 'jwt-decode';

const isAuthenticated = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export default isAuthenticated;
