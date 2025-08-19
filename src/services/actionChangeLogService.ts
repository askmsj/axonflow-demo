// ActionChangeLogService.ts
// Serwis do obsługi logów zmian akcji

import { ref, computed } from 'vue'
import apiClient from '@/services/apiClient';
import type { ActionChangeLog } from '@/Models/generated/action-change-log';

const changeLogs = ref<ActionChangeLog[]>([])

export function useUndoManager() {

  async function fetchChangeLogs() {
    const {data} = await apiClient.get<ActionChangeLog[]>('/api/ActionChangeLog/get')

    changeLogs.value = Array.isArray(data) ? data : (data ? [data] : []);
      //changeLogs.value = data ?? [] //.unshift(res.data)
    console.debug('logs111', changeLogs.value, data);
  }

  async function fetchLastLog() {
    const res = await apiClient.get<ActionChangeLog>('/api/ActionChangeLog/last')
    if (res.data) {
      changeLogs.value.unshift(res.data)
    }
  }

  async function undoLast(entityType: string) {
    const { data } = await apiClient.post('/api/ActionChangeLog/UndoLastChange', null, {
      params: { entityType },
    });
    if (data?.success && typeof data.logId === 'number') {
      const log = changeLogs.value.find(l => l.id === data.logId);
      if (log) log.isUndone = true;
    }
    return data
    //await fetchLastLog()
  }

  const pushChange = (change: ActionChangeLog) => {
    changeLogs.value.unshift(change);
  };

  const popUndo = (): ActionChangeLog | undefined => {
    const last = changeLogs.value.shift();
    //if (last) redo.value.push(last);
    return last;
  };

  function size() {
    return changeLogs.value.length
  }

  function hasUndoForType(type: string) {
    return changeLogs.value.some(log => log.entityType === type && !log.isUndone)
  }

  const undoAvailable = (type: string) =>
    computed(() => hasUndoForType(type))
  

  return {
    changeLogs,
    undoLast,
    fetchChangeLogs,
    fetchLastLog,
    pushChange,
    popUndo,
    size,
    undoAvailable
  }
}
