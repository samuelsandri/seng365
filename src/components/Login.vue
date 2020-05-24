<template>
  <div class="loginContainer">
    <v-form class="loginForm">
      <v-text-field
          v-model="email"
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
      <v-btn v-on:click="loginUser">Login</v-btn>
    </v-form>
  </div>
</template>

<script>
  import {apiUser} from "@/api";
  import {mapActions, mapGetters} from 'vuex';
  import router from "@/router";

  export default {
    name: "Login",
    data() {
      return {
        email: null,
        password: null,
      }
    },
    computed: {
      ...mapGetters(["user"]),
    },
    methods: {
      ...mapActions(['setUserId', 'userLogin', 'createUser', 'setUserProfilePicture']),
      loginUser() {
        apiUser.login(this.email, this.password)
            .then(response => {
              this.setUserId(response.data);
              this.userLogin();
              localStorage.setItem("sessionId", response.data.token);
              apiUser.refreshInstance();
              this.getLoggedInUser();
              router.push('Home');
            });
      },
      getLoggedInUser() {
        apiUser.getUser(this.user.userId)
            .then(response => {
              this.createUser(response.data);
        });
      },
    }
  }
</script>

<style scoped>

</style>