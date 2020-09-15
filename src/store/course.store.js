export default {
  state: {
    courses: []
  },
  mutations: {
    setCourses(state, courses) {
      state.courses = courses;
    },
    updateCourse(state, [courseId, course, vm]) {
      let matching = state.courses.filter(c => c.id === courseId);
      if (matching.length === 0) {
        return;
      }
      matching[0].groups = course.groups;
      vm.$forceUpdate();
    }
  },
  getters: {
    courses: (state) => {
      return state.courses;
    },
    courseById: (state) => (id) => {
      return state.courses.filter(course => course.id + "" === id)[0];
    },
    groupsForCourseId: state => id => state.courses.filter(c => c.id === id)[0].groups || [],
    membersOfGroupByGroupIdAndCourseId:
      state =>
        (courseId, groupId) =>
          state
            .courses
            .filter(c => c.id === courseId)[0]
            .groups
            .filter(
              group =>
                group.id === groupId
            )[0]
            .members || {}
  },
  actions: {
    async refreshMembers(context, [course, vm]) {
      for (let group of course.groups) {
        const response = await fetch(`/services/courses.php?course_id=${course.id}&group_id=${group.id}&members`, {
          method: "get",
          headers: {
            Accept: "application/json"
          }
        });
        const body = await response.json();
        console.log(body.success);
        if (!body.success) {
          return false;
        }
        group.members = body.data.members;
      }
      context.commit("updateCourse", [course.id, course, vm]);
    },
    async refreshCourses(context) {
      const response = await fetch(`/services/courses.php`, {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      });
      const body = await response.json();
      if (!body.success) {
        return false;
      }
      let courses = body.data;
      for (const course of courses) {
        const response = await fetch(`/services/courses.php?course_id=${course.id}&groups`, {
          method: "get",
          headers: {
            Accept: "application/json"
          }
        });
        const body = await response.json();
        if (!body.success) {
          return false;
        }
        course.groups = body.data.groups;
      }
      context.commit("setCourses", courses);
    }
  }
};
