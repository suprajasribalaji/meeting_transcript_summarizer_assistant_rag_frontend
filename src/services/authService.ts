const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// -------------------------------------------------------------------------- //
// Types
// -------------------------------------------------------------------------- //

interface SignupResponse {
  success: boolean
  user_id?: string
  email?: string
  message: string
}

interface LoginResponse {
  success: boolean
  user_id?: string
  email?: string
  username?: string
  access_token?: string
  refresh_token?: string
  message?: string
}

interface UserProfile {
  id: string
  email: string
  username?: string
  created_at: string
  updated_at: string
}

interface AuthResult {
  success: boolean
  message: string
}

// -------------------------------------------------------------------------- //
// JWT helpers
// -------------------------------------------------------------------------- //

/**
 * Decode the expiry claim from a JWT without verifying the signature.
 * Verification happens server-side; here we just need the exp timestamp
 * to decide whether to attempt a request or auto-logout immediately.
 */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token)
  if (!exp) return true
  // Consider expired 30 seconds early to avoid edge-case 401s
  return Date.now() / 1000 > exp - 30
}

// -------------------------------------------------------------------------- //
// AuthService
// -------------------------------------------------------------------------- //

class AuthService {
  // ------------------------------------------------------------------------ //
  // Core fetch wrapper
  // ------------------------------------------------------------------------ //

  /**
   * FIX: Central fetch helper for all authenticated requests.
   * - Attaches Bearer token automatically
   * - Auto-logs out and redirects to / on 401
   * - Throws typed errors so callers don't have to inspect status codes
   */
  private async fetchWithAuth(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getAccessToken()

    // Proactively catch expired tokens before even making the request
    if (!token || isTokenExpired(token)) {
      this._clearSession()
      // Don't redirect here - let components handle navigation
      throw new Error('Session expired. Please log in again.')
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    // FIX: Auto-logout on any 401 from the server (e.g. token revoked)
    if (response.status === 401) {
      this._clearSession()
      // Don't redirect here - let components handle navigation
      throw new Error('Session expired. Please log in again.')
    }

    return response
  }

  /**
   * Authenticated POST with multipart body. Does not set Content-Type so the
   * browser can send the correct multipart boundary for FormData.
   */
  async fetchWithAuthFormData(
    path: string,
    formData: FormData
  ): Promise<Response> {
    const token = this.getAccessToken()

    if (!token || isTokenExpired(token)) {
      this._clearSession()
      throw new Error('Session expired. Please log in again.')
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (response.status === 401) {
      this._clearSession()
      throw new Error('Session expired. Please log in again.')
    }

    return response
  }

  // ------------------------------------------------------------------------ //
  // Public auth methods
  // ------------------------------------------------------------------------ //

  async signup(
    email: string,
    password: string,
    fullName: string
  ): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.detail || 'Signup failed' }
      }

