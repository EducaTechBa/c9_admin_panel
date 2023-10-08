export default {
  state: {
    userId: undefined,
    sessionId: undefined,
    profile: {},
    roles: []
  },
  mutations: {
    setUserId(state, id) {
      state.userId = id;
    },
    setSessionId(state, id) {
      state.sessionId = id;
    },
    setProfile(state, profile) {
      state.profile = { ...state.profile, ...profile };
    },
    setRoles(state, roles) {
      state.roles = roles;
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.sessionId !== undefined;
    },
    userProfile(state) {
      return state.profile;
    },
    roles(state) {
      return state.roles;
    }
  },
  actions: {
    login: async function(context, { username, password }) {
      const response = await fetch(`/api/v1/auth`, {
        method: "post",
        body: `login=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        }
      });
      const body = await response.json();
      if (
        (body.success === true || body.success === "true") &&
        (body.roles.includes("sysadmin") ||
          body.roles.includes("admin") ||
          body.roles.includes("game-spectator"))
      ) {
        context.commit("setUserId", 1);
        context.commit("setSessionId", body["sid"]);
        context.commit("setProfile", {
          username: username,
          realName: ""
        });
        context.commit("setRoles", body.roles);
        const profileResponse = await fetch(
          `/api/v1/users?user=${username}`,
          {
            method: "get",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json"
            }
          }
        );
        const data = await profileResponse.json();
        if (data.success === true || data.success === "true") {
          context.commit("setProfile", {
            realName: data.data.realname
          });
        }
        return {
          success: body.success
        };
      } else {
        if (body.success && body.role === "student") {
          body.message = "Nedozvoljen pristup";
        }
        return {
          success: false,
          message: body.message
        };
      }
    },
    refresh: async function(context) {
      const response = await fetch("/api/v1/refresh");
      const body = await response.json();
      if (
        (body.success === true || body.success === "true") &&
        (body.roles.includes("sysadmin") ||
          body.roles.includes("admin") ||
          body.roles.includes("game-spectator"))
      ) {
        context.commit("setUserId", 1);
        context.commit("setSessionId", body["sid"]);
        context.commit("setProfile", {
          username: body.username,
          realName: ""
        });
        context.commit("setRoles", body.roles);
        const profileResponse = await fetch(
          `/api/v1/users?user=${body.username}`,
          {
            method: "get",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json"
            }
          }
        );
        const data = await profileResponse.json();

        if (data.success === true || data.success === "true") {
          context.commit("setProfile", {
            realName: data.data.realname
          });
        }
        return {
          success: body.success
        };
      } else {
        if (
          body.success &&
          body.roles.includes("student") &&
          body.roles.length === 1
        ) {
          body.message = "Nedozvoljen pristup";
        }
        return {
          success: false,
          message: body.message
        };
      }
    },
    resetState: function(context) {
      context.commit("setSessionId", undefined);
      context.commit("setRoles", []);
    }
  }
};
