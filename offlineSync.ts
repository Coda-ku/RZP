/**
 * Utility untuk mengelola data offline (LocalStorage)
 */

const CACHE_PREFIX = 'rzp_cache_';

export const saveLocal = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  }
};

export const getLocal = (key: string) => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const updateLocalCache = (key: string, newData: any) => {
  if (typeof window !== 'undefined') {
    const currentData = getLocal(key) || [];
    // Tambahkan data baru dengan ID sementara jika perlu
    const updatedData = [newData, ...currentData];
    saveLocal(key, updatedData);
    return updatedData;
  }
  return [];
};

export const queueOfflineMutation = (type: 'products' | 'clients' | 'quotes' | 'invoices', data: any) => {
  if (typeof window !== 'undefined') {
    const queue = JSON.parse(localStorage.getItem('rzp_sync_queue') || '[]');
    queue.push({ type, data, timestamp: Date.now() });
    localStorage.setItem('rzp_sync_queue', JSON.stringify(queue));
  }
};

export const syncOfflineData = async () => {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  
  const queue = JSON.parse(localStorage.getItem('rzp_sync_queue') || '[]');
  if (queue.length === 0) return;

  const remainingQueue = [];
  for (const task of queue) {
    try {
      const res = await fetch(`/api/${task.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task.data),
      });
      if (!res.ok) throw new Error('Sync failed');
    } catch (error) {
      remainingQueue.push(task);
    }
  }

  localStorage.setItem('rzp_sync_queue', JSON.stringify(remainingQueue));
  return queue.length - remainingQueue.length;
};