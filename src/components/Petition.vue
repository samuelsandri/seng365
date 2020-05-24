<template>
  <v-container>
    <v-card>
      <img :src="petitionImage()">
      <v-card-text>
        <v-dialog>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on">Edit</v-btn>
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
            <v-btn v-on:click="editPetition">Confirm</v-btn>
          </v-card-actions>
        </v-dialog>
        <v-btn v-on:click="deletePetition">Delete</v-btn>
        <p>{{petition.title}}</p>
        <p>{{petition.description}}</p>
        <p>{{petition.category}}</p>
        <p>{{petition.createdDate}}</p>
        <p>{{petition.closingDate}}</p>
        <v-row>
          <v-icon v-if="this.signedPetition" color="green" v-on:click="toggleSignature(petition.petitionId)">mdi-pencil-outline</v-icon>
          <v-icon v-if="!this.signedPetition" v-on:click="toggleSignature(petition.petitionId)">mdi-pencil-outline</v-icon>
          <h2>{{petition.signatureCount}}</h2>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <FacebookButton url="" :desciption="facebookDescription"></FacebookButton>
        <TwitterButton></TwitterButton>
        <RedditButton></RedditButton>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-text>
        <p>{{petition.authorName}}</p>
        <p>{{petition.authorCity}}</p>
        <p>{{petition.authorCountry}}</p>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-text>
        <p>{{petition.signatureCount}}</p>
      </v-card-text>
      <v-card v-for="(signatory, idx) in petitionSignatories" v-bind:key="idx">
        <v-card-text>
          <p>{{signatory.name}}</p>
        </v-card-text>
      </v-card>
    </v-card>
  </v-container>
</template>

<script>
  import {apiPetition} from "../api";
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
        apiPetition.patchPetition(this.$route.params.petitionId, this.petitionTitle, this.petitionDescription,
            this.categoriesDict[this.petitionCategory], this.petitionEndDate);
        this.getPetitionDetails();
      },
      deletePetition() {
        apiPetition.deletePetition(this.$route.params.petitionId);
        router.push('/Home');
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
    }
  }
</script>

<style scoped>

</style>