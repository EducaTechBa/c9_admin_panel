<template>
  <v-container>
    <GameBuilder v-if="inTheGame" />
  </v-container>
</template>

<script>
import GameBuilder from "@/components/game/Builder";

export default {
  name: "Dashboard",
  components: { GameBuilder },
  data() {
    return {
      inTheGame: false
    };
  },
  async mounted() {
    let response = await fetch("/api/v1/game/status");
    let body = await response.json();
    console.log(body);
    if (body.success && body.roles.includes("admin")) {
      console.log("yes");
    }
    this.inTheGame = body.success;
  }
};
</script>
