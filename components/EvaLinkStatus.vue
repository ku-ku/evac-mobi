<template>
    <v-icon small
            :color="quality.color">
        {{ quality.icon }}
    </v-icon>    
</template>
<script>
export default {
    name: 'EvaLinkStatus',
    computed: {
        quality(){
            const quality = this.$store.state.settings.quality;
            switch (quality) {
                case 1:
                    return {color:'default', icon: 'mdi-network-strength-4'};
                case 2:
                    return {color:'default', icon: 'mdi-network-strength-3'};
                case 3:
                    return {color:'deep-orange accent-3', icon: 'mdi-network-strength-2-alert'};
                default:
                    return {color:'orange darken-4', icon: 'mdi-network-strength-off-outline'};
            }
        }
    }
}    
</script>    