<template>
  <div class="loginContainer">
    <v-form class="loginForm">
      <v-text-field
          v-model="user.name"
          label="Name"
          required
          outlined
      ></v-text-field>
      <v-text-field
          v-model="user.email"
          label="Email"
          required
          outlined
      ></v-text-field>
      <v-text-field
          v-model="password"
          label="Password"
          required
          outlined
      ></v-text-field>
      <v-text-field
          v-model="user.city"
          label="City"
          required
          outlined
      ></v-text-field>
      <v-text-field
          v-model="user.country"
          label="Country"
          required
          outlined
      ></v-text-field>
      <v-text-field
          label="Profile Picture"
          required
          outlined
      ></v-text-field>
      <v-btn v-on:click="createUser">Sign Up</v-btn>
    </v-form>
  </div>
</template>

<script>
  import {apiUser} from "../api";
  import {mapGetters, mapActions} from 'vuex';
  import router from "@/router";

  export default {
    name: "SignUp",
    data() {
      return {
        password: null,
      };
    },
    computed: {
      ...mapGetters(["user"]),
    },
    methods: {
      ...mapActions(["setUserId", "userLogin"]),
      createUser() {
        apiUser.createUser(this.user.name, this.user.email, this.password, this.user.city, this.user.country)
            .then(response => {
              this.setUserId(response.data.userId);
              this.loginUser();
            });
      },
      loginUser() {
        apiUser.login(this.user.email, this.password)
            .then(response => {
                  this.setUserId(response.data.userId);
                  this.userLogin();
                  localStorage.setItem("sessionId", response.data.token);
                  apiUser.refreshInstance();
                  router.push('Home');
                });
      },
    }
  }
</script>

<style scoped>

</style>