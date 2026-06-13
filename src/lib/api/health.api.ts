import { api } from './client';
export const getHealth = () => api.get<{status?:string;message?:string;uptime?:number;timestamp?:string}>('/health');
