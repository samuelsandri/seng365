<template>
  <v-container>
    <v-row>
      <v-form>
        <v-row>
          <v-col>
            <h3>Search</h3>
            <v-text-field label="Search" v-model="searchTerm"></v-text-field>
          </v-col>
          <v-col>
            <h3>Filter</h3>
            <v-combobox v-model="chosenCategory" :items="categories" label="Categories"></v-combobox>
          </v-col>
          <v-col>
            <h3>Sort</h3>
            <v-combobox v-model="chosenSortType" :items="sortTypes" label="Sort By"></v-combobox>
          </v-col>
        </v-row>
        <v-row>
          <v-btn v-on:click="getFilteredPetitions">Search</v-btn>
          <v-btn v-on:click="clearSearch">Clear</v-btn>
        </v-row>
      </v-form>
    </v-row>
    <v-row>
      <v-divider></v-divider>
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
    <v-row>
      <v-btn :disabled="pageNumber === 1" v-on:click="firstPage">First</v-btn>
      <v-btn :disabled="pageNumber === 1" v-on:click="prevPage">Prev</v-btn>
      <p>{{(((pageNumber - 1) * pageAmountShown) + 1) + "-" + (pageNumber) * pageAmountShown}}</p>
      <v-btn :disabled="this.petitions.length < 10" v-on:click="nextPage">Next</v-btn>
      <v-btn :disabled="this.petitions.length < 10" v-on:click="lastPage">Last</v-btn>
    </v-row>
  </v-container>
</template>

<script>
  import {apiPetition} from "../api";
  import router from "../router";

  export default {
    name: "Petitions",
    data() {
      return {
        petitions: [],
        searchTerm: null,
        sortTypes: [
            "Alphabetically by title, A-Z",
            "Alphabetically by title, Z-A",
            "Number of signatures, most to least",
            "Number of signatures, least to most"
        ],
        categories: [],
        categoriesDict: {},
        chosenCategory: null,
        chosenSortType: "Number of signatures, most to least",
        pageNumber: 1,
        pageAmountShown: 10,
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
    methods: {
      getFilteredPetitions() {
        let first = true;
        let queryString = "";
        if (!this.isEmptyOrSpaces(this.searchTerm)) {
          first = false;
          queryString += "q=" + this.searchTerm;
        }
        if (!this.isEmptyOrSpaces(this.chosenCategory)) {
          if (first) {
            first = false;
          } else {
            queryString += "&"
          }
          queryString += "categoryId=" + this.categoriesDict[this.chosenCategory];
        }
        if (this.chosenSortType === "Alphabetically by title, A-Z") {
          if (first) {
            first = false;
          } else {
            queryString += "&"
          }
          queryString += "sortBy=ALPHABETICAL_ASC";
        } else if (this.chosenSortType === "Alphabetically by title, Z-A") {
          if (first) {
            first = false;
          } else {
            queryString += "&"
          }
          queryString += "sortBy=ALPHABETICAL_DESC";
        } else if (this.chosenSortType === "Number of signatures, least to most") {
          if (first) {
            first = false;
          } else {
            queryString += "&"
          }
          queryString += "sortBy=SIGNATURES_ASC"
        }
        if (first) {
          first = false;
        } else {
          queryString += "&"
        }
        queryString += "startIndex=" + ((this.pageNumber - 1) * this.pageAmountShown) + "&count=" + this.pageAmountShown;
        apiPetition.getPetitionsFiltered(queryString).then(
            response => {
              this.petitions = response.data;
            });
      },
      isEmptyOrSpaces(str){
        return str === null || str.match(/^ *$/) !== null;
      },
      clearSearch() {
        this.searchTerm = null;
        this.chosenCategory = null;
        this.chosenSortType = "Number of signatures, most to least";
        this.getFilteredPetitions();
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
      nextPage() {
        if (this.petitions.length === 10) {
          this.pageNumber += 1;
          this.getFilteredPetitions();
        }
      },
      prevPage() {
        if (this.pageNumber !== 1) {
          this.pageNumber -= 1;
        }
        this.getFilteredPetitions();
      },
      firstPage()  {
        this.pageNumber = 1;
        this.getFilteredPetitions();
      },
      lastPage() {
      },
      goToPetition(petitionId) {
        router.push('/petitions/' + petitionId);
      },
    }
  }
</script>

<style scoped>

</style>