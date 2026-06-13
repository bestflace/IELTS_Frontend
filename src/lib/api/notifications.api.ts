import { api } from './client';
import type { Notification, QueryParams } from '@/types';
export const getNotifications = (params?:QueryParams & {unreadOnly?:boolean}) => api.getWithMeta<Notification[]>('/notifications',{params});
export const getUnreadCount = () => api.get<{count:number}>('/notifications/unread-count');
export const markNotificationRead = (id:string) => api.post(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post('/notifications/read-all');
