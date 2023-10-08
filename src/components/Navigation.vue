<template>
  <v-navigation-drawer
    v-model="drawer"
    dark
    app
    :mini-variant.sync="mini"
    permanent
  >
    <v-list dense nav class="py-0">
      <v-list-item two-line class="px-0">
        <v-list-item-avatar>
          <v-icon
            >{{
              "mdi-alpha-" +
                (user.username === undefined ? "x" : user.username.charAt(0)) +
                "-circle"
            }}
          </v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ user.realName }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.username }}</v-list-item-subtitle>
        </v-list-item-content>

        <v-btn icon @click.stop="mini = !mini">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item v-for="item in items" :key="item.title" :to="item.link" link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-spacer />
      <v-list-item @click="logout">
        <v-list-item-icon>
          <v-icon>mdi-exit-run</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      items: [
        {
          title: "Dashboard",
          icon: "mdi-view-dashboard",
          link: "/dashboard"
        },
        {
          title: "Game",
          icon: "mdi-gamepad-variant-outline",
          link: "/game"
        }
      ],
      mini: true,
      user: {}
    };
  },
  mounted() {
    this.user = this.$store.getters.userProfile;
    const roles = this.$store.getters.roles;
    if (roles.includes("admin") || roles.includes("sysadmin")) {
      this.items.push(
        ...[
          {
            title: "Courses",
            icon: "mdi-school",
            link: "/courses"
          },
          {
            title: "Usage Statistics",
            icon: "mdi-chart-areaspline-variant",
            link: "/statistics"
          },
          {
            title: "About",
            icon: "mdi-help-box",
            link: "/about"
          }
        ]
      );
    }
  },
  methods: {
    async logout() {
      await fetch("/api/v1/logout");
      await this.$router.push("/login");
    }
  }
};
</script>
