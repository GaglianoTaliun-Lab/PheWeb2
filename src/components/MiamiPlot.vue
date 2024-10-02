<script setup>
import { onMounted, ref } from 'vue';
import * as d3 from 'd3'
import _ from 'underscore'

const props = defineProps({
    data: [
        {
            String : {

            }
        },
        {
            String : {

            }
        }
    ]
});

</script>


<template>
    <div>
        {{ data }}
    </div>
    <p> GWAS table results here </p>
</template>