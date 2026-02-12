import type { Token, WebResultUser } from '@en/common/user';
export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<WebResultUser | null>(null); //用户信息
    const setUser = (params: WebResultUser) => {
      user.value = params; //设置用户信息
    };

    const getUser = computed(() => user.value); //获取用户信息

    const getAccessToken = computed(() => user.value?.token?.accessToken); //获取用户的 accessToken
    const getRefreshToken = computed(() => user.value?.token?.refreshToken); //获取用户的 refreshToken
    // 更新token
    const updateToken = (newToken: Token) => {
      user.value!.token = newToken;
    };

    const logout = () => {
      user.value = null; //退出登录
    };

    return {
      user,
      setUser,
      getUser,
      getAccessToken,
      getRefreshToken,
      updateToken,
      logout
    };
  },
  { persist: true }
);
