<template>
  <v-container>
    <v-snackbar color="error" top v-model="errorSnackbar" :timeout="5000">
      {{ errorMsg }}
    </v-snackbar>
    <v-snackbar color="info" top v-model="successSnackbar" :timeout="5000">
      {{ successMsg }}
    </v-snackbar>
    <v-row>
      <v-col>
        <v-card>
          <v-row>
            <v-col>
              <h2 class="profileHeader">Profile Details</h2>
            </v-col>
            <v-col cols="2">
              <v-row class="profileEditButton" justify="end">
                <v-dialog v-model="editDialog" max-width="800px">
                  <template v-slot:activator="{ on }">
                    <v-btn color="info" v-on="on">Edit Profile</v-btn>
                  </template>
                  <v-card>
                    <v-card-title>Edit Profile</v-card-title>
                    <v-divider class="popupCardDivider"></v-divider>
                    <v-card-text>
                      <v-text-field clearable outlined label="Name" v-model="user.name"></v-text-field>
                      <v-text-field clearable outlined label="Email" v-model="user.email"></v-text-field>
                      <v-text-field clearable outlined label="City" v-model="user.city"></v-text-field>
                      <v-text-field clearable outlined label="Country" v-model="user.country"></v-text-field>
                      <v-text-field type="password" clearable outlined label="New Password" v-model="newPassword"></v-text-field>
                      <v-text-field type="password" clearable v-if="!isEmptyOrSpaces(newPassword)" outlined label="Current Password" v-model="currentPassword"></v-text-field>
                      <v-btn color="success" @click="editDialog = false" v-on:click="editProfile">Submit</v-btn>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </v-row>
            </v-col>
          </v-row>
          <v-divider class="cardDivider"></v-divider>
          <v-row align="start" justify="start">
            <v-col class="profilePictureCol" cols="3">
              <v-row align="center" justify="center">
                <v-avatar class="profileAvatar">
                  <v-img id="profileImg" :src='userProfilePicture()'>
                    <v-icon x-large v-if="!hasPicture">mdi-account</v-icon>
                  </v-img>
                </v-avatar>
              </v-row>
              <v-row align="center" justify="center">
                <v-dialog v-model="profilePictureDialog">
                  <template v-slot:activator="{on}">
                    <v-btn v-on="on" color="info" class="editImageButton">Edit Image</v-btn>
                  </template>
                  <v-card>
                    <v-card-title>Edit Profile Picture</v-card-title>
                    <v-divider class="popupCardDivider"></v-divider>
                    <v-card-text>
                      <v-form>
                        <v-file-input label="Profile Picture"
                                      v-model="profilePicture"
                                      prepend-icon="mdi-camera"
                                      outlined
                                      show-size
                                      clearable
                                      accept="image/jpg,image/jpeg,image/gif,image/png">
                        </v-file-input>
                        <v-btn color="success" @click="profilePictureDialog = false" v-on:click="setProfilePicture">Save</v-btn>
                        <v-btn class="formSecondButton" color="error" @click="profilePictureDialog = false" v-on:click="removeProfilePicture">Remove</v-btn>
                      </v-form>
                    </v-card-text>
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
      <v-col>
        <v-card>
          <v-row>
            <v-col cols="2">
              <h2 class="profileHeader">My Petitions</h2>
            </v-col>
            <v-col>
              <v-dialog v-model="createPetitionDialog" max-width="800px">
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" color="success">Create Petition</v-btn>
                </template>
                <v-card>
                  <v-card-title>Create Petition</v-card-title>
                  <v-divider class="popupCardDivider"></v-divider>
                  <v-card-text>
                    <v-form>
                      <v-text-field clearable outlined label="Title" v-model="petitionTitle"></v-text-field>
                      <v-textarea clearable outlined label="Description" v-model="petitionDescription"></v-textarea>
                      <v-overflow-btn outlined :items="categories" label="Category" v-model="petitionCategory"></v-overflow-btn>
                      <v-label>Closing Date: </v-label>
                      <v-date-picker class="formSecondButton" v-model="petitionEndDate"></v-date-picker>
                      <br><br>
                      <v-btn color="success" @click="createPetitionDialog = false" v-on:click="createNewPetition">Create</v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
          <v-divider class="cardDivider"></v-divider>
          <v-card-text>
            <v-row>
              <v-col cols="3">
                <h4>Title</h4>
              </v-col>
              <v-col>
                <h4>Category</h4>
              </v-col>
              <v-col>
                <h4>Author</h4>
              </v-col>
              <v-col>
                <h4>Signatures</h4>
              </v-col>
              <v-col></v-col>
            </v-row>
            <v-row v-for="(petition, idx) in petitions" v-bind:key="idx" align="center" justify="center">
              <v-col cols="3">
                <a v-on:click="goToPetition(petition.petitionId)">{{petition.title}}</a>
              </v-col>
              <v-col>
                <p class="profileInfoLabel">{{petition.category}}</p>
              </v-col>
              <v-col>
                <p class="profileInfoLabel">{{petition.authorName}}</p>
              </v-col>
              <v-col>
                <v-row align="center">
                  <v-icon color="primary">mdi-pen</v-icon>
                  <h2>{{petition.signatureCount}}</h2>
                </v-row>
              </v-col>
              <v-col>
                <v-btn color="error" v-on:click="deletePetition(petition.petitionId)">Delete</v-btn>
              </v-col>
            </v-row>
          </v-card-text>

        </v-card>
      </v-col>
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
        editDialog: false,
        profilePictureDialog: false,
        createPetitionDialog: false,
        editProfileValid: false,
        createPetitionValid: false,
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
        errorSnackbar: false,
        errorMsg: '',
        successSnackbar: false,
        successMsg: '',
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
        if (!this.isEmptyOrSpaces(this.petitionEndDate)) {
          apiPetition.createPetition(this.petitionTitle, this.petitionDescription,
              this.categoriesDict[this.petitionCategory], this.petitionEndDate).then(
              response => {
                this.successMsg = "Created";
                this.successSnackbar = true;
                apiPetition.signPetition(response.data.petitionId).then(
                    () => {
                      this.getFilteredPetitions();
                    }
                );
              }).catch(
              err => {
                this.errorMsg = err.response.statusText;
                this.errorSnackbar = true;
              }
          )
        } else {
          apiPetition.createPetitionNoDate(this.petitionTitle, this.petitionDescription,
              this.categoriesDict[this.petitionCategory]).then(
              response => {
                this.successMsg = "Created";
                this.successSnackbar = true;
                apiPetition.signPetition(response.data.petitionId).then(
                    () => {
                      this.getFilteredPetitions();
                    }
                );
              }).catch(
              err => {
                this.errorMsg = err.response.statusText;
                this.errorSnackbar = true;
              }
          )
        }
      },
      setProfilePicture() {
        console.log(this.profilePicture);
        if (this.profilePicture !== null) {
          apiUser.addProfilePicture(this.user.userId, this.profilePicture, 'image/jpeg').then(
              () => {
                location.reload();
              }
          ).catch(
              err => {
                this.errorMsg = err.response.statusText;
                this.errorSnackbar = true;
              }
          );
        }
      },
      removeProfilePicture() {
        apiUser.removeProfilePicture(this.user.userId).then(
            () => {
              location.reload();
            }
        );
      },
      isEmptyOrSpaces(str){
        return str === null || str.match(/^ *$/) !== null;
      },
      editProfile() {
        let data = {
          name: this.user.name,
          email: this.user.email,
        };
        if (!this.isEmptyOrSpaces(this.newPassword)) {
          data["password"] = this.newPassword;
          data["currentPassword"] = this.currentPassword;
        }
        if (!this.isEmptyOrSpaces(this.user.city)) {
          data["city"] = this.user.city;
        }
        if (!this.isEmptyOrSpaces(this.user.country)) {
          data["country"] = this.user.country;
        }
        apiUser.editUser(this.user.userId, data).then(
            () => {
              this.successMsg = 'Saved';
              this.successSnackbar = true;
            }
        ).catch(
            err => {
              this.errorMsg = err.response.statusText;
              this.errorSnackbar = true;
            }
        );
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
      },
      deletePetition(petitionId) {
        apiPetition.deletePetition(petitionId).then(
            () => {
              this.getFilteredPetitions();
              this.successMsg = 'Deleted';
              this.successSnackbar = true;
            }
        );
      },
    }
  }
</script>

<style scoped>

</style>