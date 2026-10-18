const STORAGE_KEY = 'todooo.ownerKey';

export function getOwnerKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setOwnerKey(value: string): void {
  localStorage.setItem(STORAGE_KEY, value);
}

export function clearOwnerKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}
