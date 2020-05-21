<template>
  <v-container>
    <v-card>
      <v-card-text>
        <p>{{petition.title}}</p>
        <p>{{petition.description}}</p>
        <p>{{petition.category}}</p>
        <p>{{petition.createdDate}}</p>
        <p>{{petition.closingDate}}</p>
        <FacebookButton url="" :desciption="facebookDescription"></FacebookButton>
        <TwitterButton></TwitterButton>
        <RedditButton></RedditButton>
      </v-card-text>
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
      }
    },
    mounted() {
      this.getPetitionDetails();
    },
    watch: {
      "$route.params": {
        handler() {
          this.getPetitionDetails();
        }
      }
    },
    methods: {
      getPetitionDetails() {
        apiPetition.getDetailedPetition(this.$route.params.petitionId).then(
            response => {
              this.petition = response.data;
            }
        );
        apiPetition.getPetitionSignatures(this.$route.params.petitionId).then(
            response => {
              this.petitionSignatories = response.data;
            }
        );
      }
    }
  }
</script>

<style scoped>

</style>