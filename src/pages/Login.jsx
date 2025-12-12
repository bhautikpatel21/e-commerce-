import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import '../App.css'
import { 
  register, 
  login, 
  sendForgetPasswordOtp, 
  verifyForgetPasswordOtp, 
  updatePassword 
} from '../Api'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot-email', 'forgot-otp', 'forgot-password'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null) // { message, type: 'success' | 'error' }
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  
  // Register state
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [forgetPasswordToken, setForgetPasswordToken] = useState('') // Token from send OTP response

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await login(loginEmail, loginPassword)
      if (response.isSuccess) {
        // Store token and userId in localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.userId)
        setToast({ message: 'Login successful!', type: 'success' })
        setTimeout(() => navigate('/'), 1500)
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (registerPassword !== registerConfirmPassword) {
      const errorMessage = 'Passwords do not match'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
      setLoading(false)
      return
    }
    
    try {
      const response = await register(registerName, registerEmail, registerPassword, registerConfirmPassword)
      if (response.isSuccess) {
        // Store token and userId in localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.userId)
        setToast({ message: response.message || 'Registration successful! OTP sent to your email.', type: 'success' })
        setMode('login')
        // Reset form
        setRegisterName('')
        setRegisterEmail('')
        setRegisterPassword('')
        setRegisterConfirmPassword('')
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await sendForgetPasswordOtp(forgotEmail)
      if (response.isSuccess) {
        // Store the token from response for verify OTP and update password
        setForgetPasswordToken(response.data.token)
        setToast({ message: response.message || 'OTP sent to your email.', type: 'success' })
        setMode('forgot-otp')
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send OTP. Please try again.'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const otpValue = otp.join('')
    if (otpValue.length !== 4) {
      const errorMessage = 'Please enter 4-digit OTP'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
      setLoading(false)
      return
    }
    
    try {
      const response = await verifyForgetPasswordOtp(otpValue, forgetPasswordToken)
      if (response.isSuccess) {
        setToast({ message: response.message || 'OTP verified successfully!', type: 'success' })
        setMode('forgot-password')
      }
    } catch (err) {
      const errorMessage = err.message || 'OTP verification failed. Please try again.'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (newPassword !== confirmNewPassword) {
      const errorMessage = 'Passwords do not match'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
      setLoading(false)
      return
    }
    
    try {
      const response = await updatePassword(newPassword, confirmNewPassword, forgetPasswordToken)
      if (response.isSuccess) {
        setToast({ message: response.message || 'Password updated successfully!', type: 'success' })
        setMode('login')
        // Reset all forgot password state
        setForgotEmail('')
        setOtp(['', '', '', ''])
        setNewPassword('')
        setConfirmNewPassword('')
        setForgetPasswordToken('')
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update password. Please try again.'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <marquee
        className="announcement-bar fade-down"
        direction="right"
        behavior="scroll"
        scrollamount="20"
      >
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>

      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        padding: '2rem 1rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          background: '#fff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Login Form */}
          {mode === 'login' && (
            <>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Login
              </h1>
              <p style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                marginBottom: '2rem' 
              }}>
                Welcome back! Please login to your account.
              </p>
              
              {error && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#111322'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="Enter your email"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111322'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#6b7280'
                      }}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMode('forgot-email')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#111322',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textDecoration: 'underline',
                    marginBottom: '1.5rem',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#111322',
                        cursor: 'pointer',
                        fontWeight: '600',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Register
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Register
              </h1>
              <p style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                marginBottom: '2rem' 
              }}>
                Create a new account to get started.
              </p>
              
              {error && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#111322'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="Enter your name"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#111322'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="Enter your email"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111322'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#6b7280'
                      }}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegisterConfirmPassword ? 'text' : 'password'}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111322'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#6b7280'
                      }}
                      aria-label={showRegisterConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#111322',
                        cursor: 'pointer',
                        fontWeight: '600',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* Forgot Password - Email Step */}
          {mode === 'forgot-email' && (
            <>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Forgot Password
              </h1>
              <p style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                marginBottom: '2rem' 
              }}>
                Enter your email to receive a verification code.
              </p>
              
              {error && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleForgotEmailSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '1.2rem'
                    }}>
                      ✉️
                    </span>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 3rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111322'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#111322',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Forgot Password - OTP Verification Step */}
          {mode === 'forgot-otp' && (
            <>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Verify OTP
              </h1>
              <p style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                marginBottom: '2rem' 
              }}>
                Enter the 4-digit code sent to {forgotEmail}
              </p>
              
              {error && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleOtpVerify}>
                <div style={{ 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'center'
                }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      required
                      style={{
                        width: '60px',
                        height: '60px',
                        textAlign: 'center',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111322'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-email')
                      setOtp(['', '', '', ''])
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#111322',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Forgot Password - Update Password Step */}
          {mode === 'forgot-password' && (
            <>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Update Password
              </h1>
              <p style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                marginBottom: '2rem' 
              }}>
                Enter your new password.
              </p>
              
              {error && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handlePasswordUpdate}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111322'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#6b7280'
                      }}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#111322'
                  }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111322'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#6b7280'
                      }}
                      aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmNewPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#111322',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className="site-footer fade-up mb-4">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  )
}

export default Login

