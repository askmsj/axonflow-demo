import apiClient from '@/services/apiClient';
import { TaskItem } from '@/Models/generated/task-item';

const API_BASE = '/api/taskitem';



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
          console.error('Error fetching projects:', error);
          reject(error);
        });



    });
  },

  dxinsert: async function (values: Partial<TaskItem>): Promise<TaskItem> {
    try {

      const response = await apiClient.post(`${API_BASE}/post`, values);

      return response.data;
    } catch (error) {
      console.error('Update error:', error);
      throw 'Update failed';
    }

  },
  dxupdate: async function (key: number, values: Partial<TaskItem>): Promise<TaskItem> {
    try {

      const response = await apiClient.put(`${API_BASE}/put`, values);

      return response.data;
    } catch (error) {
      console.error('Update error:', error);
      throw 'Update failed';
    }

  }
};