      return data
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Signup error'
      return { success: false, message: msg }
    }
  }

  // --------------------------------------------------------------------------
  // Availability checks
  // --------------------------------------------------------------------------

  async checkEmail(email: string): Promise<{ available: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`)
    const data = await response.json()
    return { available: data.available, message: data.message }
  }

  async checkUsername(username: string): Promise<{ available: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(username)}`)
    const data = await response.json()
    return { available: data.available, message: data.message }
  }

  async signin(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.detail || 'Login failed' }
      }

      if (data.access_token) {
        this._saveSession(data)
      }

      return data
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Login error'
      return { success: false, message: msg }
    }
  }

  async signout(): Promise<void> {
    try {
      const token = this.getAccessToken()
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this._clearSession()
    }
  }

  // ------------------------------------------------------------------------ //
  // Profile methods
  // ------------------------------------------------------------------------ //

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.fetchWithAuth(`/auth/profile/${userId}`)

      if (!response.ok) return null

      return await response.json()
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async uploadMeetingPdf(file: File): Promise<{
    success: boolean
    session_id?: string
    file_name?: string
    file_url?: string
    summary?: string
    message?: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await this.fetchWithAuthFormData('/sessions/upload-pdf', formData)
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail = data.detail as unknown
        let msg = 'Upload failed'
        if (typeof detail === 'string') msg = detail
        else if (Array.isArray(detail))
          msg = detail.map((d: { msg?: string }) => d.msg ?? '').filter(Boolean).join(', ')
        return { success: false, message: msg }
      }

      return {
        success: true,
        session_id: data.session_id,
        file_name: data.file_name,
        file_url: data.file_url,
        summary: data.summary,
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Upload failed'
      return { success: false, message: msg }
    }
  }

  async getSessionMessages(sessionId: string): Promise<{
    success: boolean
    session?: {
      id: string
      title: string
      file_name?: string
      file_url?: string
    }
    messages?: Array<{ id: string; role: string; content: string; created_at?: string }>
    message?: string
  }> {
    try {
      const response = await this.fetchWithAuth(
        `/sessions/${encodeURIComponent(sessionId)}/messages`
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail = data.detail as unknown
        let msg = 'Could not load conversation'
        if (typeof detail === 'string') msg = detail
        else if (Array.isArray(detail))
          msg = detail.map((d: { msg?: string }) => d.msg ?? '').filter(Boolean).join(', ')
        return { success: false, message: msg }
      }

      return {
        success: true,
        session: data.session,
        messages: data.messages,
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not load conversation'
      return { success: false, message: msg }
    }
  }

  async sendChatMessage(
    sessionId: string,
    message: string
  ): Promise<{
    success: boolean
    user_message?: { id: string; role: string; content: string; created_at?: string }
    assistant_message?: { id: string; role: string; content: string; created_at?: string }
    message?: string
  }> {
    try {
      const response = await this.fetchWithAuth(
        `/sessions/${encodeURIComponent(sessionId)}/chat`,
        {
          method: 'POST',
          body: JSON.stringify({ message }),
        }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail = data.detail as unknown
        let msg = 'Could not send message'
        if (typeof detail === 'string') msg = detail
        else if (Array.isArray(detail))
          msg = detail.map((d: { msg?: string }) => d.msg ?? '').filter(Boolean).join(', ')
        return { success: false, message: msg }
      }

      return {
        success: true,
        user_message: data.user_message,
        assistant_message: data.assistant_message,
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not send message'
      return { success: false, message: msg }
    }
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.fetchWithAuth(
        `/sessions/${encodeURIComponent(sessionId)}`,
        { method: 'DELETE' }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail = data.detail as unknown
        let msg = 'Could not delete conversation'
        if (typeof detail === 'string') msg = detail
        else if (Array.isArray(detail))
          msg = detail.map((d: { msg?: string }) => d.msg ?? '').filter(Boolean).join(', ')
        return { success: false, message: msg }
      }

      return { success: true }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not delete conversation'
      return { success: false, message: msg }
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'username'>>
  ): Promise<AuthResult> {
    try {
      const response = await this.fetchWithAuth(`/auth/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.detail || 'Failed to update profile' }
      }

      // Keep localStorage username in sync
      if (updates.username !== undefined) {
        localStorage.setItem('username', updates.username)
      }

      return data
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Update error'
      return { success: false, message: msg }
    }
  }

  // ------------------------------------------------------------------------ //
  // Session helpers
  // ------------------------------------------------------------------------ //

  getCurrentUser(): { user_id: string; email: string; username: string } | null {
    const user_id = localStorage.getItem('user_id')
    const email = localStorage.getItem('email')
    const username = localStorage.getItem('username') ?? ''

    if (user_id && email) return { user_id, email, username }
    return null
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  }

  /**
   * FIX: Checks both existence AND expiry — previously a stale expired token
   * would return true and leave the user stuck in a broken auth state.
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    if (!token) return false
    return !isTokenExpired(token)
  }

  // ------------------------------------------------------------------------ //
  // Private helpers
  // ------------------------------------------------------------------------ //

  private _saveSession(data: LoginResponse): void {
    localStorage.setItem('access_token', data.access_token!)
    localStorage.setItem('refresh_token', data.refresh_token!)
    localStorage.setItem('user_id', data.user_id!)
    localStorage.setItem('email', data.email!)
    localStorage.setItem('username', data.username ?? '')
  }

  private _clearSession(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('email')
    localStorage.removeItem('username')
  }
}

export const authService = new AuthService()