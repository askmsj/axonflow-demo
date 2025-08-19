import apiClient from '@/services/apiClient'
import type { Unit } from '@/Models/generated/unit'
import { Resource } from '@/Models/generated/resource';
import { Attribute } from '@/Models/generated/attribute';
import resourceService from '@/services/resourceService';
import attributeService from '@/services/attributeService';



export async function fetchUnits(): Promise<Unit[]> {
  const { data } = await apiClient.get<Unit[]>('/api/staticdata/getunits')
  return data
}
export async function fetchHumanResources(): Promise<Resource[]> {
  return await resourceService.preload("human"); //await resourceService.getList("human")
  //return data
}

export async function fetchAttributes(): Promise<Attribute[]> {
 
  //route.params && this.$route.params.workspaceId ? this.$route.params.workspaceId : null;

  return await attributeService.preload(); //await resourceService.getList("human")
  //return data
}


