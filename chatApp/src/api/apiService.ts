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

  getMyProfile = async () => {
    try {
      const res = await ApiClient('/user/profile', {
        method: 'GET',
      });
      console.log(res, 'res from getMyProfile');
      return res;
    } catch (error) {
      console.log(error, 'error from getMyProfile');
      return error;
    }
  };


  //HOME
  getFeed = async () => {
    try {
      const res = await ApiClient('/content/feed', {
        method: 'GET',
      });
      console.log(res, 'res from getFeed');
      return res;
    } catch (error) {
      console.log(error, 'error from getFeed');
      return error;
    }
  }

    getOtherUserProfile = async (payload: any) => {
    try {
      const res = await ApiClient(`/user/profile/${payload?.username}`, {
        method: 'GET',
      });
      console.log(res, 'res from getOtherUserProfile');
      return res;
    } catch (error) {
      console.log(error, 'error from getOtherUserProfile');
      return error;
    }
  };

}

const apiService = new ApiService();
export default apiService;
