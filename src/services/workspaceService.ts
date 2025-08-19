
import type { Workspace } from '@/Models/generated/workspace';
import apiClient from '@/services/apiClient';

export async function lookupWorkspaces(query: string, skip = 0, pageSize = 25, filters: Record<string, string>[] = []) {
  const filterParams = filters.reduce((values, { key, value }) => {
    values[`filters[${key}]`] = value;
    return values;
  }, {} as Record<string, string>);

  const response = await apiClient.get(`/api/workspace/lookup`, {
    params: { query, skip, pageSize, ...filterParams }
  });

  return response.data as { items: Workspace[]; totalCount: number };
}

export async function getWorkspacesList(): Promise<Workspace[]> {

  try {
    const response = await apiClient.get('api/workspace/workspacesList');
    return response.data as Workspace[];
  } catch (error) {
    console.error('ailed to fetch projects:', error);
    throw error;
  }

}


export default {
  lookupWorkspaces,
  getWorkspacesList,
};
