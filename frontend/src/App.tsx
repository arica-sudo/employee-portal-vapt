import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  Users, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Upload, 
  Download, 
  Trash2, 
  Search,
  Menu,
  User,
  Shield,
  HelpCircle,
  ChevronDown,
  Plus,
  Eye,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Mail,
  Lock,
  Calendar,
  TrendingUp,
  MessageSquare,
  FolderOpen,
  Activity,
  Globe,
  Palette,
  BellRing
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface AuthContextType {
  token: string | null
  user: any | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    if (token) {
      fetchUser()
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password })
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('token', data.access_token)
        setToken(data.access_token)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = () => {
    if (token) fetchUser()
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  return <>{children}</>
}

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      <Link to="/dashboard" className="hover:text-gray-700">Home</Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          {item.href ? (
            <Link to={item.href} className="hover:text-gray-700">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  )
}

function EmptyState({ icon: Icon, title, description, action }: { 
  icon: any; 
  title: string; 
  description: string; 
  action?: { label: string; onClick: () => void } 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any }> = {
    open: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
    in_progress: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    closed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
    resolved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  }
  const { color, icon: Icon } = config[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ')}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[priority] || colors.low}`}>
      {priority}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    employee: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[role] || colors.employee}`}>
      {role}
    </span>
  )
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const success = await login(email, password)
    setIsLoading(false)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Acme Corp</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Welcome to the<br />Employee Portal
          </h1>
          <p className="text-indigo-200 text-lg max-w-md">
            Access company resources, manage your profile, submit support requests, and stay updated with the latest announcements.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-indigo-200 text-sm">Employees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-indigo-200 text-sm">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-indigo-200 text-sm">Support</div>
            </div>
          </div>
        </div>
        <div className="text-indigo-300 text-sm">
          &copy; 2024 Acme Corporation. Internal Use Only.
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Acme Corp Portal</h1>
          </div>
          
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@acmecorp.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to Acme Corp?</span>
                </div>
              </div>
              <Link to="/register" className="w-full">
                <Button variant="outline" className="w-full">Create an account</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const departments = [
    'Engineering',
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Legal',
    'Customer Support',
    'Product',
    'Design'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          department: formData.department
        })
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2000)
      } else {
        const data = await res.json()
        setError(data.detail || 'Registration failed')
      }
    } catch {
      setError('Network error')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to login
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join the Acme Corp Employee Portal</p>
        </div>
        
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-6">
            {success ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Registration successful!</h3>
                <p className="text-gray-500 text-sm">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="you@acmecorp.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                      >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await fetch(`${API_URL}/api/auth/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to login
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-1">We'll send you a link to reset it</p>
        </div>
        
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-6">
            {submitted ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Check your email</h3>
                <p className="text-gray-500 text-sm text-center">
                  If an account exists with this email, you will receive a password reset link.
                </p>
                <Link to="/login" className="mt-4">
                  <Button variant="outline">Return to login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@acmecorp.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navGroups = [
    {
      label: 'Workspace',
      items: [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Bell, label: 'Announcements', path: '/announcements' },
        { icon: FileText, label: 'Files', path: '/files' },
        { icon: HelpCircle, label: 'Support', path: '/support' },
      ]
    },
    {
      label: 'Account',
      items: [
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    }
  ]

  if (user?.role === 'admin' || user?.role === 'manager') {
    navGroups.push({
      label: 'Administration',
      items: [
        { icon: Users, label: 'User Management', path: '/admin/users' },
        ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Audit Logs', path: '/admin/audit' }] : [])
      ]
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900">Acme Corp</span>
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Internal</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className={sidebarOpen ? '' : 'hidden'}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {sidebarOpen && (
                <div className="px-4 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.label}</span>
                </div>
              )}
              <div className="space-y-1 px-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
                      {sidebarOpen && <span>{item.label}</span>}
                      {isActive && sidebarOpen && (
                        <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.department}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mx-auto">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </aside>
      
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search files, announcements..." 
                className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.full_name}</span>
                    <span className="text-xs font-normal text-gray-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>&copy; 2024 Acme Corporation. Internal Use Only.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-700">Help Center</a>
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchStats(), fetchAnnouncements(), fetchTickets()]).finally(() => setLoading(false))
  }, [])

  const fetchStats = async () => {
    const res = await fetch(`${API_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setStats(await res.json())
  }

  const fetchAnnouncements = async () => {
    const res = await fetch(`${API_URL}/api/announcements`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setAnnouncements(await res.json())
  }

  const fetchTickets = async () => {
    const res = await fetch(`${API_URL}/api/support/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setTickets(await res.json())
  }

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.full_name?.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">Here's what's happening in your workspace today</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Announcements</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_announcements || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">2 new</span>
              <span className="text-gray-500 ml-1">this week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Files</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_files || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Shared across departments</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.my_tickets || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600 font-medium">{stats?.open_tickets || 0} open</span>
              <span className="text-gray-500 ml-1">tickets</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Activity</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_tickets || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Total support tickets</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {(user?.role === 'admin' || user?.role === 'manager') && stats && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Admin Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                <p className="text-sm text-gray-500 mt-1">Total Users</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{stats.active_users}</p>
                <p className="text-sm text-gray-500 mt-1">Active Users</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{stats.total_tickets}</p>
                <p className="text-sm text-gray-500 mt-1">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Announcements</CardTitle>
            <Link to="/announcements">
              <Button variant="ghost" size="sm" className="text-indigo-600">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'medium' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">{ann.title}</h4>
                        <PriorityBadge priority={ann.priority} />
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-1">By {ann.author} &middot; {new Date(ann.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">My Recent Tickets</CardTitle>
            <Link to="/support">
              <Button variant="ghost" size="sm" className="text-indigo-600">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No support tickets yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.slice(0, 3).map((ticket) => (
                  <div key={ticket.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">#{ticket.id}</span>
                        <h4 className="font-medium text-gray-900 truncate">{ticket.subject}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AnnouncementsPage() {
  const { token, user } = useAuth()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newAnn, setNewAnn] = useState({ title: '', content: '', priority: 'medium' })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    const res = await fetch(`${API_URL}/api/announcements`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setAnnouncements(await res.json())
    setLoading(false)
  }

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`${API_URL}/api/announcements`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newAnn)
    })
    if (res.ok) {
      setShowForm(false)
      setNewAnn({ title: '', content: '', priority: 'medium' })
      fetchAnnouncements()
    }
  }

  const deleteAnnouncement = async (id: number) => {
    await fetch(`${API_URL}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchAnnouncements()
  }

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.priority === filter)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Announcements' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Stay updated with company news and updates</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> New Announcement
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
            <CardDescription>Share important updates with the team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAnnouncement} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Content</label>
                <Textarea
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                  placeholder="Write your announcement here..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newAnn.priority}
                  onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value })}
                >
                  <option value="low">Low - General information</option>
                  <option value="medium">Medium - Important update</option>
                  <option value="high">High - Urgent notice</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Publish Announcement</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter:</span>
        {['all', 'high', 'medium', 'low'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-indigo-600' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {filteredAnnouncements.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <EmptyState
            icon={Bell}
            title="No announcements"
            description={filter === 'all' ? "There are no announcements yet. Check back later for updates." : `No ${filter} priority announcements found.`}
            action={(user?.role === 'admin' || user?.role === 'manager') ? {
              label: 'Create Announcement',
              onClick: () => setShowForm(true)
            } : undefined}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => (
            <Card key={ann.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-12 rounded-full ${ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'medium' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{ann.title}</CardTitle>
                        <PriorityBadge priority={ann.priority} />
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="w-3 h-3" />
                        {ann.author}
                        <span>&middot;</span>
                        <Calendar className="w-3 h-3" />
                        {new Date(ann.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(ann.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pl-10">
                <p className="text-gray-600 whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function FilesPage() {
  const { token } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    const res = await fetch(`${API_URL}/api/files`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setFiles(await res.json())
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', '')

    await fetch(`${API_URL}/api/files/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    setUploading(false)
    fetchFiles()
    e.target.value = ''
  }

  const downloadFile = async (fileId: string, filename: string) => {
    const res = await fetch(`${API_URL}/api/files/download/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    }
  }

  const deleteFile = async (fileId: string) => {
    await fetch(`${API_URL}/api/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchFiles()
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return '🖼️'
    if (['pdf'].includes(ext || '')) return '📄'
    if (['doc', 'docx'].includes(ext || '')) return '📝'
    if (['xls', 'xlsx'].includes(ext || '')) return '📊'
    if (['zip', 'rar', '7z'].includes(ext || '')) return '📦'
    return '📁'
  }

  const filteredFiles = files.filter(f => 
    f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Files' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-500 mt-1">Upload and manage shared documents</p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
          />
          <Button asChild disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700">
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search files by name or uploader..."
          className="pl-10 max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredFiles.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <EmptyState
            icon={FolderOpen}
            title={searchTerm ? "No files found" : "No files uploaded"}
            description={searchTerm ? "Try adjusting your search terms" : "Upload your first file to get started. Files are shared across the organization."}
            action={!searchTerm ? {
              label: 'Upload File',
              onClick: () => document.getElementById('file-upload')?.click()
            } : undefined}
          />
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded By</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(file.filename)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{file.filename}</p>
                          <p className="text-xs text-gray-500">{file.content_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {file.size < 1024 
                        ? `${file.size} B`
                        : file.size < 1024 * 1024 
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
                          {file.uploaded_by.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600">{file.uploaded_by}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(file.uploaded_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => downloadFile(file.id, file.filename)} className="text-gray-500 hover:text-indigo-600">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id)} className="text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500">Showing {filteredFiles.length} of {files.length} files</p>
          </div>
        </Card>
      )}
    </div>
  )
}

function SupportPage() {
  const { token, user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' })
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    const res = await fetch(`${API_URL}/api/support/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setTickets(await res.json())
    setLoading(false)
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`${API_URL}/api/support/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTicket)
    })
    if (res.ok) {
      setShowForm(false)
      setNewTicket({ subject: '', description: '', priority: 'medium' })
      fetchTickets()
    }
  }

  const updateTicketStatus = async (ticketId: number, status: string) => {
    await fetch(`${API_URL}/api/support/tickets/${ticketId}?status=${status}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchTickets()
    setSelectedTicket(null)
  }

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Support' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Get help from the IT support team</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Ticket
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Before you open a ticket</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check our <a href="#" className="text-indigo-600 hover:underline">FAQ section</a> for quick answers to common questions. 
                For urgent issues, contact IT directly at <span className="font-medium">support@acmecorp.com</span> or extension <span className="font-medium">1234</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>Describe your issue and we'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Please provide as much detail as possible..."
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  <option value="low">Low - General question or minor issue</option>
                  <option value="medium">Medium - Affecting my work</option>
                  <option value="high">High - Urgent, blocking my work</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Submit Ticket</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Status:</span>
        {['all', 'open', 'in_progress', 'closed'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-indigo-600' : ''}
          >
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {filteredTickets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <EmptyState
            icon={MessageSquare}
            title="No tickets found"
            description={filter === 'all' ? "You haven't created any support tickets yet." : `No ${filter.replace('_', ' ')} tickets found.`}
            action={filter === 'all' ? {
              label: 'Create Ticket',
              onClick: () => setShowForm(true)
            } : undefined}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" 
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ticket.status === 'open' ? 'bg-blue-100' : 
                      ticket.status === 'in_progress' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {ticket.status === 'open' ? <AlertCircle className="w-5 h-5 text-blue-600" /> :
                       ticket.status === 'in_progress' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                       <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 font-mono">#{ticket.id}</span>
                        <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <span className="text-xs text-gray-400">
                          Created {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTicket(null)}>
          <Card className="w-full max-w-2xl border-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-mono">#{selectedTicket.id}</span>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    Created by {selectedTicket.created_by} on {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedTicket.status} />
                <PriorityBadge priority={selectedTicket.priority} />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
              {(user?.role === 'admin' || user?.role === 'manager') && selectedTicket.status !== 'closed' && (
                <div className="flex gap-2 pt-4 border-t">
                  <span className="text-sm text-gray-500 mr-2">Update status:</span>
                  {selectedTicket.status !== 'in_progress' && (
                    <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}>
                      <Clock className="w-4 h-4 mr-1" /> Mark In Progress
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, 'closed')} className="text-green-600 border-green-200 hover:bg-green-50">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Close Ticket
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ProfilePage() {
  const { token, user, refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    department: user?.department || '',
    phone: user?.phone || '',
    location: user?.location || ''
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        department: user.department || '',
        phone: user.phone || '',
        location: user.location || ''
      })
    }
  }, [user])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    const res = await fetch(`${API_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    setIsUpdating(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Profile updated successfully' })
      refreshUser()
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setIsUpdating(true)
    const res = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
    })
    setIsUpdating(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Password changed successfully' })
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } else {
      setMessage({ type: 'error', text: 'Failed to change password. Check your current password.' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[{ label: 'Profile' }]} />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information and preferences</p>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.full_name}</h3>
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-3">
                <RoleBadge role={user?.role} />
              </div>
              <div className="w-full mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user?.department || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user?.employee_id}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Joined {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Password</label>
                  <Input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <Input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="outline" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AdminUsersPage() {
  const { token, user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  const updateUserRole = async (userId: number, role: string) => {
    await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role })
    })
    fetchUsers()
    setSelectedUser(null)
  }

  const deactivateUser = async (userId: number) => {
    await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchUsers()
  }

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Administration', href: '/admin/users' }, { label: 'User Management' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage employee accounts and permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{users.length}</span> total users
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, email, or department..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {u.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.full_name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.department}</td>
                  <td className="px-6 py-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)} className="text-gray-500 hover:text-indigo-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {user?.role === 'admin' && u.is_active && u.id !== user?.id && (
                        <Button variant="ghost" size="sm" onClick={() => deactivateUser(u.id)} className="text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-500">Showing {filteredUsers.length} of {users.length} users</p>
        </div>
      </Card>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <Card className="w-full max-w-lg border-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>User Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedUser.full_name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Employee ID</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedUser.employee_id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Department</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedUser.department}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
                  <div className="mt-1"><RoleBadge role={selectedUser.role} /></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="font-medium mt-1">
                    <span className={`inline-flex items-center gap-1 ${selectedUser.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${selectedUser.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              
              {user?.role === 'admin' && selectedUser.id !== user?.id && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">Change Role</p>
                  <div className="flex gap-2">
                    {['employee', 'manager', 'admin'].map((role) => (
                      <Button
                        key={role}
                        size="sm"
                        variant={selectedUser.role === role ? 'default' : 'outline'}
                        onClick={() => updateUserRole(selectedUser.id, role)}
                        className={selectedUser.role === role ? 'bg-indigo-600' : ''}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function AuditLogsPage() {
  const { token } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const res = await fetch(`${API_URL}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setLogs(await res.json())
    setLoading(false)
  }

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.user.toLowerCase().includes(filter.toLowerCase()) ||
    log.details.toLowerCase().includes(filter.toLowerCase())
  )

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (action.includes('create') || action.includes('upload')) return 'bg-green-100 text-green-700 border-green-200'
    if (action.includes('delete') || action.includes('deactivate')) return 'bg-red-100 text-red-700 border-red-200'
    if (action.includes('update') || action.includes('change')) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Administration', href: '/admin/users' }, { label: 'Audit Logs' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activities and user actions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export Logs
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Filter by action, user, or details..."
          className="pl-10"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {filteredLogs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <EmptyState
            icon={Activity}
            title="No audit logs"
            description={filter ? "No logs match your filter criteria." : "System activity will appear here."}
          />
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                        <p className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {log.user.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-900">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500">Showing {filteredLogs.length} of {logs.length} entries</p>
          </div>
        </Card>
      )}
    </div>
  )
}

function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    weeklyDigest: true,
    timezone: 'America/New_York',
    language: 'en',
    theme: 'light'
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[{ label: 'Settings' }]} />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your application preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-indigo-600" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Desktop Notifications</p>
                <p className="text-sm text-gray-500">Show desktop push notifications</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, desktopNotifications: !settings.desktopNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.desktopNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.desktopNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Weekly Digest</p>
                <p className="text-sm text-gray-500">Receive a weekly summary of activities</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, weeklyDigest: !settings.weeklyDigest })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.weeklyDigest ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Regional Settings
            </CardTitle>
            <CardDescription>Set your timezone and language preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Timezone</label>
                <select
                  className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Language</label>
                <select
                  className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the portal looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Theme</label>
              <div className="flex gap-3">
                {[
                  { value: 'light', label: 'Light', icon: '☀️' },
                  { value: 'dark', label: 'Dark', icon: '🌙' },
                  { value: 'system', label: 'System', icon: '💻' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSettings({ ...settings, theme: theme.value })}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      settings.theme === theme.value 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{theme.icon}</span>
                    <span className="font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-indigo-600 hover:bg-indigo-700">Save Settings</Button>
        </div>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard">
          <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute>
              <Layout><AnnouncementsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/files" element={
            <ProtectedRoute>
              <Layout><FilesPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute>
              <Layout><SupportPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><SettingsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <Layout><AdminUsersPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/audit" element={
            <ProtectedRoute>
              <Layout><AuditLogsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
