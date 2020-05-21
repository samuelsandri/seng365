<template>
  <v-app id="inspire">
    <v-navigation-drawer
        v-model="drawer"
        app
    >
      <v-label>{{user.name}}</v-label>
      <v-label>{{user.userId}}</v-label>
      <v-list dense>
        <v-list-item v-on:click="$router.push('/Home')" link>
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!user.isLoggedIn" v-on:click="$router.push('/Login')" link>
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!user.isLoggedIn" v-on:click="$router.push('/Signup')" link>
          <v-list-item-action>
            <v-icon>mdi-account-multiple-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Sign Up</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="user.isLoggedIn" v-on:click="$router.push('/Profile')" link>
          <v-list-item-action>
            <v-icon>mdi-account</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="user.isLoggedIn" v-on:click="$router.push('/Petitions')" link>
          <v-list-item-action>
            <v-icon>mdi-poll</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Petitions</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link v-if="user.isLoggedIn" v-on:click="logout">
          <v-list-item-action>
            <v-icon>mdi-arrow-collapse-right</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
        app
        color="indigo"
        dark
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{this.$route.name}}</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-container
          class="fill-height"
          fluid
      >
        <router-view/>
      </v-container>
    </v-content>
    <v-footer
        color="indigo"
        app
    >
      <span class="white--text">&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
  import router from "@/router";
  import {apiUser} from "@/api";
  import {mapGetters, mapActions} from 'vuex';

  export default {
    props: {
      source: String,
    },
    data: () => ({
      drawer: null,
    }),
    mounted() {
      this.printInfo();
    },
    computed: {
      ...mapGetters(["user"]),
    },
    name: 'App',
    methods: {
      ...mapActions(['userLogout']),
      logout() {
        apiUser.logout();
        this.userLogout();
        localStorage.setItem('sessionId', null);
        router.push('Login');
      },
      printInfo() {
        console.log(this.user.userId);
      }
    }
  }
</script>