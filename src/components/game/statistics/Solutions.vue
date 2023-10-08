<template>
  <v-card>
    <v-card-title> Solutions</v-card-title>
    <div class="col-md-12">
      <div class="items-container" style="columns: 600px;">
        <div v-if="solutions.length === 0">No solutions found</div>
        <div class="item-container" v-for="solution in solutions" :key="solution.id">
            {{ solution.student }}, {{ solution.points }} points<br>
            <pre style="overflow: scroll; background-color: #eee; font-size: small; width: 600px; height: 500px">{{ solution.content }}</pre>
        </div><!-- /.item-container -->
      </div><!-- /.items-container -->
    </div><!-- /.col-md-12 -->
  </v-card>
</template>

<script>
import { gameStatisticsService } from "@/services";

export default {
  name: "Solutions",
  data() {
    return {
      solutions: []
    };
  },
  async mounted() {
    const body = await gameStatisticsService.getSolutions(this.$route.query.taskId);
    if (body.success === true ) {
      this.solutions = body.data;
    } else {
      console.log("Failed to load solutions for task " + this.$route.query.taskId);
    }
  }
};
</script>

<style scoped></style>
