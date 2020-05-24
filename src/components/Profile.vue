<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-row>
            <v-col>
              <h2>Profile Details</h2>
            </v-col>
            <v-col cols="2">
              <v-row justify="end">
                <v-dialog>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on">Edit</v-btn>
                  </template>
                  <v-card>
                    <v-form>
                      <v-text-field outlined label="Name" v-model="user.name"></v-text-field>
                      <v-text-field outlined label="Email" v-model="user.email"></v-text-field>
                      <v-text-field outlined label="City" v-model="user.city"></v-text-field>
                      <v-text-field outlined label="Country" v-model="user.country"></v-text-field>
                      <v-text-field outlined label="New Password" v-model="newPassword"></v-text-field>
                      <v-text-field v-if="!isEmptyOrSpaces(newPassword)" outlined label="Current Password" v-model="currentPassword"></v-text-field>
                      <v-btn v-on:click="editProfile">Submit</v-btn>
                    </v-form>
                  </v-card>
                </v-dialog>
              </v-row>
            </v-col>
          </v-row>
          <v-divider style="margin: 0 10px 5px"></v-divider>
          <v-row align="start" justify="start">
            <v-col cols="3">
              <v-row align="center" justify="center">
                <v-avatar class="profileAvatar">
                  <v-img :src='userProfilePicture()'>
                    <v-icon x-large v-if="!hasPicture">mdi-account</v-icon>
                  </v-img>
                </v-avatar>
              </v-row>
              <v-row align="center" justify="center">
                <v-dialog>
                  <template v-slot:activator="{on}">
                    <v-btn v-on="on" class="editImageButton">Edit Image</v-btn>
                  </template>
                  <v-card>
                    <v-form>
                      <v-file-input label="Profile Picture" v-model="profilePicture" prepend-icon="mdi-camera" outlined
                                    show-size clearable>
                      </v-file-input>
                    </v-form>
                  </v-card>
                </v-dialog>
              </v-row>
            </v-col>
            <v-col>
              <h3>{{user.name}}</h3>
              <p class="profileInfoLabel">Email: {{user.email}}</p>
              <p class="profileInfoLabel">Location: {{user.city}}, {{user.country}}</p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-dialog>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on">Create</v-btn>
        </template>
        <v-card>
          <v-form>
            <v-text-field outlined label="Title" v-model="petitionTitle"></v-text-field>
            <v-textarea outlined label="Description" v-model="petitionDescription"></v-textarea>
            <v-combobox outlined :items="categories" label="Category" v-model="petitionCategory"></v-combobox>
            <v-date-picker v-model="petitionEndDate"></v-date-picker>
          </v-form>
        </v-card>
        <v-card-actions>
          <v-btn v-on:click="createNewPetition">Create</v-btn>
        </v-card-actions>
      </v-dialog>
    </v-row>
    <v-row>
      <v-card tile outlined v-for="(petition, idx) in petitions" v-bind:key="idx">
        <v-card-text>
          <a v-on:click="goToPetition(petition.petitionId)">{{petition.title}}</a>
          <br>
          <p>Category: {{petition.category}}<br>Author: {{petition.authorName}}</p>
          <v-row>
            <v-icon>mdi-pencil-outline</v-icon>
            <h2>{{petition.signatureCount}}</h2>
          </v-row>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
  import {mapGetters} from "vuex";
  import {apiPetition, apiUser} from "../api";
  import router from "../router";

  export default {
    name: "Profile",
    data() {
      return {
        petitions: [],
        petitionTitle: null,
        petitionDescription: null,
        petitionCategory: null,
        petitionEndDate: null,
        categories: [],
        categoriesDict: {},
        newPassword: null,
        currentPassword: null,
        profilePicture: null,
        hasPicture: false,
      }
    },
    mounted() {
      this.getFilteredPetitions();
      this.getPetitionCategories();
    },
    watch: {
      "$route.params": {
        handler() {
          this.getFilteredPetitions();
          this.getPetitionCategories();
        }
      }
    },
    computed: {
      ...mapGetters(["user"]),
    },
    methods: {
      getFilteredPetitions() {
        let queryString = "authorId=" + this.user.userId;
        apiPetition.getPetitionsFiltered(queryString).then(
            response => {
              this.petitions = response.data;
            });
      },
      getPetitionCategories() {
        apiPetition.getCategories().then(
            response => {
              for (let category of response.data) {
                this.categories.push(category.name);
                this.categoriesDict[category.name] = category.categoryId;
              }
            }
        )
      },
      goToPetition(petitionId) {
        router.push('/petitions/' + petitionId);
      },
      createNewPetition() {
        apiPetition.createPetition(this.petitionTitle, this.petitionDescription,
            this.categoriesDict[this.petitionCategory], this.petitionEndDate).then(
                response => {
                  apiPetition.signPetition(response.data.petitionId);
                }
        )
      },
      setProfilePicture() {
        if (this.user.profilePicture !== null) {
          apiUser.addProfilePicture(this.user.userId, this.user.profilePicture)
        }
      },
      isEmptyOrSpaces(str){
        return str === null || str.match(/^ *$/) !== null;
      },
      editProfile() {
        if (this.isEmptyOrSpaces(this.newPassword)) {
          apiUser.editUser(this.user.userId, this.user.name, this.user.email, this.user.city, this.user.country)
        } else {
          apiUser.editUserNewPassword(this.user.userId, this.user.name, this.user.email, this.newPassword, this.currentPassword,
              this.user.city, this.user.country)
        }
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

<style scoped>

</style>