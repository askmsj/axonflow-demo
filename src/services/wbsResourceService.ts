
import type { WbsResource } from '@/Models/generated/wbs-resource';
import type { WbsItem} from '@/Models/generated/wbs-item';
import api from '@/services/apiClient';
import apiClient from '@/services/apiClient';
import type { LoadOptions } from 'devextreme/data';

const API_BASE = '/api/WbsResources';


export async function dxLoad(loadOptions: any) {
  try {
    const response = await apiClient.get(`${API_BASE}/Get`, {
      params: loadOptions,
    });
    return response.data;
  } catch (error) {
    console.error('Load error:', error);
    throw 'Data loading error';
  }
}
export async function dxinsert(values: Partial<WbsResource>) {
  
  try {
    const response = await apiClient.post(`${API_BASE}/Post`, {
      values: JSON.stringify(values),
    });
    return response.data;
  } catch (error) {
    console.error('Insert error:', error);
    throw 'Insert failed';
  }
}
export async function dxupdate(key: number, values: Partial<WbsResource>) {
  try {
    await apiClient.put(`${API_BASE}/Put`, null, {
      params: {
        key,
        values: JSON.stringify(values),
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    throw 'Update failed';
  }
}
export async function dxremove(key: number) {
  try {
    await apiClient.delete(`${API_BASE}/Delete`, {
      params: { key },
    });
  } catch (error) {
    console.error('Delete error:', error);
    throw 'Delete failed';
  }
}

//nie działa, cos brakuje loadparams na backend tych search 
export async function lookupResources_2check(query: string, skip = 0, pageSize = 25, filters: Record<string, string>[] = []
): Promise<{ data: any[]; totalCount: number }> {
  const filterParams = filters.reduce((values, { key, value }) => {
    values[`filters[${key}]`] = value;
    return values;
  }, {} as Record<string, string>);

  const loadOptions: LoadOptions = {
    searchExpr: 'Name',
    searchOperation: 'contains',
    searchValue: query,
    skip,
    take: pageSize
  };
  
  if (filters.length) {
    loadOptions.filter = filters.map(f => [f.key, '=', f.value]);
  }

  const result = await dxLoad(loadOptions);
  return result;

}

export async function searchResources1(query: string, skip = 0, pageSize = 25) {
  const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}&skip=${skip}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json() as { items: WbsResource[]; totalCount: number };
}

//axios
export async function lookupResources(query: string, skip = 0, pageSize = 25, filters: Record<string, string>[] = []) {
  const filterParams = filters.reduce((values, { key, value }) => {
    values[`filters[${key}]`] = value;
    return values;
  }, {} as Record<string, string>);

  const response = await apiClient.get(`${API_BASE}/Search`, {
    withCredentials: true,
    params: { query, skip, pageSize, ...filterParams }
  });

  return response.data as { data: WbsResource[]; totalCount: number };
}

export async function createResource(data: any): Promise<WbsResource> {
  const form = new FormData();
  form.append("values", JSON.stringify(data));
  try {
    const response = await apiClient.post(`${API_BASE}/Post`, form);
    return response.data as WbsResource;
  } catch (error: any) {
    const message = error.response?.data || 'Failed to create resource.';
    throw new Error(message);
  }
}


export default {
  dxLoad,
  //searchResources,
  lookupResources,
  createResource,
};
