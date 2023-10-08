import Vue from "vue";
import VueRouter from "vue-router";

import NotFound from "../views/NotFound";
import Dashboard from "../views/Dashboard";
import Login from "../views/Login";
import store from "../store/index";

Vue.use(VueRouter);
const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard
  },
  {
    path: "/",
    component: Dashboard
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/About")
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/courses",
    name: "Courses",
    component: () => import("@/views/Courses")
  },
  {
    path: "/courses/:course_id",
    name: "Course",
    component: () => import("@/components/course/Course")
  },
  {
    path: "/courses/:course_id/groups/:group_id",
    name: "Group",
    component: () => import("@/components/course/Group")
  },
  {
    path: "/assignments/:course_id",
    name: "Assignments",
    component: () => import("@/components/course/Assignment")
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: () => import("@/views/Statistics")
  },
  {
    path: "/game",
    name: "Game",
    component: () => import("@/views/Game")
  },
  {
    path: "/game/group",
    name: "GameGroup",
    component: () => import("@/components/game/statistics/Group")
  },
  {
    path: "/game/student",
    name: "StudentInfo",
    component: () => import("@/components/game/statistics/StudentInfo")
  },
  {
    path: "*",
    name: "NotFound",
    component: NotFound
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  if (to.name === "Login") {
    next();
  }
  const isAuthenticated = store.getters.isAuthenticated;
  const isGameSpectatorRoute =
    ["Login", "Dashboard"].includes(to.name) || to.path.includes("/game");
  if (isAuthenticated) {
    const isSpectator = store.getters.roles.includes("game-spectators");
    const isAdmin =
      store.getters.roles.includes("admin") ||
      store.getters.roles.includes("sysadmin");
    if ((isSpectator && isGameSpectatorRoute) || isAdmin) {
      next();
    } else {
      console.log("RESET STATE");
      store.actions.dispatch("resetState");
      await fetch("/api/v1/logout");
      next(Login);
    }
  } else {
    next(Login);
  }
});

document.addEventListener("logout", async () => {
  if (router.currentRoute.path !== "/login") {
    await store.dispatch("resetState");
    await fetch("/api/v1/logout");
    await router.push("/login");
  }
});

export default router;
