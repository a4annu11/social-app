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
  togglePrivateAccount = async () => {
    try {
      const res = await ApiClient('/user/profile/toggle-private', {
        method: 'PATCH',
      });
      console.log(res, 'res from togglePrivateAccount');
      return res;
    } catch (error) {
      console.log(error, 'error from togglePrivateAccount');
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

  getMyFollowRequests = async () => {
    try {
      const res = await ApiClient('/user/profile/my/follow-requests', {
        method: 'GET',
      });
      console.log(res, 'res from getMyFollowRequests');
      return res;
    } catch (error) {
      console.log(error, 'error from getMyFollowRequests');
      return error;
    }
  };

  getUserFollowers = async (payload: any) => {
    try {
      const res = await ApiClient(
        `/user/profile/${payload?.userId}/followers`,
        {
          method: 'GET',
        },
      );
      console.log(res, 'res from getUserFollowers');
      return res;
    } catch (error) {
      console.log(error, 'error from getUserFollowers');
      return error;
    }
  };

  getUserFollowing = async (payload: any) => {
    try {
      const res = await ApiClient(
        `/user/profile/${payload?.userId}/following`,
        {
          method: 'GET',
        },
      );
      console.log(res, 'res from getUserFollowing');
      return res;
    } catch (error) {
      console.log(error, 'error from getUserFollowing');
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

  createPost = async (payload: any) => {
    try {
      const res = await ApiClient('/content/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(res, 'res from createPost');
      return res;
    } catch (error) {
      console.log(error, 'error from createPost');
      return error;
    }
  };

  deletePost = async (payload: any) => {
    try {
      const res = await ApiClient(`/content/posts/${payload?.postId}`, {
        method: 'DELETE',
      });
      console.log(res, 'res from deletePost');
      return res;
    } catch (error) {
      console.log(error, 'error from deletePost');
      return error;
    }
  };

  savePost = async (payload: any) => {
    try {
      const res = await ApiClient(`/content/save/${payload?.postId}`, {
        method: 'POST',
      });
      console.log(res, 'res from savePost');
      return res;
    } catch (error) {
      console.log(error, 'error from savePost');
      return error;
    }
  };

  getSavedPosts = async () => {
    try {
      const res = await ApiClient('/content/saved', {
        method: 'GET',
      });
      console.log(res, 'res from getSavedPosts');
      return res;
    } catch (error) {
      console.log(error, 'error from getSavedPosts');
      return error;
    }
  };

  getUserPosts = async (payload: any) => {
    try {
      const res = await ApiClient(`/content/posts/user/${payload?.userId}`, {
        method: 'GET',
      });
      console.log(res, 'res from getUserPosts');
      return res;
    } catch (error) {
      console.log(error, 'error from getUserPosts');
      return error;
    }
  };

  //STORY
  createStory = async (payload: any) => {
    try {
      const res = await ApiClient('/story/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(res, 'res from createStory');
      return res;
    } catch (error) {
      console.log(error, 'error from createStory');
      return error;
    }
  };
  viewStory = async (payload: any) => {
    try {
      const res = await ApiClient(`/story/view/${payload?.storyId}`, {
        method: 'POST',
      });
      console.log(res, 'res from viewStory');
      return res;
    } catch (error) {
      console.log(error, 'error from viewStory');
      return error;
    }
  };

  getStoryViewers = async (payload: any) => {
    try {
      const res = await ApiClient(`/story/get/viewers/${payload?.storyId}`, {
        method: 'GET',
      });
      console.log(res, 'res from getStoryViewers');
      return res;
    } catch (error) {
      console.log(error, 'error from getStoryViewers');
      return error;
    }
  };

  getStoryFeed = async () => {
    try {
      const res = await ApiClient('/story/story-feed', {
        method: 'GET',
      });
      console.log(res, 'res from getStoryFeed');
      return res;
    } catch (error) {
      console.log(error, 'error from getStoryFeed');
      return error;
    }
  };
}

const apiService = new ApiService();
export default apiService;
