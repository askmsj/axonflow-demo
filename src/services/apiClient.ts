import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
// import router from '@/router';

const apiClient: AxiosInstance = axios.create({
  //baseURL: 
  timeout: 20000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // const returnUrl = encodeURIComponent(router.currentRoute.value.fullPath);
      // window.location.href = `/login?returnUrl=${returnUrl}`;
      console.log('401 error - would redirect to login');
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {

  //jest w create , ale tak dla pewnosci
  config.withCredentials = true;

  //worksapceid
  // const currentRoute = router.currentRoute.value;
  // const workspaceId = Number(currentRoute.params.workspaceId ?? 0);
  const workspaceId = 1; // Default workspace ID for now
  //if (!workspaceId) return config;

  config.headers = config.headers || {};
  config.headers['workspaceId'] = workspaceId;

  const method = config.method?.toLowerCase() || "";

  //wstrzykujemy worksapceid - po /api/{}
  if (config.url && !config.url.match(/^\/?api\/\d+\//)) {
    config.url = config.url.replace(/^\/?api\//, `/api/${workspaceId}/`);
  }

  //ws do get
  //if (method === 'get') {
  //  config.params = {
  //    ...(config.params || {}),
  //    workspaceId,
  //  };
  //}

  ////ws do postow
  //if (['post', 'put', 'patch'].includes(method)) {
  //  if (typeof config.data === 'object' && config.data !== null) {
  //    config.data = {
  //      ...config.data,
  //      workspaceId,
  //    };
  //  }
  //}

  return config;
});

export default apiClient;
