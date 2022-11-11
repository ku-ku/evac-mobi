<template>
  <v-row class="mt-5">
      <v-col cols="12" align="center">
            <v-btn large 
                   tile
                   color="primary"
                   :to="{name:'arrest-id', params:{id:null}}">
                ОФОРМИТЬ ЗАДЕРЖАНИЕ&nbsp;<v-icon>mdi-car-side</v-icon>
            </v-btn>
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn large 
                           tile
                           color="primary"
                           v-on="on"
                           v-on:click="$nuxt.refresh()">
                        <v-icon>mdi-reload</v-icon>
                    </v-btn>
                </template>
                <span>обновить список</span>
            </v-tooltip>
            <v-row>
                <v-col cols="12">
                  <eva-transport-list />
                </v-col>
            </v-row>
      </v-col>
  </v-row>
</template>

<script>
import EvaTransportList from "~/components/EvaTransportList";

export default {
    middleware: 'auth',
    name: 'IndexPage',
    components: {
        EvaTransportList
    }
}
</script>
