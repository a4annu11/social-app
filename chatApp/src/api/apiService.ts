import ApiClient from '../apiClient/hostClient';
import { showError } from '../utils/ToastMessage';

class ApiService {
  signUp = async (payload: any) => {
    console.log('PAYLOAD::', payload);
    try {
      const res = await ApiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(res, 'res from sign up');
      return res;
    } catch (error) {
      console.log(error, 'error from sign up');
      return error;
    }
  };

   login = async (payload: any) => {
    console.log('PAYLOAD::', payload);
    try {
      const res = await ApiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(res, 'res from login');
      return res;
    } catch (error) {
      console.log(error, 'error from login');
      return error;
    }
  };
}

const apiService = new ApiService();
export default apiService;
