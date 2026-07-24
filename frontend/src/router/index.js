import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import Login from '@/views/Login.vue'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },

  {
    path: '/employee/explain-absence',
    name: 'ExplainAbsence',
    component: () => import('@/views/employee/ExplainAbsence.vue'),
    meta: { requiresAuth: true, role: 'employee' },
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
      { path: 'unjustified-absences', name: 'UnjustifiedAbsences', component: () => import('@/views/employee/UnjustifiedAbsences.vue') },
    ],
  },
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
      { path: 'profil', name: 'AdminProfile', component: () => import('@/views/admin/Profile.vue') },
      { path: 'notifications', name: 'AdminNotifications', component: () => import('@/views/admin/NotificationsAdmin.vue') }, 
    ],
  },
  { path: '/', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()

  // Routes nécessitant une authentification
  if (to.matched.some(r => r.meta.requiresAuth)) {
    if (!auth.token) {
      return '/login'
    }

    // Charger l'utilisateur s'il n'est pas déjà dans le store
    if (!auth.user) {
      try {
        await auth.fetchUser()
      } catch (e) {
        auth.logout()
        return '/login'
      }
    }

    // Vérification du rôle
    if (to.meta.role && auth.user?.role !== to.meta.role) {
      return auth.user?.role === 'admin' ? '/admin' : '/employee'
    }

    // Redirection absences non justifiées (employé uniquement)
    if (
      auth.user?.role === 'employee' &&
      auth.requiresExplanation &&
      to.name !== 'ExplainAbsence' &&
      to.name !== 'Login'
    ) {
      return '/employee/explain-absence'
    }

    return true
  }

  // Routes invité (login) : si déjà connecté, rediriger vers le dashboard
  if (to.matched.some(r => r.meta.guest) && auth.token) {
    if (auth.user?.role === 'admin') return '/admin'
    if (auth.user?.role === 'employee') return '/employee'
    return true
  }

  return true
})

export default router