<template>
  <v-card>
    <v-card-title>Export game results</v-card-title>
    <textarea v-model="results" rows="20" cols="70" style="margin: 20px 20px; border: 1px"></textarea>
    <v-btn @click="getResults" :disabled="isProcessing">Get results</v-btn>
  </v-card>
</template>

<script>
import { gameStatisticsService } from "@/services";

export default {
  name: "Export",
  data() {
    return {
      results: ""
    };
  },
  methods: {
    async getResults() {
      const response = await gameStatisticsService.getResultsTable();
      if (response.success === true) {
        let text = '';
        for(let i in response.data) {
            let item = response.data[i];
            if (item.sum != 'null' && item.sum != null) {
                let sum = Math.round(item.sum * 100) / 100
                text += item.student + "," + sum + "\n";
            }
        }

        this.results = text;
      }
    }
  }
};
</script>

<style scoped></style>
