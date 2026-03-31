import { unwrapData } from '@/shared/api/service.utils.js';
import { api } from '@/shared/lib/apiClient.js';

export const otpService = {
 
  sendOTP: async (email) => {
    return unwrapData(await api.post('/otp/send', { email }));
  },

 
  verifyOTP: async (data) => {
    return unwrapData(await api.post('/otp/verify', data));
  }
};    