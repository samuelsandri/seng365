<template>
  <v-container>
    <v-label>Profile</v-label>
    <v-label>{{user.name}}</v-label>
    <v-label>{{user.email}}</v-label>
    <v-label>{{user.city}}</v-label>
    <v-label>{{user.country}}</v-label>
  </v-container>
</template>

<script>
  import {mapGetters} from "vuex";

  export default {
    name: "Profile",
    computed: {
      ...mapGetters(["user"]),
    },
  }
</script>

<style scoped>

</style>