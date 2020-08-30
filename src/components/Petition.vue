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
        <v-card max-width="800px">
          <v-img :src="petitionImage()"></v-img>
          <v-card-title>{{petition.title}}</v-card-title>
          <v-card-text>
            <p>{{petition.description}}</p>
            <h4>Category: {{petition.category}}</h4>
            <br>
            <h5>Created: {{petition.createdDate}}</h5>
            <h5>Closes: {{petition.closingDate}}</h5>
            <v-row class="signatures" justify="end" align="center">
              <v-icon v-if="this.signedPetition" color="primary" v-on:click="toggleSignature(petition.petitionId)">mdi-pen</v-icon>
              <v-icon v-if="!this.signedPetition" v-on:click="toggleSignature(petition.petitionId)">mdi-pen</v-icon>
              <h2>{{petition.signatureCount}}</h2>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-row>
          <v-col class="leftColCard">
            <v-card>
              <v-card-title>Author</v-card-title>
              <v-divider class="cardDivider"></v-divider>
              <v-row class="menuProfileContainer">
                <v-avatar class="menuProfileAvatar">
                  <v-img :src='authorProfilePicture()'>
                    <v-icon large v-if="!hasPicture">mdi-account</v-icon>
                  </v-img>
                </v-avatar>
              </v-row>
              <v-card-text>
                <h3>{{petition.authorName}}</h3>
                <p>Location: {{petition.authorCity}}, {{petition.authorCountry}}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="leftColCard">
            <v-card>
              <v-card-title>Share</v-card-title>
              <v-divider class="cardDivider"></v-divider>
              <v-row>
                <v-col>
                  <FacebookButton class="profileHeader" url="" :desciption="facebookDescription"></FacebookButton>
                  <br>
                  <TwitterButton class="profileHeader"></TwitterButton>
                  <br>
                  <RedditButton class="profileHeader"></RedditButton>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="petition.authorId === user.userId">
          <v-col class="leftColCard">
            <v-card>
              <v-card-title>Manage</v-card-title>
              <v-divider class="cardDivider"></v-divider>
              <v-row>
                <v-col>
                  <v-dialog max-width="800px" v-model="editPetitionDialog">
                    <template v-slot:activator="{ on }">
                      <v-btn class="profileHeader" color="info" v-on="on">Edit Petition</v-btn>
                    </template>
                    <v-card>
                      <v-card-title>Edit Petition</v-card-title>
                      <v-divider class="popupCardDivider"></v-divider>
                      <v-card-text>
                        <v-form>
                          <v-text-field outlined label="Title" v-model="petitionTitle"></v-text-field>
                          <v-textarea outlined label="Description" v-model="petitionDescription"></v-textarea>
                          <v-overflow-btn outlined :items="categories" label="Category" v-model="petitionCategory"></v-overflow-btn>
                          <v-label>Closing Date: </v-label>
                          <v-date-picker class="formSecondButton" v-model="petitionEndDate"></v-date-picker>
                          <br><br>
                          <v-btn color="success" @click="editPetitionDialog = false" v-on:click="editPetition">Save</v-btn>
                        </v-form>
                      </v-card-text>
                    </v-card>
                  </v-dialog>
                  <br><br>
                  <v-dialog v-model="heroImageDialog">
                    <template v-slot:activator="{on}">
                      <v-btn class="profileHeader" v-on="on" color="info">Edit Image</v-btn>
                    </template>
                    <v-card>
                      <v-card-title>Edit Hero Image</v-card-title>
                      <v-divider class="popupCardDivider"></v-divider>
                      <v-card-text>
                        <v-form>
                          <v-file-input label="Hero Image"
                                        v-model="heroImage"
                                        prepend-icon="mdi-camera"
                                        outlined
                                        show-size
                                        clearable
                                        accept="image/jpg,image/jpeg,image/gif,image/png">
                          </v-file-input>
                          <v-btn color="success" @click="heroImageDialog = false" v-on:click="setHeroImage">Save</v-btn>
                        </v-form>
                      </v-card-text>
                    </v-card>
                  </v-dialog>
                  <br><br>
                  <v-btn class="profileHeader" color="error" v-on:click="deletePetition">Delete Petition</v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Signatures</v-card-title>
          <v-divider class="cardDivider"></v-divider>
          <v-row align="center">
            <v-col cols="1"></v-col>
            <v-col>
              <h4 class="profileInfoLabel">Name</h4>
            </v-col>
            <v-col>
              <h4 class="profileInfoLabel">Location</h4>
            </v-col>
          </v-row>
          <v-row align="center" v-for="(signatory, idx) in petitionSignatories" v-bind:key="idx">
            <v-col cols="1">
              <v-avatar class="signatoryProfileAvatar">
                <v-img :src='signatoryProfilePicture(signatory.signatoryId)'>
                </v-img>
              </v-avatar>
            </v-col>
            <v-col>
              <p class="profileInfoLabel">{{signatory.name}}</p>
            </v-col>
            <v-col>
              <p class="profileInfoLabel">{{signatory.city}}, {{signatory.country}}</p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import {apiPetition, apiUser} from "../api";
  import TwitterButton from "vue-share-buttons/src/components/TwitterButton";
  import RedditButton from "vue-share-buttons/src/components/RedditButton";
  import FacebookButton from "vue-share-buttons/src/components/FacebookButton";
  import router from "../router";
  import {mapGetters} from "vuex";

  export default {
    name: "Petition",
    components: {
      TwitterButton,
      RedditButton,
      FacebookButton,
    },
    data() {
      return {
        petition: null,
        petitionSignatories: [],
        facebookDescription: document.location.href,
        petitionTitle: null,
        petitionDescription: null,
        petitionCategory: null,
        petitionCategoryId: null,
        petitionEndDate: null,
        categories: [],
        categoriesDict: {},
        signedPetition: false,
        hasPicture: false,
        editPetitionDialog: false,
        heroImage: null,
        heroImageDialog: false,
        errorSnackbar: false,
        errorMsg: '',
        successSnackbar: false,
        successMsg: '',
      }
    },
    mounted() {
      this.getPetitionDetails();
      this.getPetitionCategories();
    },
    watch: {
      "$route.params": {
        handler() {
          this.getPetitionDetails();
          this.getPetitionCategories();
        }
      }
    },
    computed: {
      ...mapGetters(["user"]),
    },
    methods: {
      getPetitionDetails() {
        apiPetition.getDetailedPetition(this.$route.params.petitionId).then(
            response => {
              this.petition = response.data;
              this.petitionTitle = response.data.title;
              this.petitionDescription = response.data.description;
              this.petitionCategoryId = response.data.categoryId;
            }
        );
        apiPetition.getPetitionSignatures(this.$route.params.petitionId).then(
            response => {
              this.petitionSignatories = response.data;
              let signatoryIds = [];
              for (let signatory of response.data) {
                signatoryIds.push(signatory.signatoryId)
              }
              this.signedPetition = signatoryIds.includes(this.user.userId);
            }
        );
      },
      getPetitionCategories() {
        apiPetition.getCategories().then(
            response => {
              for (let category of response.data) {
                this.categories.push(category.name);
                this.categoriesDict[category.name] = category.categoryId;
              }
              this.petitionCategory = this.categoriesDict[this.petitionCategoryId];
            }
        )
      },
      editPetition() {
        if (!this.isEmptyOrSpaces(this.petitionEndDate)) {
          apiPetition.patchPetition(this.$route.params.petitionId, this.petitionTitle, this.petitionDescription,
              this.categoriesDict[this.petitionCategory], this.petitionEndDate).then(
              () => {
                this.getPetitionDetails();
                this.successMsg = 'Saved';
                this.successSnackbar = true;
              }
          ).catch(
              err => {
                this.errorMsg = err.response.statusText;
                this.errorSnackbar = true;
              }
          );
        } else {
          apiPetition.patchPetitionNoDate(this.$route.params.petitionId, this.petitionTitle, this.petitionDescription,
              this.categoriesDict[this.petitionCategory]).then(
              () => {
                this.getPetitionDetails();
                this.successMsg = 'Saved';
                this.successSnackbar = true;
              }
          ).catch(
              err => {
                this.errorMsg = err.response.statusText;
                this.errorSnackbar = true;
              }
          );
        }
      },
      deletePetition() {
        apiPetition.deletePetition(this.$route.params.petitionId).then(
            () => {
              router.push('/Profile');
            }
        );
      },
      isEmptyOrSpaces(str){
        return str === null || str.match(/^ *$/) !== null;
      },
      toggleSignature(petitionId) {
        apiPetition.addPetitionSignature(petitionId).then(
            () => {
              this.getPetitionDetails();
            }).catch(
            (error) => {
              if (error.response.status === 403) {
                apiPetition.deletePetitionSignature(petitionId).then(
                    () => {
                      this.getPetitionDetails();
                    }
                );
              }
            });
      },
      petitionImage() {
        return "http://localhost:4941/api/v1/petitions/" + this.$route.params.petitionId + "/photo"
      },
      authorProfilePicture() {
        this.hasProfilePicture();
        return "http://localhost:4941/api/v1/users/" + this.petition.authorId + "/photo"
      },
      hasProfilePicture() {
        apiUser.getProfilePicture(this.petition.authorId).then(
            () => {
              this.hasPicture = true;
            }
        ).catch(
            () => {
              this.hasPicture = false;
            }
        )
      },
      signatoryProfilePicture(userId) {
        return "http://localhost:4941/api/v1/users/" + userId + "/photo"
      },
      setHeroImage() {
        if (this.heroImage !== null) {
          apiPetition.addHeroImage(this.$route.params.petitionId, this.heroImage, 'image/jpeg').then(
              () => {
                location.reload();
              }
          );
        }
      },
    }
  }
</script>

<style scoped>

</style>