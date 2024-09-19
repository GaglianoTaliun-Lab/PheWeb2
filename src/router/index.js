import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/home/Home.vue'; 
import About from '../pages/about/About.vue';
import Phenotypes from '../pages/phenotypes/Phenotypes.vue';
import Random from '../pages/random/Random.vue';
import Tophits from '../pages/tophits/TopHits.vue';
import Variant from '../pages/variant/Variant.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'CLSA-PheWeb: Home',
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'CLSA-PheWeb: About',
    }
  },
  {
    path: '/phenotypes',
    name: 'Phenotypes',
    component: Phenotypes,
    meta: {
      title: 'CLSA-PheWeb: Phenotypes',
    }
  },
  {
    path: '/random',
    name: 'Random',
    component: Random,
    meta: {
      title: 'CLSA-PheWeb: Random',
    }
  },
  {
    path: '/tophits',
    name: 'Tophits',
    component: Tophits,
    meta: {
      title: 'CLSA-PheWeb: Tophits',
    }
  },
  {
    path: '/variant',
    name: 'Variant',
    component: Variant,
    meta: {
      title: 'CLSA-PheWeb: Variant'
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),  
  routes
});

export default router;
