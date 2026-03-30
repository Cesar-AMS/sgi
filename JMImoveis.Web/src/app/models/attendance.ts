
export interface AttendanceVm {
  id: number;
  date: string;                 // 'YYYY-MM-DD'
  startedAt: string;            // 'HH:mm:ss'
  finishedAt?: string | null;   // 'HH:mm:ss' | null
  authorId: number;
  userId: number;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface AttendanceUpsert {
  date: string;                 // 'YYYY-MM-DD'
  startedAt: string;            // 'HH:mm:ss'
  finishedAt?: string | null;   // 'HH:mm:ss'
  authorId: number;
  userId: number;
}

export interface PagedResultAttendanceVm<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}