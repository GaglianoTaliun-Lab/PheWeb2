import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/home/Home.vue'; 
import About from '../pages/about/About.vue';
import Phenotypes from '../pages/phenotypes/Phenotypes.vue';
import Tophits from '../pages/tophits/TopHits.vue';
import Variant from '../pages/variant/Variant.vue';
import Pheno from '../pages/pheno/Pheno.vue';
import Gene from '../pages/gene/Gene.vue';
import Region from '../pages/region/Region.vue';
import Contact from '../pages/contactUs/Contact.vue';
import API from '../pages/api/API.vue';
import Github from '../pages/github/Github.vue';

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
    path: '/tophits',
    name: 'Tophits',
    component: Tophits,
    meta: {
      title: 'CLSA-PheWeb: Tophits',
    }
  },
  {
    path: '/variant/:variant_id',
    name: 'Variant',
    component: Variant,
    meta: {
      title: 'CLSA-PheWeb: Variant'
    }
  },
  {
    path: '/phenotypes/:phenocode',
    name: 'Pheno',
    component: Pheno,
    meta: {
      title: 'CLSA-PheWeb: Pheno'
    }
  },
  {
    path: '/phenotypes/:phenocode/region/:region',
    name: 'Region',
    component: Region,
    meta: {
      title: 'CLSA-PheWeb: Region'
    }
  },
  {
    path: '/gene/:gene/:phenocode?',
    name: 'Gene',
    component: Gene,
    meta: {
      title: 'CLSA-PheWeb: Gene'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: {
      title: 'CLSA-PheWeb: Contact Us'
    }
  },
  {
    path: '/ui/api',
    name: 'API',
    component: API,
    meta: {
      title: 'CLSA-PheWeb: API'
    }
  },
  {
    path: '/github',
    name: 'Github',
    component: Github,
    meta: {
      title: 'CLSA-PheWeb: Github'
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),  
  routes
});

export default router;
