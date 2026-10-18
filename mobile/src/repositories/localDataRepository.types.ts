import type { PendingVisitPhoto, Reservation, VisitedShop } from '../data/types';

export type LocalAppData = {
  reservations: Reservation[];
  visitedShops: VisitedShop[];
  notificationsEnabled: boolean;
  pendingVisitPhoto: PendingVisitPhoto | null;
};

export type LocalDataRepository = {
  loadLocalAppData: () => Promise<LocalAppData>;
  saveReservation: (reservation: Reservation) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  saveVisitedShop: (shop: VisitedShop) => Promise<void>;
  clearVisitedShops: () => Promise<void>;
  saveNotificationsEnabled: (enabled: boolean) => Promise<void>;
  savePendingVisitPhoto: (photo: PendingVisitPhoto) => Promise<void>;
  deletePendingVisitPhoto: () => Promise<void>;
};

export const emptyLocalAppData: LocalAppData = {
  reservations: [],
  visitedShops: [],
  notificationsEnabled: true,
  pendingVisitPhoto: null,
};
