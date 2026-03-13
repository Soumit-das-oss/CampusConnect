import useUserStore from '../store/userStore'
import { login as loginService } from '../services/authService'

const useAuth = () => {
  const user = useUserStore((state) => state.user)
  const token = useUserStore((state) => state.token)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const setUser = useUserStore((state) => state.setUser)
  const logoutStore = useUserStore((state) => state.logout)

  const login = async (email, password) => {
    const data = await loginService(email, password)
    setUser(data.user, data.token)
    return data
  }

  const logout = () => {
    logoutStore()
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }
}

export default useAuth
