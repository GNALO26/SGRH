import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import Login from '@/views/Login.vue'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import LandingPage from '@/views/LandingPage.vue' // Nouvelle landing page

const routes = [
  // Landing page (publique)
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: { guest: true } // accessible sans authentification
  },
  // Routes d'authentification (guest)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { guest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { guest: true }
  },
  // Routes employé (authentifiées)
  {
    path: '/employee/explain-absence',
    name: 'ExplainAbsence',
    component: () => import('@/views/employee/ExplainAbsence.vue'),
    meta: { requiresAuth: true, role: 'employee' }
  },
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, role: 'employee' },
    children: [
      { path: '', name: 'EmployeeDashboard', component: () => import('@/views/employee/Dashboard.vue') },
      { path: 'pointage', name: 'Pointage', component: () => import('@/views/employee/Pointage.vue') },
      { path: 'presences', name: 'Presences', component: () => import('@/views/employee/Presences.vue') },
      { path: 'demandes', name: 'Demandes', component: () => import('@/views/employee/Demandes.vue') },
      { path: 'documents', name: 'Documents', component: () => import('@/views/employee/Documents.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('@/views/employee/Notifications.vue') },
      { path: 'assistance', name: 'Assistance', component: () => import('@/views/employee/Assistance.vue') },
      { path: 'faq', name: 'FAQ', component: () => import('@/views/employee/FAQ.vue') },
      { path: 'profil', name: 'Profil', component: () => import('@/views/employee/Profil.vue') },
      { path: 'parametres', name: 'Parametres', component: () => import('@/views/employee/Parametres.vue') },
      { path: 'unjustified-absences', name: 'UnjustifiedAbsences', component: () => import('@/views/employee/UnjustifiedAbsences.vue') }
    ]
  },
  // Routes administrateur (authentifiées)
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'employes', name: 'Employees', component: () => import('@/views/admin/Employees.vue') },
      { path: 'pointages', name: 'AdminAttendances', component: () => import('@/views/admin/Attendances.vue') },
      { path: 'conges', name: 'AdminLeaves', component: () => import('@/views/admin/Leaves.vue') },
      { path: 'autorisations', name: 'AdminRetardAuths', component: () => import('@/views/admin/RetardAuthorizations.vue') },
      { path: 'documents', name: 'AdminDocuments', component: () => import('@/views/admin/Documents.vue') },
      { path: 'unjustified-absences', name: 'AdminUnjustifiedAbsences', component: () => import('@/views/admin/UnjustifiedAbsences.vue') },
      { path: 'holidays', name: 'AdminHolidays', component: () => import('@/views/admin/HolidaysManagement.vue') },
      { path: 'assistance', name: 'AdminAssistance', component: () => import('@/views/admin/AssistanceRequests.vue') },
      { path: 'statistiques', name: 'Statistics', component: () => import('@/views/admin/Statistics.vue') },
      { path: 'parametres', name: 'Settings', component: () => import('@/views/admin/Settings.vue') },
      { path: 'utilisateurs', name: 'Users', component: () => import('@/views/admin/Users.vue') },
      { path: 'logs', name: 'Logs', component: () => import('@/views/admin/Logs.vue') },
      { path: 'notifications', name: 'AdminNotifications', component: () => import('@/views/admin/Notifications.vue') },
      { path: 'profil', name: 'AdminProfile', component: () => import('@/views/admin/Profile.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Si la route nécessite une authentification
  if (to.matched.some(r => r.meta.requiresAuth)) {
    if (!auth.token) {
      return '/login'
    }
    if (!auth.user) {
      const isValid = await auth.checkAuth()
      if (!isValid) {
        return '/login'
      }
    }
    if (to.meta.role && auth.user?.role !== to.meta.role) {
      return auth.user?.role === 'admin' ? '/admin' : '/employee'
    }
    if (auth.user?.role === 'employee' && auth.requiresExplanation && to.name !== 'ExplainAbsence') {
      return '/employee/explain-absence'
    }
    return true
  }

  // Si la route est "guest" et qu'on est authentifié, on redirige vers le dashboard approprié
  if (to.matched.some(r => r.meta.guest) && auth.isAuthenticated) {
    return auth.user?.role === 'admin' ? '/admin' : '/employee'
  }

  return true
})

export default router