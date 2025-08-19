import apiClient from '@/services/apiClient';
import { ApplicationUser } from '@/Models/generated/application-user';

const API_BASE = '/api/applicationuser';



export default {
  get: async (loadOptions: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      apiClient.get(`${API_BASE}/get`, {
        params: {
          loadOptions: JSON.stringify(loadOptions),
        },
        withCredentials: true
      })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.error('Error fetching users:', error);
          reject(error);
        });



    });
  },

  getById: async (id: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      apiClient.get(`${API_BASE}/getById`, {
        params: {
          id: id,
        },
        withCredentials: true
      })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.error('Error fetching user:', error);
          reject(error);
        });



    });

  },


};
