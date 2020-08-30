<template>
  <div class="loginContainer">
    <v-snackbar color="error" top v-model="snackbar" :timeout="5000">
      {{ errorMsg }}
    </v-snackbar>
    <v-form v-model="valid" class="loginForm">
      <v-text-field
          :rules="nameRules"
          v-model="user.name"
          label="Name"
          required
          outlined
      ></v-text-field>
      <v-text-field
          :rules="emailRules"
          v-model="user.email"
          label="Email"
          required
          outlined
      ></v-text-field>
      <v-text-field
          :rules="passwordRules"
          type="password"
          v-model="password"
          label="Password"
          required
          outlined
      ></v-text-field>
      <v-text-field
          v-model="user.city"
          label="City"
          outlined
      ></v-text-field>
      <v-text-field
          v-model="user.country"
          label="Country"
          outlined
      ></v-text-field>
      <v-btn :disabled="!valid" v-on:click="createUser">Sign Up</v-btn>
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
        valid: false,
        password: null,
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+/.test(v) || 'E-mail must be valid',
        ],
        nameRules: [
          v => !!v || 'Name is required',
          v => v.length <= 20 || 'Name must be less than 20 characters',
        ],
        passwordRules: [
          v => !!v || 'Password is required',
        ],
        snackbar: false,
        errorMsg: '',
      };
    },
    computed: {
      ...mapGetters(["user"]),
    },
    methods: {
      ...mapActions(["setUserId", "userLogin"]),
      createUser() {
        let data = {
          name: this.user.name,
          email: this.user.email,
          password: this.password,
        };
        if (!this.isEmptyOrSpaces(this.user.city)) {
          data["city"] = this.user.city;
        }
        if (!this.isEmptyOrSpaces(this.user.country)) {
          data["country"] = this.user.country;
        }
        apiUser.createUser(data)
            .then(response => {
              this.setUserId(response.data.userId);
              this.loginUser();
            }).catch(
                error => {
                  this.errorMsg = error.response.statusText;
                  this.snackbar = true;
                }
        );
      },
      loginUser() {
        apiUser.login(this.user.email, this.password)
            .then(response => {
              localStorage.setItem("userId", response.data.userId);
              localStorage.setItem("sessionId", response.data.token);
              this.setUserId(response.data);
              this.userLogin();
              apiUser.refreshInstance();
              router.push('/Profile');
            });
      },
      isEmptyOrSpaces(str){
        return str === null || str.match(/^ *$/) !== null;
      },
    }
  }
</script>

<style scoped>

</style>