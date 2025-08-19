
import type { Attribute } from '@/Models/generated/attribute';

import api from '@/services/apiClient';
import apiClient from '@/services/apiClient';


const API_BASE = '/api/attribute';

export async function get(): Promise<Attribute[]> {
    try {
        const response = await apiClient.get(`${API_BASE}/get`);
        return response.data;
    } catch (error) {
        console.error('get error:', error);
        throw 'get failed';
    }
}

export async function details(attributeId: number): Promise<Attribute> {
  try {
    const response = await apiClient.get(`${API_BASE}/details/${attributeId}`);
    return response.data;
  } catch (error) {
    console.error('get error:', error);
    throw 'get failed';
  }
}

export async function create(attribute: Attribute): Promise<Attribute> {
  try {
    const response: any = await apiClient.post(`${API_BASE}/Post`, 
      attribute,
    );
    return response.data as Attribute;
  } catch (error) {
    console.error('Insert error:', error);
    throw 'Insert failed';
  }
}
export async function update(attribute: Attribute) {
  try {
  
    const response = await apiClient.put(`${API_BASE}/put`, attribute);

    return response.data as Attribute;
  } catch (error) {
    console.error('Update error:', error);
    throw 'Update failed';
  }
}
export async function remove(key: number): Promise<void> {
  try {

    await apiClient.delete(`${API_BASE}/Delete/${key}`);

  
  } catch (error) {
    console.error('Delete error:', error);
    throw 'Delete failed';
  }
}

 


export default {
  create,
  update,
  remove,
  get,
  details
};
