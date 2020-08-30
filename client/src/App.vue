<template>
  <v-app id="inspire">
    <v-navigation-drawer
        v-model="drawer"
        app
    >
      <v-container v-if="user.isLoggedIn">
        <v-row class="menuProfileContainer">
          <v-avatar class="menuProfileAvatar">
            <v-img :src='userProfilePicture()'>
              <v-icon large v-if="!hasPicture">mdi-account</v-icon>
            </v-img>
          </v-avatar>
        </v-row>
        <v-row class="menuProfileContainer">
          {{user.name}}
        </v-row>
      </v-container>
      <v-list dense>

        <v-list-item v-if="!user.isLoggedIn&&$route.path!=='/Login'" v-on:click="$router.push('/Login')" link>
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item disabled class="menuItemSelected" v-if="!user.isLoggedIn&&$route.path==='/Login'" v-on:click="$router.push('/Login')" link>
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="!user.isLoggedIn&&$route.path!=='/Signup'" v-on:click="$router.push('/Signup')" link>
          <v-list-item-action>
            <v-icon>mdi-account-multiple-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Sign Up</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item disabled class="menuItemSelected" v-if="!user.isLoggedIn&&$route.path==='/Signup'" v-on:click="$router.push('/Signup')" link>
          <v-list-item-action>
            <v-icon>mdi-account-multiple-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Sign Up</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="user.isLoggedIn&&$route.path!=='/Profile'" v-on:click="$router.push('/Profile')" link>
          <v-list-item-action>
            <v-icon>mdi-account</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item disabled class="menuItemSelected" v-if="user.isLoggedIn&&$route.path==='/Profile'" v-on:click="$router.push('/Profile')" link>
          <v-list-item-action>
            <v-icon>mdi-account</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="$route.path!=='/Petitions'" v-on:click="$router.push('/Petitions')" link>
          <v-list-item-action>
            <v-icon>mdi-poll</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Petitions</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item disabled class="menuItemSelected" v-if="$route.path==='/Petitions'" v-on:click="$router.push('/Petitions')" link>
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
        color="primary"
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
        color="primary"
        app
    >
      <span class="white--text">&copy; 2020</span>
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
      hasPicture: false,
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
        localStorage.setItem('sessionId', null);
        localStorage.setItem('userId', null);
        apiUser.logout().then();
        this.userLogout();
        router.push('/Login');
      },
      printInfo() {
      },
      userProfilePicture() {
        this.hasProfilePicture();
        return "http://localhost:4941/api/v1/users/" + this.user.userId + "/photo"
      },
      hasProfilePicture() {
        apiUser.getProfilePicture(this.user.userId).then(
            () => {
              this.hasPicture = true;
            }
        ).catch(
            () => {
              this.hasPicture = false;
            }
        )
      }
    }
  }
</script>

<style>
  @import "../public/style.css";
</style>