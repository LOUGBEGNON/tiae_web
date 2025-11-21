<script setup>
import {reactive, computed, ref, watch} from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import axios from "axios";
import { useToast } from '@/composables/useToast';


// Vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength, email, sameAs } from "@vuelidate/validators";

// Validateur personnalisé pour le genre
const genderValidator = (value) => {
  return value === "M" || value === "F" || value === "O";
};
genderValidator.$message = "Veuillez sélectionner un genre valide.";

// Main store and Router
const store = useTemplateStore();
const router = useRouter();
const { showToast } = useToast();

// Input state variables
const state = reactive({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false, // ✅ boolean, pas null
  gender: "",   // ✅ string vide, pas null
  showPassword: false,
  showConfirmPassword: false,
});

watch(
    () => [state.password, state.confirmPassword],
    () => {
      // console.log("password =", state.password);
      // console.log("confirmPassword =", state.confirmPassword);
      // console.log("sameAs result =", state.password === state.confirmPassword);
    },
    () => v$.value.confirmPassword.sameAsPassword.$invalid,
    (val) => {
      // console.log("sameAsPassword invalid =", val);
    }
);


// Étape actuelle
const currentStep = ref(1);

// Validation rules
const rules = {
  firstName: { required, minLength: minLength(2) },
  lastName: { required, minLength: minLength(2) },
  username: { required, minLength: minLength(3) },
  email: { required, email },
  password: { required, minLength: minLength(5) },
  confirmPassword: {
    required,
    sameAsPassword: sameAs(computed(() => state.password))
  },
  terms: { required },
  gender: { required, genderValidator }
};



// Use vuelidate
const v$ = useVuelidate(rules, state);

// Fonction pour passer à l'étape suivante
import { nextTick } from 'vue';

const goToNextStep = async () => {
  const $v = v$.value ?? v$; // compatible ref ou proxy
  let fieldsToValidate = [];
  if (currentStep.value === 1) {
    fieldsToValidate = ["firstName", "lastName", "gender", "email"];
  } else if (currentStep.value === 2) {
    fieldsToValidate = ["username", "password", "confirmPassword"];
  }

  // Toucher les champs ciblés
  fieldsToValidate.forEach(field => {
    if ($v[field] && typeof $v[field].$touch === "function") {
      $v[field].$touch();
    }
  });

  // attendre que le DOM / reactivité se mette à jour
  await nextTick();

  // debug (supprime quand ok)
  console.log("Validation check for step", currentStep.value);
  fieldsToValidate.forEach(f => {
    if ($v[f]) {
      console.log(f, { $dirty: $v[f].$dirty, $invalid: $v[f].$invalid, $errors: $v[f].$errors });
    } else {
      console.log(f, "not defined on $v");
    }
  });

  const isStepValid = fieldsToValidate.every(field => $v[field] && !$v[field].$invalid);

  if (isStepValid) {
    currentStep.value++;
  } else {
    showToast && showToast("Veuillez remplir tous les champs correctement.", "error");
  }
};


const message = ref("");
const messageType = ref(""); // 'success' ou 'error'
const submittedEmail = ref("");

const clearMessages = () => {
  message.value = "";
  messageType.value = "";
};

