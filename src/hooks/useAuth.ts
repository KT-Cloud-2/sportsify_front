import { useAuthStore } from '../store/auth'
import { logout as logoutApi } from '../api/auth'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const { accessToken, refreshToken, user, clear } = useAuthStore()
  const navigate = useNavigate()

  const isAuthenticated = accessToken !== null

  const handleLogout = async () => {
    if (accessToken && refreshToken) {
      await logoutApi(accessToken, refreshToken).catch(() => {})
    }
    clear()
    navigate('/login')
  }

  return { isAuthenticated, user, handleLogout }
}
