<template>
  <div class="loginContainer">
    <v-snackbar color="error" top v-model="snackbar" :timeout="5000">
      {{ errorMsg }}
    </v-snackbar>
    <v-form v-model="valid" class="loginForm">
      <v-text-field
          :rules="emailRules"
          v-model="email"
          label="Email"
          required
          outlined
      ></v-text-field>
      <v-text-field
          :rules="passwordRules"
          v-model="password"
          label="Password"
          required
          outlined
      ></v-text-field>
      <v-btn color="success" :disabled="!valid" v-on:click="loginUser">Login</v-btn>
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
        valid: false,
        emailRules: [
          v => !!v || 'E-mail is required',
        ],
        passwordRules: [
          v => !!v || 'Password is required',
        ],
        snackbar: false,
        errorMsg: '',
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
              localStorage.setItem("userId", response.data.userId);
              localStorage.setItem("sessionId", response.data.token);
              apiUser.refreshInstance();
              this.getLoggedInUser();
              router.push('Profile');
            }).catch(
                err => {
                  this.errorMsg = err.response.statusText;
                  this.snackbar = true;
                }
        );
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