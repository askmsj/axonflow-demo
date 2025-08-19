// czy to jest gdziekolwiek uzywane?
import type { ApplicationUser } from '@/Models/generated/application-user';
import apiClient from '@/services/apiClient';

export async function lookupUsers(query: string, skip = 0, pageSize = 25, filters: Record<string, string>[] = []) {
  const filterParams = filters.reduce((values, { key, value }) => {
    values[`filters[${key}]`] = value;
    return values;
  }, {} as Record<string, string>);

  const response = await apiClient.get(`/api/user/lookup`, {
    params: { query, skip, pageSize, ...filterParams }
  });

  return response.data as { items: ApplicationUser[]; totalCount: number };
}

export async function getUsersList(): Promise<ApplicationUser[]> {
  try {
    const response = await apiClient.get('api/user/usersList');
    return response.data as ApplicationUser[];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

export default {
  lookupUsers,
  getUsersList,
};
