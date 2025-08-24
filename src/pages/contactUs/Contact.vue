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
                    @click="selectContent('Team')" 
                    title="Development Team">
                    </v-list-item>

                    <v-list-item 
                    link 
                    variant="plain" 
                    @click="selectContent('Acknowledgements')" 
                    title="Acknowledgements">
                    </v-list-item>
                  </v-list>
            </v-navigation-drawer>
            <div v-if="selectedContent === 'Team'"  id="Team">
                <h2 class="text-center">Development Team</h2>
		<p>Current members:</p>
		<ul>
			<li>Justin Bellavance</li>
			<li>Hongyu Xiao</li>
			<li>Le Chang</li>
			<li>Mehrdad Kazemi</li>
			<li>Seyla Wickramasinghe</li>
			<li>Daniel Taliun* (daniel.taliun@mcgill.ca)</li>
			<li>Sarah A Gagliano Taliun* (sarah.gagliano-taliun@umontreal.ca)</li>
		</ul>
		<p>* Use these addresses for all inquiries.</p>

            </div>

	    <div v-if="selectedContent === 'Acknowledgements'"  id="Acknowledgements">
                <h2 class="text-center">Acknowledgements</h2>

                <ul>
                    <li>This work has been carried out under approved CLSA Methods Application 23ME002 and funded by the Canadian Institutes of Health Research (CIHR):
			    <ul>
				    <li>2 Canada Graduate Scholarships – Master's (JB & MK)</li>
				    <li>2 Catalyst Grants: Analysis of CLSA Data AD6-192920 & AD7-200181 (DT & SGT)</li>
				    <li>1 Project Grant PJT-197954 (DT & SGT).</li>
			    </ul>
		    </li>
		    <li>All computational analyses were performed using the compute resources of <a href="https://alliancecan.ca/en" target="_blank">Digital Research Alliance of Canada</a>.</li>
		    <li>The CLSA PheWeb is hosted on <a href="https://www.sd4health.ca/" target="_blank">SecureData4Health</a>.</li>
                    <li>We thank all CLSA participants who volunteered their time and information for research.</li>
                </ul>
            </div>
         </v-main>
    </v-app>
</template>

<script setup name="Contact">  
import Navbar from '../../components/Navbar.vue';
import { ref } from 'vue';
const selectedContent = ref('Team');

const drawer = ref(true);

function selectContent(content) {
    selectedContent.value = content; 
}
</script>

<style scoped>
</style>
