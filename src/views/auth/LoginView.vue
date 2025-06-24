<script setup>
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useAuthStore } from "@/stores/auth";
// Vuelidate, for more info and examples you can check out https://github.com/vuelidate/vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";
import axios from "axios";
import { useToast } from '@/composables/useToast';


const { showToast } = useToast();
const authStore = useAuthStore();

// Main store and Router
const store = useTemplateStore();
const router = useRouter();

// Input state variables
const state = reactive({
  email: null,
  password: null,
  showPassword: false,
});

// Validation rules
const rules = computed(() => {
  return {
    email: {
      required,
      minLength: minLength(3),
    },
    password: {
      required,
      minLength: minLength(5),
    },
  };
});

// Use vuelidate
const v$ = useVuelidate(rules, state);

// On form submission
async function onSubmit() {
  const result = await v$.value.$validate();

  if (!result) {
    showToast("Le formulaire est invalide", "error");
    // notify user form is invalid
    return;
  }

  try {
    // const response = await axios.post(import.meta.env.VITE_API_URL + "/auth/login/", {
    //   email: state.email,
    //   password: state.password,
    // });
    //
    // const token = response.data.token;
    // // Option 1 : si tu gères toi-même
    // // localStorage.setItem("access", token);
    // // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    //
    // // Option 2 : avec Pinia
    // await useAuthStore.login(token); // stocke le token, appelle fetchUser, etc.

    await authStore.login(state.email, state.password)


    router.push({ name: "dashboard" });
    showToast("Bon retour", "success");
  } catch (error) {
    let message = "Une erreur est survenue.";

    // Vérifie si le backend a renvoyé une réponse avec un message d'erreur
    if (error.response) {
      // Exemple avec Django REST Framework
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.detail) {
        message = error.response.data.detail;
      } else if (error.response.data.error) {
        message = error.response.data.error;
      } else {
        message = "Erreur : " + JSON.stringify(error.response.data);
      }
    } else if (error.message === "Network Error") {
      message = "Impossible de se connecter au serveur. Vérifie le backend.";
    }

    showToast(message, "error");
    console.log(error);
  }
}
</script>

<template>
  <!-- Page Content -->
  <div class="hero-static d-flex align-items-center">
    <div class="content">
      <div class="row justify-content-center push">
        <div class="col-md-8 col-lg-6 col-xl-4">
          <!-- Sign In Block -->
          <BaseBlock title="Sign In" class="mb-0">
            <template #options>
              <RouterLink
                :to="{ name: 'auth-reminder' }"
                class="btn-block-option fs-sm"
                >Forgot Password?</RouterLink
              >
              <RouterLink
                :to="{ name: 'register' }"
                class="btn-block-option"
              >
                <i class="fa fa-user-plus"></i>
              </RouterLink>
            </template>

            <div class="p-sm-3 px-lg-4 px-xxl-5 py-lg-5">
              <h1 class="h2 mb-1">Tiae</h1>
              <p class="fw-medium text-muted">Welcome, please login.</p>

              <!-- Sign In Form -->
              <form @submit.prevent="onSubmit">
                <div class="py-3">
                  <div class="mb-4">
                    <input
                      type="text"
                      class="form-control form-control-alt form-control-lg"
                      id="login-username"
                      name="login-username"
                      placeholder="Username or Email"
                      :class="{
                        'is-invalid': v$.email.$errors.length,
                      }"
                      v-model="state.email"
                      @blur="v$.email.$touch"
                    />
                    <div
                      v-if="v$.email.$errors.length"
                      class="invalid-feedback animated fadeIn"
                    >
                      Please enter your username
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="position-relative">
                      <input
                          :type="state.showPassword ? 'text' : 'password'"
                          class="form-control form-control-alt form-control-lg pe-5"
                          id="login-password"
                          name="login-password"
                          placeholder="Password"
                          :class="{
      'is-invalid': v$.password.$errors.length,
    }"
                          v-model="state.password"
                          @blur="v$.password.$touch"
                      />

                      <!-- Icône à droite dans le champ -->
                      <span
                          class="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                          style="cursor: pointer;"
                          @click="state.showPassword = !state.showPassword"
                      >
    <i :class="state.showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
  </span>

                      <!-- Message d'erreur -->
                      <div
                          v-if="v$.password.$errors.length"
                          class="invalid-feedback animated fadeIn"
                      >
                        Please enter your password
                      </div>
                    </div>

                  </div>
                  <div class="mb-4">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        value=""
                        id="login-remember"
                        name="login-remember"
                      />
                      <label class="form-check-label" for="login-remember"
                        >Remember Me</label
                      >
                    </div>
                  </div>
                </div>
                <div class="row mb-4">
                  <div class="col-md-6 col-xl-5">
                    <button type="submit" class="btn w-100 btn-alt-primary">
                      <i class="fa fa-fw fa-sign-in-alt me-1 opacity-50"></i>
                      Sign In
                    </button>
                  </div>
                </div>
              </form>
              <!-- END Sign In Form -->
            </div>
          </BaseBlock>
          <!-- END Sign In Block -->
        </div>
      </div>
      <div class="fs-sm text-muted text-center">
        <strong>{{ store.app.name + " " + store.app.version }}</strong> &copy;
        {{ store.app.copyright }}
      </div>
    </div>
  </div>
  <!-- END Page Content -->
</template>