// On form submission (seulement à l'étape 3)
async function onSubmit() {
  clearMessages();

  // Valider TOUT le formulaire
  const isValid = await v$.value.$validate(); // ✅ pas de .value

  if (!isValid) {
    showToast("Veuillez remplir tous les champs correctement.", "error");
    return;
  }

  const payload = {
    first_name: state.firstName,
    last_name: state.lastName,
    username: state.username,
    email: state.email,
    password: state.password,
    password1: state.confirmPassword,
    sexe: state.gender,
  };

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register/`, payload);

    message.value = response.data.message || "Un email de réinitialisation a été envoyé avec succès.";
    messageType.value = "success";
    submittedEmail.value = state.email;

  } catch (error) {
    console.error("Erreur d’inscription :", error);
    let messageText = "Une erreur est survenue.";

    // Gestion des erreurs spécifiques
    if (error.response) {
      // Erreur avec réponse du serveur
      if (error.response.data.email) {
        messageText = error.response.data.email[0];
      } else if (error.response.data.detail) {
        messageText = error.response.data.detail;
      } else if (error.response.data.message) {
        messageText = error.response.data.message;
      } else if (error.response.status === 404) {
        messageText = "Erreur d’inscription.";
      }
    } else if (error.request) {
      // Erreur de réseau
      messageText = "Erreur de connexion. Veuillez vérifier votre connexion internet.";
    }

    // Afficher le message d'erreur sur la page
    message.value = messageText;
    messageType.value = "error";
  }
}
</script>

<template>
  <!-- Page Content -->
  <div class="bg-primary-dark">
    <div class="row g-0 bg-primary-dark-op">
      <!-- Meta Info Section -->
      <div class="hero-static col-lg-4 d-none d-lg-flex flex-column justify-content-center">
        <div class="p-4 p-xl-5 flex-grow-1 d-flex align-items-center">
          <div class="w-100">
            <RouterLink :to="{ name: 'landing' }" class="link-fx fw-semibold fs-2 text-white">
              Tiae<span class="fw-normal"></span>
            </RouterLink>
            <p class="text-white-75 me-xl-8 mt-2">
              Creating a new account is completely free. Get started with 5 projects to manage and feel free to upgrade as your business grow.
            </p>
          </div>
        </div>
        <div class="p-4 p-xl-5 d-xl-flex justify-content-between align-items-center fs-sm">
          <p class="fw-medium text-white-50 mb-0">
            <strong>{{ store.app.name + " " + store.app.version }}</strong>
            &copy; {{ store.app.copyright }}
          </p>
          <ul class="list list-inline mb-0 py-2">
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)">Legal</a>
            </li>
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)">Contact</a>
            </li>
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)">Terms</a>
            </li>
          </ul>
        </div>
      </div>
      <!-- END Meta Info Section -->

      <!-- Main Section -->
      <div class="hero-static col-lg-8 d-flex flex-column align-items-center bg-body-extra-light">
        <div class="p-3 w-100 d-lg-none text-center">
          <RouterLink :to="{ name: 'landing' }" class="link-fx fw-semibold fs-3 text-dark">
            Tiae<span class="fw-normal"></span>
          </RouterLink>
        </div>
        <div class="p-4 w-100 flex-grow-1 d-flex align-items-center">
          <div class="w-100">
            <!-- Header -->
            <div class="text-center mb-5">
              <p class="mb-3">
                <i class="fa fa-2x fa-circle-notch text-primary-light"></i>
              </p>
              <h1 class="fw-bold mb-2">Création de compte</h1>
              <p class="fw-medium text-muted">Get your access today in one easy step</p>
            </div>
            <!-- END Header -->

            <!-- Messages d'alerte -->
            <div v-if="message" class="row g-0 justify-content-center mb-4">
              <div class="col-sm-8 col-xl-4">
                <div
                    class="alert text-center py-3"
                    :class="{
                    'alert-success': messageType === 'success',
                    'alert-danger': messageType === 'error'
                  }"
                >
                  <template v-if="messageType === 'success' && submittedEmail">
                    <i class="fa fa-check-circle me-2"></i>
                    {{ message }}
                    <br><strong>{{ submittedEmail }}</strong>
                  </template>
                  <template v-else>
                    <i class="fa fa-exclamation-circle me-2"></i>
                    {{ message }}
                  </template>
                </div>
              </div>
            </div>
            <!-- END Messages d'alerte -->

            <!-- Progress bar dynamique -->
            <div class="row g-0 justify-content-center mb-4">
              <div class="col-sm-8 col-xl-4">
                <div class="progress mb-2" style="height: 10px">
                  <div
                      class="progress-bar"
                      :style="{ width: `${(currentStep / 3) * 100}%` }"
                  ></div>
                </div>
                <div class="text-center fs-sm text-muted mb-3">
                  Étape {{ currentStep }} sur 3
                </div>
              </div>
            </div>

            <!-- Formulaire multistep -->
            <div class="row g-0 justify-content-center">
              <div class="col-sm-8 col-xl-4">
                <!-- Plus de @submit.prevent ici -->
                <form>
                  <!-- ÉTAPE 1 : Infos personnelles -->
                  <div v-if="currentStep === 1">
                    <div class="mb-4">
                      <input
                          v-model="state.firstName"
                          name="first_name"
                          type="text"
                          class="form-control form-control-lg form-control-alt py-3"
                          placeholder="Prénom"
                          :class="{ 'is-invalid': v$.firstName.$errors.length }"
                          @blur="v$.firstName.$touch"
                      />
                      <div v-if="v$.firstName.$errors.length" class="invalid-feedback animated fadeIn">
                        Le prénom doit contenir au moins 2 caractères.
                      </div>
                    </div>

                    <div class="mb-4">
                      <input
                          v-model="state.lastName"
                          type="text"
                          name="last_name"
                          class="form-control form-control-lg form-control-alt py-3"
                          placeholder="Nom"
                          :class="{ 'is-invalid': v$.lastName.$errors.length }"
                          @blur="v$.lastName.$touch"
                      />
                      <div v-if="v$.lastName.$errors.length" class="invalid-feedback animated fadeIn">
                        Le nom doit contenir au moins 2 caractères.
                      </div>
                    </div>

                    <div class="mb-4">
                      <input
                          v-model="state.email"
                          type="email"
                          class="form-control form-control-lg form-control-alt py-3"
                          placeholder="Email"
                          :class="{ 'is-invalid': v$.email.$errors.length }"
                          @blur="v$.email.$touch"
                          name="email"
                      />
                      <div v-if="v$.email.$errors.length" class="invalid-feedback animated fadeIn">
                        Veuillez entrer une adresse email valide.
                      </div>
                    </div>

                    <div class="mb-4">
                      <select
                          v-model="state.gender"
                          class="form-select form-select-lg form-select-alt py-3"
                          :class="{ 'is-invalid': v$.gender.$errors.length }"
                          @blur="v$.gender.$touch"
                      >
                        <option value="" disabled>Sélectionnez votre genre</option>
                        <option value="M">Homme</option>
                        <option value="F">Femme</option>
                        <option value="O">Autre</option>
                      </select>
                      <div v-if="v$.gender.$errors.length" class="invalid-feedback animated fadeIn">
                        Veuillez sélectionner votre genre.
                      </div>
                    </div>
                  </div>

                  <!-- ÉTAPE 2 : Compte -->
                  <div v-if="currentStep === 2">
                    <div class="mb-4">
                      <input
                          v-model="state.username"
                          type="text"
                          class="form-control form-control-lg form-control-alt py-3"
                          placeholder="Nom d'utilisateur"
                          :class="{ 'is-invalid': v$.username.$errors.length }"
                          @blur="v$.username.$touch"
                          name="username"
                      />
                      <div v-if="v$.username.$errors.length" class="invalid-feedback animated fadeIn">
                        Veuillez entrer un nom d'utilisateur (min. 3 caractères).
                      </div>
                    </div>

                    <div class="mb-4 position-relative">
                      <input
                          v-model="state.password"
                          :type="state.showPassword ? 'text' : 'password'"
                          class="form-control form-control-lg form-control-alt py-3"
                          placeholder="Mot de passe"
                          :class="{ 'is-invalid': v$.password.$errors.length }"
                          @blur="v$.password.$touch"
                          name="password"
                      />

                      <!-- Icône à droite dans le champ -->
                      <span
                          class="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                          style="cursor: pointer;"
                          @click="state.showPassword = !state.showPassword"
                      >
    <i :class="state.showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
  </span>

                      <div v-if="v$.password.$errors.length" class="invalid-feedback animated fadeIn">
                        Le mot de passe doit contenir au moins 5 caractères.
                      </div>
                    </div>

                    <div class="mb-4 position-relative">
                      <input
                          v-model="state.confirmPassword"
                          :type="state.showConfirmPassword ? 'text' : 'password'"
                          class="form-control form-control-lg form-control-alt py-3"
                          placeholder="Confirmer le mot de passe"
                          :class="{ 'is-invalid': v$.confirmPassword.$errors.length }"
                          @blur="v$.confirmPassword.$touch"
                          name="confirm_password"
                      />

                      <!-- Icône à droite dans le champ -->
                      <span
                          class="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                          style="cursor: pointer;"
                          @click="state.showConfirmPassword = !state.showConfirmPassword"
                      >
    <i :class="state.showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
  </span>

                      <div v-if="v$.confirmPassword.sameAsPassword.$invalid && v$.confirmPassword.$dirty" class="invalid-feedback animated fadeIn">
                        Les mots de passe ne correspondent pas.
                      </div>
                    </div>
                  </div>

                  <!-- ÉTAPE 3 : Conditions & confirmation -->
                  <div v-if="currentStep === 3">
                    <div class="mb-4">
                      <div class="form-check">
                        <input
                            v-model="state.terms"
                            class="form-check-input"
                            type="checkbox"
                            id="signup-terms"
                            :class="{ 'is-invalid': v$.terms.$errors.length }"
                            @blur="v$.terms.$touch"
                        />
                        <label class="form-check-label" for="signup-terms">
                          J'accepte les <a href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#one-signup-terms">Conditions d'utilisation</a>
                        </label>
                        <div v-if="v$.terms.$errors.length" class="invalid-feedback d-block animated fadeIn">
                          Vous devez accepter les conditions.
                        </div>
                      </div>
                    </div>

                    <!-- Résumé -->
                    <div class="alert alert-info">
                      <strong>Récapitulatif :</strong><br />
                      {{ state.firstName }} {{ state.lastName }} ({{ state.gender === 'M' ? 'Homme' : state.gender === 'F' ? 'Femme' : 'Autre' }})<br />
                      {{ state.email }}<br />
                      Nom d'utilisateur : {{ state.username }}
                    </div>
                  </div>

                  <!-- Boutons de navigation -->
                  <div class="d-flex justify-content-between mt-4">
                    <button
                        v-if="currentStep > 1"
                        type="button"
                        class="btn btn-lg btn-alt-secondary"
                        @click="currentStep--"
                    >
                      ← Précédent
                    </button>

                    <div v-else></div>

                    <button
                        v-if="currentStep < 3"
                        type="button"
                        class="btn btn-lg btn-primary"
                        @click="goToNextStep"
                    >
                      Suivant →
                    </button>

                    <button
                        v-else
                        type="button"
                        class="btn btn-lg btn-success"
                        @click="onSubmit"
                    >
                      <i class="fa fa-check me-1"></i> Créer mon compte
                    </button>
                  </div>
                </form>

                <!-- Lien de connexion -->
                <div class="text-center mt-4">
                  Déjà inscrit(e) ?
                  <RouterLink :to="{ name: 'login' }" v-click-ripple>
                    Se connecter
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="px-4 py-3 w-100 d-lg-none d-flex flex-column flex-sm-row justify-content-between fs-sm text-center text-sm-start">
          <p class="fw-medium text-black-50 py-2 mb-0">
            <strong>{{ store.app.name + " " + store.app.version }}</strong>
            &copy; {{ store.app.copyright }}
          </p>
          <ul class="list list-inline py-2 mb-0">
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)">Legal</a>
            </li>
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)">Contact</a>
            </li>
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)">Terms</a>
            </li>
          </ul>
        </div>
      </div>
      <!-- END Main Section -->
    </div>

    <!-- Terms Modal -->
    <div
        class="modal fade"
        id="one-signup-terms"
        tabindex="-1"
        role="dialog"
        aria-labelledby="one-signup-terms"
        aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-popout" role="document">
        <div class="modal-content">
          <BaseBlock title="Terms &amp; Conditions" transparent class="mb-0">
            <template #options>
              <button
                  type="button"
                  class="btn-block-option"
                  data-bs-dismiss="modal"
                  aria-label="Close"
              >
                <i class="fa fa-fw fa-times"></i>
              </button>
            </template>
            <template #content>
              <div class="block-content">
                <p>
                  Dolor posuere proin blandit accumsan senectus netus nullam
                  curae, ornare laoreet adipiscing luctus mauris adipiscing
                  pretium eget fermentum, tristique lobortis est ut metus
                  lobortis tortor tincidunt himenaeos habitant quis dictumst
                  proin odio sagittis purus mi, nec taciti vestibulum quis in
                  sit varius lorem sit metus mi.
                </p>
              </div>
              <div class="block-content block-content-full text-end bg-body">
                <button type="button" class="btn btn-sm btn-alt-secondary me-1" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="button" class="btn btn-sm btn-primary" data-bs-dismiss="modal">
                  I Agree
                </button>
              </div>
            </template>
          </BaseBlock>
        </div>
      </div>
    </div>
    <!-- END Terms Modal -->
  </div>
  <!-- END Page Content -->
</template>