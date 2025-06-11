import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory('/trimcivpred/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/indexView.vue'),
      children: [],
    },
    {
      path: '/trim-review',
      name: 'TRIMReview',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/TRIMReview.vue'),
    },
    {
      path: '/trim-cancer',
      name: 'TRIMCancer',
      component: () => import('@/views/TRIMCancer.vue'),
    },
    {
      path: '/trim-ref',
      name: 'TRIMRef',
      component: () => import('@/views/TRIMRef.vue'),
    },
    {
      path: '/result',
      name: 'Result',
      component: () => import('@/views/ResultPage.vue'),
    },
    {
      path: '/resultbyTRIM',
      name: 'ResultbyTRIM',
      component: () => import('@/views/ResultbyTRIMPage.vue'),
    },
    {
      path: '/resource',
      name: 'Source',
      component: () => import('@/views/SourcePage.vue'),
    },
    {
      path: '/help',
      name: 'Help',
      component: () => import('@/views/HelpPage.vue'),
    },
    {
      path: '/privacy',
      name: 'Privacy',
      component: () => import('@/views/PrivacyPage.vue'),
    },
    {
      path: '/contact',
      name: 'Contact',
      component: () => import('@/views/ContactPage.vue'),
    },
    {
      path: '/submit',
      name: 'Submit',
      component: () => import('@/views/SubmitPage.vue'),
    },
    {
      path: '/luad',
      name: 'luad',
      component: () => import('@/views/Dashboard_luad.vue'),
    },
    {
      path: '/luad_result',
      name: 'luad_result',
      component: () => import('@/views/LUADRes.vue'),
    },
    {
      path: '/luad_resultbyTRIM',
      name: 'luad_resultbyTRIM',
      component: () => import('@/views/LUADResbyTRIM.vue'),
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
  ],
})

export default router
