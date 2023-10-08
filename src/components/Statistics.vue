<template>
  <v-container>
    <p>Period: <a @click="periodChanged('12h')">12 hours</a> * <a @click="periodChanged('1d')">1 day</a> * <a @click="periodChanged('7d')">7 days</a> * <a @click="periodChanged('30d')">30 days</a></p>
    
    <div id="chart_users" style="width: 900px; height: 500px"></div>
    <div id="chart_load" style="width: 900px; height: 500px"></div>
    <div id="chart_mem" style="width: 900px; height: 500px"></div>
    <div id="chart_other" style="width: 900px; height: 500px"></div>
  </v-container>
</template>

<script>
export default {
  name: "Statistics",
  data() {
    return {
      scriptsLoaded: false
    };
  },
  mounted() {
    console.log("Script loaded: " + this.scriptsLoaded);
    if (!this.scriptsLoaded) {
      let gChartsScript = document.createElement('script');
      gChartsScript.setAttribute('src', '//www.gstatic.com/charts/loader.js');
      document.head.appendChild(gChartsScript);
      
      let jQueryScript = document.createElement('script');
      jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js');
      jQueryScript.setAttribute('integrity', 'sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==');
      jQueryScript.setAttribute('crossorigin', 'anonymous');
      jQueryScript.setAttribute('referrerpolicy', 'no-referrer');
      document.head.appendChild(jQueryScript);
      
      setTimeout(function() {
        let adminStatsScript = document.createElement('script');
        adminStatsScript.setAttribute('src', '/static/js/admin_stats.js');
        document.head.appendChild(adminStatsScript);
        setTimeout(function() {
          eval('adminStatsInit();');
        }, 500);
      }, 500);
      
      this.scriptsLoaded = true;
    }
  },
  methods: {
    periodChanged(period) {
      this.$router.push(`/statistics?period=${period}`);
    },
  }
};
</script>

<style scoped></style>
