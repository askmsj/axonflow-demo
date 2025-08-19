
import type { Project } from '@/Models/generated/project';
import apiClient from '@/services/apiClient';

export async function lookupProjects(query: string, skip = 0, pageSize = 25, filters: Record<string, string>[] = []) {
  const filterParams = filters.reduce((values, { key, value }) => {
    values[`filters[${key}]`] = value;
    return values;
  }, {} as Record<string, string>);

  const response = await apiClient.get(`/api/project/GetAllProjectsLookup`, {
    params: { query, skip, pageSize, ...filterParams }
  });

  return response.data as { items: Project[]; totalCount: number };
}

export async function getProjectsList(): Promise<Project[]> {

  try {
    const response = await apiClient.get('api/project/GetAllProjects');
    return response.data as Project[];
  } catch (error) {
    console.error('ailed to fetch projects:', error);
    throw error;
  }

}

export async function getUserProjects(): Promise<Project[]> {

  try {
    const response = await apiClient.get(`/api/project/GetUserProjects`);
    return response.data as Project[];
  } catch (error) {
    console.error('ailed to fetch projects:', error);
    throw error;
  }

}


export default {
  lookupProjects,
  getProjectsList,
  getUserProjects
};
