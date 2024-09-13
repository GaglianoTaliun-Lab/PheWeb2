import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/home/home.vue'; 
import About from '../pages/about/about.vue';
import Phenotypes from '../pages/phenotypes/phenotypes.vue';
import Random from '../pages/random/random.vue';
import Tophits from '../pages/tophits/tophits.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'CLSA-PheWeb: Home',
      // icon: '/path/to/home-icon.svg'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'CLSA-PheWeb: About',
      // icon: '/path/to/home-icon.svg'
    }
  },
  {
    path: '/phenotypes',
    name: 'Phenotypes',
    component: Phenotypes,
    meta: {
      title: 'CLSA-PheWeb: Phenotypes',
      // icon: '/path/to/home-icon.svg'
    }
  },
  {
    path: '/random',
    name: 'Random',
    component: Random,
    meta: {
      title: 'CLSA-PheWeb: Random',
      // icon: '/path/to/home-icon.svg'
    }
  },
  {
    path: '/tophits',
    name: 'Tophits',
    component: Tophits,
    meta: {
      title: 'CLSA-PheWeb: Tophits',
      // icon: '/path/to/home-icon.svg'
    }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),  
  routes
});

export default router;
