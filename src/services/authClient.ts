import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import router from '@/router';

const authClient: AxiosInstance = axios.create({
  //baseURL: import.meta.env.INFELO_API_URL,  //auth
  timeout: 10000,
  withCredentials: true,
});

 async function checkAuth() {
  try {
    const response = await authClient.get('api/auth/isauth', { withCredentials: true });
    return {
      isAuthenticated: true,
      user: response.data
    };
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      return { isAuthenticated: false, user: null };
    }
    throw error;
  }
 }

//import { checkAuth } from './authClient'

let authState = {
  initialized: false,
  isAuthenticated: false,
  user: null
}

export async function initAuth() {
  if (authState.initialized) return authState
  return await refreshAuth()
}

export async function refreshAuth() {
  try {

    const result = await checkAuth()
    authState.isAuthenticated = result.isAuthenticated
    authState.user = result.user || null
  } catch (err) {
    authState.isAuthenticated = false
    authState.user = null
  }
  authState.initialized = true
  return authState
}

export function getAuthState() {
  return authState
}

export function getUser() {
  return authState?.user || "";
}

export function loggedIn(user: any) {
  authState.initialized = true
  authState.isAuthenticated = user.isAuthenticated
  authState.user = user || null
  return authState
}

export function resetAuth() {
  authState = {
    initialized: false,
    isAuthenticated: false,
    user: null
  }
}

authClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const currentPath = router.currentRoute.value.path;
      //console.log('sdfsdf', currentPath);
      
      if (currentPath !== '/login') {
        //const returnUrl = encodeURIComponent(router.currentRoute.value.fullPath);
        //window.location.href = `/login?returnUrl=${returnUrl}`;
        const returnUrl = router.currentRoute.value.fullPath;
        router.push({ path: '/login', query: { returnUrl } });
      }
      
    }
    return Promise.reject(error);
  }
);

export default authClient;
