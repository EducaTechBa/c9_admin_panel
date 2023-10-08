<template>
  <v-container>
    <SearchUsers :search="searchUsers" @newstudents="studentsChanged($event)" />
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              Place
            </th>
            <th class="text-left">
              Name
            </th>
            <th class="text-left">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(student, index) in students"
            :key="student.student"
            @click="studentClicked(student.student)"
          >
            <td>{{ index + 1 }}.</td>
            <td>{{ student.realName }}</td>
            <td>{{ student.points }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
import { gameStatisticsService } from "@/services";
import SearchUsers from "@/components/game/statistics/Users";

export default {
  name: "Leaderboard",
  components: {
    SearchUsers
  },
  data() {
    return {
      students: []
    };
  },
  async mounted() {
    const response = await gameStatisticsService.getLeaderboard();
    if (response.success === true) {
      this.students = response.data;
    } else {
      console.log("Failed getting leaderboard:");
      console.log(response);
    }
  },
  methods: {
    studentClicked(username) {
      this.$router.push(`/game/student?username=${username}`);
    },
    async studentsChanged(students) {
      console.log("Event emmited");
      if (students.length == 0) {
        const response = await gameStatisticsService.getLeaderboard();
        if (response.success === true) {
          this.students = response.data;
        }
      } else
        this.students = students;
    }
  }
};
</script>

<style scoped></style>
