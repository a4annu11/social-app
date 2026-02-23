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
  };

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

  toggleLikePost = async (payload: any) => {
    try {
      const res = await ApiClient(`/content/posts/${payload?.postId}/like`, {
        method: 'PUT',
      });
      console.log(res, 'res from likeUnlikePost');
      return res;
    } catch (error) {
      console.log(error, 'error from likeUnlikePost');
      return error;
    }
  };

  followUser = async (payload: any) => {
    try {
      const res = await ApiClient(`/user/profile/follow/${payload?.userId}`, {
        method: 'POST',
      });
      console.log(res, 'res from FollowUser');
      return res;
    } catch (error) {
      console.log(error, 'error from FollowUser');
      return error;
    }
  };

  acceptFollowRequest = async (payload: any) => {
    try {
      const res = await ApiClient(`/user/profile/accept/${payload?.userId}`, {
        method: 'POST',
      });
      console.log(res, 'res from acceptFollowRequest');
      return res;
    } catch (error) {
      console.log(error, 'error from acceptFollowRequest');
      return error;
    }
  };

  unFollowUser = async (payload: any) => {
    try {
      const res = await ApiClient(`/user/profile/unfollow/${payload?.userId}`, {
        method: 'POST',
      });
      console.log(res, 'res from unFollowUser');
      return res;
    } catch (error) {
      console.log(error, 'error from unFollowUser');
      return error;
    }
  };

  addComment = async (payload: any) => {
    try {
      const res = await ApiClient(
        `/content/posts/${payload?.postId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
      console.log(res, 'res from addComment');
      return res;
    } catch (error) {
      console.log(error, 'error from addComment');
      return error;
    }
  };

  getPostComment = async (payload: any) => {
    try {
      const res = await ApiClient(
        `/content/posts/${payload?.postId}/comments`,
        {
          method: 'GET',
        },
      );
      console.log(res, 'res from getPostComment');
      return res;
    } catch (error) {
      console.log(error, 'error from getPostComment');
      return error;
    }
  };

  deleteComment = async (payload: any) => {
    try {
      const res = await ApiClient(`/content/comments/${payload?.commentId}`, {
        method: 'DELETE',
      });
      console.log(res, 'res from deleteComment');
      return res;
    } catch (error) {
      console.log(error, 'error from deleteComment');
      return error;
    }
  };
  toggleLikeComment = async (commentId: string) => {
    try {
      const res = await ApiClient(`/content/comments/${commentId}/like`, {
        method: 'PUT',
      });
      return res;
    } catch (error) {
      console.log(error, 'error from toggleLikeComment');
      return null;
    }
  };
}

const apiService = new ApiService();
export default apiService;
