<template>
    <v-app>
        <Navbar />
        <v-main>
            <v-btn :icon="drawer ? 'mdi-menu-down' : 'mdi-menu-right'"  @click="drawer = !drawer"></v-btn>
            <v-navigation-drawer v-model="drawer" app :width="200" floating location="left">
                <v-list>
                    <v-list-item 
                    link 
                    variant="plain" 
                    @click="selectContent('Acknowledgements')" 
                    title="Acknowledgements">
                    </v-list-item>
                    <v-list-item 
                    link 
                    variant="plain" 
                    @click="selectContent('Details')" 
                    title="Contact Details">
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <div v-if="selectedContent === 'Acknowledgements'"  id="Acknowledgements">
                <h2 class="text-center">Acknowledgements</h2>

                <ul>
                    <li><strong>Core Development Team : Justin Bellavance, Hongyu Xiao, Le Chang, Mehrdad Kazemi, Seyla Wickramasinghe,(Alexandra J Mayhew? Parminder Raina? Peter VandeHaar?), Daniel Taliun, Sarah A Gagliano Taliun</strong></li>
                    <li>This work has been carried out under approved CLSA Methods Application 23ME002 and funded by the Canadian Institutes of Health Research (CIHR): 2 Canada Graduate Scholarships – Master's (MK & JB) & a Catalyst Grant: Analysis of CLSA Data (DT & SGT).</li>
                    <li>We thank Parminder Raina and the CLSA Executive Team for their support with this research. We also thank Alexandra Mayhew for discussion of the Dexa Scan variables as well as Isabel Fortier and Rita Wissa for assistance with trait categorization.</li> 
                    <li>We thank the individuals who provided feedback on the initial version of the CLSA PheWeb.</li>
                    <li>All computational analyses were performed using the compute resources of Digital Research Alliance of Canada, and SecureData4Health hosts this site.</li>
                    <li>We thank all CLSA participants who volunteered their time and information for research.</li>
                </ul>
            </div>
            <div v-if="selectedContent === 'Details'"  id="Details">
                <h2 class="text-center">Contact Details</h2>
                <ul>
                    <li>Contact the core development team: <a href="mailto:clsa-pheweb@mcgill.ca">clsa-pheweb@mcgill.ca</a></li>
                    <li>Daniel Taliun (daniel.taliun@mcgill.ca)</li>
                    <li>Sarah Gagliano Taliun (sarah.gagliano@icm-mhi.org)</li>
                </ul>
            </div>
        </v-main>
    </v-app>
</template>

<script setup name="Contact">  
import Navbar from '../../components/Navbar.vue';
import { ref } from 'vue';
const selectedContent = ref('Acknowledgements');

const drawer = ref(true);

function selectContent(content) {
    selectedContent.value = content; 
}
</script>

<style scoped>
</style>