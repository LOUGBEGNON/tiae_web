<script setup>
import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import axios from "axios";

// Vuelidate, for more info and examples you can check out https://github.com/vuelidate/vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";
import { useToast } from '@/composables/useToast';

// Main store and Router
const store = useTemplateStore();
const router = useRouter();
const { showToast } = useToast();

// Input state variables
const state = reactive({
  email: null,
});

// Messages d'état
const message = ref("");
const messageType = ref(""); // 'success' ou 'error'
const submittedEmail = ref("");

// Validation rules
const rules = computed(() => {
  return {
    email: {
      required,
      minLength: minLength(3),
    },
  };
});

// Use vuelidate
const v$ = useVuelidate(rules, state);

// Fonction pour effacer les messages
const clearMessages = () => {
  message.value = "";
  messageType.value = "";
};

// On form submission
async function onSubmit() {
  // Effacer les messages précédents
  clearMessages();

  const result = await v$.value.$validate();

  if (!result) {
    // notify user form is invalid
    showToast("Le formulaire est invalide", "error");
    return;
  }

  try {
    const response = await axios.post(import.meta.env.VITE_API_URL + "/auth/password-reset/", {
      email: state.email,
    });

    console.log(response.data);

    // Afficher le message de succès sur la page
    message.value = response.data.message || "Un email de réinitialisation a été envoyé avec succès.";
    messageType.value = "success";
    submittedEmail.value = state.email;

    // Réinitialiser le formulaire
    state.email = "";
    v$.value.$reset();

  } catch (error) {
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
        messageText = "Aucun compte trouvé avec cet email.";
      }
    } else if (error.request) {
      // Erreur de réseau
      messageText = "Erreur de connexion. Veuillez vérifier votre connexion internet.";
    }

    // Afficher le message d'erreur sur la page
    message.value = messageText;
    messageType.value = "error";

    console.log(error);
  }
}
</script>

<template>
  <!-- Page Content -->
  <div class="bg-primary">
    <div class="row g-0 bg-primary-dark-op">
      <!-- Meta Info Section -->
      <div
          class="hero-static col-lg-4 d-none d-lg-flex flex-column justify-content-center"
      >
        <div class="p-4 p-xl-5 flex-grow-1 d-flex align-items-center">
          <div class="w-100">
            <RouterLink
                :to="{ name: 'home' }"
                class="link-fx fw-semibold fs-2 text-white"
            >
              Tiae
            </RouterLink>
            <p class="text-white-75 me-xl-8 mt-2">
              Don't worry, we've got your back. You'll be soon back to your
              favorite dashboard!
            </p>
          </div>
        </div>
        <div
            class="p-4 p-xl-5 d-xl-flex justify-content-between align-items-center fs-sm"
        >
          <p class="fw-medium text-white-50 mb-0">
            <strong>{{ store.app.name + " " + store.app.version }}</strong>
            &copy; {{ store.app.copyright }}
          </p>
          <ul class="list list-inline mb-0 py-2">
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)"
              >Legal</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)"
              >Contact</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-white-75 fw-medium" href="javascript:void(0)"
              >Terms</a
              >
            </li>
          </ul>
        </div>
      </div>
      <!-- END Meta Info Section -->

      <!-- Main Section -->
      <div
          class="hero-static col-lg-8 d-flex flex-column align-items-center bg-body-extra-light"
      >
        <div class="p-3 w-100 d-lg-none text-center">
          <RouterLink
              :to="{ name: 'landing' }"
              class="link-fx fw-semibold fs-3 text-dark"
          >
            One<span class="fw-normal">UI</span>
          </RouterLink>
        </div>
        <div class="p-4 w-100 flex-grow-1 d-flex align-items-center">
          <div class="w-100">
            <!-- Header -->
            <div class="text-center mb-5">
              <p class="mb-3">
                <i class="fa fa-2x fa-circle-notch text-primary-light"></i>
              </p>
              <h1 class="fw-bold mb-2">Password Reset</h1>
              <p class="fw-medium text-muted">
                Please provide your account's email or username and we will send
                you your password.
              </p>
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

            <!-- Reminder Form -->
            <div class="row g-0 justify-content-center">
              <div class="col-sm-8 col-xl-4">
                <form @submit.prevent="onSubmit">
                  <div class="mb-4">
                    <input
                        type="text"
                        class="form-control form-control-lg form-control-alt py-3"
                        id="reminder-credential"
                        name="reminder-credential"
                        placeholder="Username or Email"
                        :class="{
                        'is-invalid': v$.email.$errors.length,
                      }"
                        v-model="state.email"
                        @blur="v$.email.$touch"
                        @input="clearMessages"
                    />
                    <div
                        v-if="v$.email.$errors.length"
                        class="invalid-feedback animated fadeIn"
                    >
                      Please enter a valid credential
                    </div>
                  </div>
                  <div class="text-center">
                    <button type="submit" class="btn btn-lg btn-alt-primary">
                      <i class="fa fa-fw fa-envelope me-1 opacity-50"></i> Send
                      Mail
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <!-- END Reminder Form -->
          </div>
        </div>
        <div
            class="px-4 py-3 w-100 d-lg-none d-flex flex-column flex-sm-row justify-content-between fs-sm text-center text-sm-start"
        >
          <p class="fw-medium text-black-50 py-2 mb-0">
            <strong>{{ store.app.name + " " + store.app.version }}</strong>
            &copy; {{ store.app.copyright }}
          </p>
          <ul class="list list-inline py-2 mb-0">
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)"
              >Legal</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)"
              >Contact</a
              >
            </li>
            <li class="list-inline-item">
              <a class="text-muted fw-medium" href="javascript:void(0)"
              >Terms</a
              >
            </li>
          </ul>
        </div>
      </div>
      <!-- END Main Section -->
    </div>
  </div>
  <!-- END Page Content -->
</template>