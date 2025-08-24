import apiClient from '@/services/apiClient';
import { Folder } from '@/Models/generated/folder';

const API_BASE = '/api/folder';

export interface FolderTreeNode {
  id?: number;
  name: string;
  type?: string;
  description?: string;
  level?: number;
  hasChildren?: boolean;
  expanded?: boolean;
  accessible?: boolean;
  children?: FolderTreeNode[];
  badgeCount?: number;
}



export default {
  get: async (loadOptions: any): Promise<Folder[]> => {
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
  details: async (folderId: number): Promise<Folder> => {
    return new Promise((resolve, reject) => {
      apiClient.get(`${API_BASE}/get`, {
        params: {
          folderId: folderId
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

  create: async function (folder: Folder): Promise<Folder> {
    try {

      const response = await apiClient.post(`${API_BASE}/post`, folder);

      return response.data;
    } catch (error) {
      console.error('Update error:', error);
      throw 'Update failed';
    }

  },
  update: async function (folder: Folder): Promise<Folder> {
    try {

      const response = await apiClient.put(`${API_BASE}/put`, folder);

      return response.data;
    } catch (error) {
      console.error('Update error:', error);
      throw 'Update failed';
    }

  }
};
