<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Profile Details</v-card-title>
          <v-card-text>
            <p>Profile</p>
            <p>{{user.userId}}</p>
            <p>{{user.name}}</p>
            <p>{{user.email}}</p>
            <p>{{user.city}}, {{user.country}}</p>
          </v-card-text>
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
            <v-icon>mdi-thumb-up</v-icon>
            <h2>{{petition.signatureCount}}</h2>
          </v-row>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
  import {mapGetters} from "vuex";
  import {apiPetition} from "../api";
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
    }
  }
</script>

<style scoped>

</style>