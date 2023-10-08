<template>
  <v-container>
    <v-text-field
        type="text"
        v-model="query"
        label="Search users by name or username"
        :rules="[notEmpty]"
      ></v-text-field>
      <v-btn @click="search" :disabled="isProcessing">Search</v-btn>&nbsp;&nbsp;
      <v-btn @click="clear" :disabled="isProcessing">Clear</v-btn>
  </v-container>
</template>

<script>
import { gameStatisticsService } from "@/services";

export default {
  name: "SearchUsers",
  data() {
    return {
      isProcessing: false,
      notEmpty: v => (v || "").length > 0 || "This field cannot be empty",
      query: ""
    };
  },
  async mounted() {
    //
  },
  methods: {
    async search() {
      if (this.query != "") {
        this.isProcessing = true;
        const response = await gameStatisticsService.searchUsers(this.query);
        if (response.success === true) {
          this.$emit('newstudents', response.data);
        }
        this.isProcessing = false;
      }
    },
    clear() {
      this.query = "";
      this.$emit('newstudents', []);
    },
    deep: true
  }
};
</script>

<style scoped></style>
