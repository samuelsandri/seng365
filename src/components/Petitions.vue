<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="petitionsCard">
          <v-row>
            <v-col>
              <h3>Search</h3>
              <v-text-field outlined label="Search" v-model="searchTerm"></v-text-field>
            </v-col>
            <v-col>
              <h3>Filter</h3>
              <v-overflow-btn outlined v-model="chosenCategory" :items="categories" label="Categories"></v-overflow-btn>
            </v-col>
            <v-col>
              <h3>Sort</h3>
              <v-overflow-btn outlined v-model="chosenSortType" :items="sortTypes" label="Sort By"></v-overflow-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-btn color="success" class="petitionsButton" v-on:click="search">Search</v-btn>
            <v-btn color="error" class="petitionsButton" v-on:click="clearSearch">Clear Search</v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="petitionsCard">
          <v-row v-if="petitions.length > 0" no-gutters>
            <v-card class="petitionInfoCard" tile outlined v-for="(petition, idx) in petitions" v-bind:key="idx">
              <v-card-text>
                <a class="petitionLink" v-on:click="goToPetition(petition.petitionId)">{{petition.title}}</a>
                <br>
                <p>Category: {{petition.category}}<br>Author: {{petition.authorName}}</p>
                <v-row class="signatures" justify="end" align="center">
                  <v-icon v-if="signedPetitions.includes(petition.petitionId)" color="primary" v-on:click="toggleSignature(petition.petitionId)">mdi-pen</v-icon>
                  <v-icon v-if="!signedPetitions.includes(petition.petitionId)" v-on:click="toggleSignature(petition.petitionId)">mdi-pen</v-icon>
                  <h2>{{petition.signatureCount}}</h2>
                </v-row>
              </v-card-text>
            </v-card>
          </v-row>
          <v-row v-if="petitions.length === 0">
            <h3 class="profileHeader">No Petitions Found</h3>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-row justify="center" align="center">
            <v-btn class="pageNavButton" color="info" :disabled="pageNumber === 1" v-on:click="firstPage">First</v-btn>
            <v-btn class="pageNavButton" color="info" :disabled="pageNumber === 1" v-on:click="prevPage">Prev</v-btn>
            <h3 class="pageNavHeader">{{(((pageNumber - 1) * pageAmountShown) + 1) + "-" + (pageNumber) * pageAmountShown}}</h3>
            <v-btn class="pageNavButton" color="info" :disabled="this.petitions.length < 10" v-on:click="nextPage">Next</v-btn>
            <v-btn class="pageNavButton" color="info" :disabled="this.petitions.length < 10" v-on:click="lastPage">Last</v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import {apiPetition} from "../api";
  import router from "../router";
  import {mapGetters} from "vuex";

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
        signedPetitions: [],
      }
    },
    mounted() {
      this.getFilteredPetitions();
      this.getPetitionCategories();
      this.updateSignedPetitions();
    },
    watch: {
      "$route.params": {
        handler() {
          this.getFilteredPetitions();
          this.getPetitionCategories();
          this.updateSignedPetitions();
        }
      }
    },
    computed: {
      ...mapGetters(["user"]),
    },
    methods: {
      search() {
        this.pageNumber = 1;
        this.getFilteredPetitions();
      },
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
              this.updateSignedPetitions();
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
      updateSignedPetitions() {
        this.signedPetitions = [];
        for (let petition of this.petitions) {
          apiPetition.getPetitionSignatures(petition.petitionId).then(
              response => {
                let signatoryIds = [];
                for (let signatory of response.data) {
                  signatoryIds.push(signatory.signatoryId)
                }
                if (signatoryIds.includes(this.user.userId)) {
                  this.signedPetitions.push(petition.petitionId);
                }
              }
          );
        }
      },
      toggleSignature(petitionId) {
        apiPetition.getPetitionSignatures(petitionId).then(
            response => {
              let signatoryIds = [];
              for (let signatory of response.data) {
                signatoryIds.push(signatory.signatoryId)
              }
              if (signatoryIds.includes(this.user.userId)) {
                apiPetition.deletePetitionSignature(petitionId).then(
                    () => {
                      this.getFilteredPetitions();
                    }
                );
              } else {
                apiPetition.addPetitionSignature(petitionId).then(
                    () => {
                      this.getFilteredPetitions();
                    }
                );
              }
            }
        );
      },
    }
  }
</script>

<style scoped>

</style>