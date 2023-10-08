<template>
  <v-container>
    <v-card-title class="justify-center">Usage stats</v-card-title>
  
    <keep-alive>
      <Statistics />
    </keep-alive>
  </v-container>
</template>

<script>
import Statistics from "@/components/Statistics";
export default {
  name: "Usage stats",
  components: { Statistics }
};
</script>

<style scoped></style>
