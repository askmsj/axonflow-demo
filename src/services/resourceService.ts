import type { Resource } from '@/Models/generated/resource';
import apiClient from '@/services/apiClient';
//import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';

const resourcesCache: Record<string, Resource[]> = {};

export async function getList(type: string = 'human', forceRefresh = false): Promise<Resource[]> {
  if (!forceRefresh && resourcesCache[type]) {
    return resourcesCache[type];
  }

  try {
    const response = await apiClient.get<Resource[]>(`api/resource/GetAllResources`,
      { params: { type } }
    );
    resourcesCache[type] = response.data;
    return response.data as Resource[];
  } catch (error) {
    console.error('failed to fetch resources:', error);
    throw error;
  }
}

export async function getByKey(id: number, type: string = 'human', forceRefresh = false): Promise<Resource> {
  if (!forceRefresh && resourcesCache[type]) {
    return resourcesCache[type].find(x => x.id == id) as Resource;
  }

  try {
    const response = await apiClient.get<Resource[]>(`api/resource/GetAllResources`,
      { params: { type } }
    );
    resourcesCache[type] = response.data;
    return response.data.find(x => x.id == id) as Resource;
  } catch (error) {
    console.error('failed to fetch resources:', error);
    throw error;
  }
}

export function getByKeySync(id: number, type: string = 'human', forceRefresh = false):  Resource | null {  
    return !forceRefresh && resourcesCache[type] ? resourcesCache[type].find(x => x.id == id) as Resource : null; 
}

/**
 * Preloads a specific resource type into cache.
 */
export async function preload(type: string = 'human'): Promise<void> {
  await getList(type, true);
}

/**
 * Creates a DevExtreme DataSource for resources filtered by type.
 * @param type Resource type (e.g., "human", "tool", etc.)
 * @returns DevExtreme DataSource instance
 */
export function createResourceDataSource(type: string = "human") {
  return new CustomStore({
    key: 'id',
    load: async () => {
      const data = await getList(type);
      return data;
    },
    byKey: async (id: number) => {
      const resource = await getByKey(id, type);
      return resource;
    }
  });
}



export default {
  getList,
  getByKey,
  getByKeySync,
  createResourceDataSource,
  preload
};
