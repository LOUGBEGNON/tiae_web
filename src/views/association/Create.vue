<!--<script setup>-->
<!--import { reactive, computed } from "vue";-->

<!--// Vuelidate, for more info and examples you can check out https://github.com/vuelidate/vuelidate-->
<!--import useVuelidate from "@vuelidate/core";-->
<!--import {-->
<!--  required,-->
<!--  minLength,-->
<!--  between,-->
<!--  email,-->
<!--  decimal,-->
<!--  integer,-->
<!--  url,-->
<!--  sameAs,-->
<!--} from "@vuelidate/validators";-->

<!--// Example options for select-->
<!--const options = reactive([-->
<!--  { value: null, text: "Please select" },-->
<!--  { value: "html", text: "HTML" },-->
<!--  { value: "css", text: "CSS" },-->
<!--  { value: "javascript", text: "JavaScript" },-->
<!--  { value: "angular", text: "Angular" },-->
<!--  { value: "react", text: "React" },-->
<!--  { value: "vuejs", text: "Vue.js" },-->
<!--  { value: "ruby", text: "Ruby" },-->
<!--  { value: "php", text: "PHP" },-->
<!--  { value: "asp", text: "ASP.NET" },-->
<!--  { value: "python", text: "Python" },-->
<!--  { value: "mysql", text: "MySQL" },-->
<!--]);-->

<!--// Input state variables-->
<!--const state = reactive({-->
<!--  name: null,-->
<!--  description: null,-->
<!--  address: null,-->
<!--});-->

<!--// Validation rules-->
<!--const rules = computed(() => {-->
<!--  return {-->
<!--    name: {-->
<!--      required,-->
<!--      minLength: minLength(3),-->
<!--    },-->
<!--    description: {-->
<!--      required,-->
<!--      minLength: minLength(5),-->
<!--    },-->
<!--    address: {-->
<!--      required,-->
<!--      minLength: minLength(5),-->
<!--    },-->
<!--  };-->
<!--});-->

<!--// Use vuelidate-->
<!--const v$ = useVuelidate(rules, state);-->

<!--// On form submission-->
<!--async function onSubmit() {-->
<!--  const result = await v$.value.$validate();-->

<!--  if (!result) {-->
<!--    // notify user form is invalid-->
<!--    return;-->
<!--  }-->

<!--  // perform async actions-->
<!--}-->
<!--</script>-->

<!--<template>-->
<!--  &lt;!&ndash; Hero &ndash;&gt;-->
<!--  <BasePageHeading-->
<!--    title="Création"-->
<!--    subtitle="Créez votre association."-->
<!--  >-->
<!--    <template #extra>-->
<!--      <nav aria-label="breadcrumb">-->
<!--        <ol class="breadcrumb breadcrumb-alt">-->
<!--          <li class="breadcrumb-item">-->
<!--            <a class="link-fx" href="javascript:void(0)">Association</a>-->
<!--          </li>-->
<!--          <li class="breadcrumb-item" aria-current="page">Création</li>-->
<!--        </ol>-->
<!--      </nav>-->
<!--    </template>-->
<!--  </BasePageHeading>-->
<!--  &lt;!&ndash; END Hero &ndash;&gt;-->

<!--  <div class="content">-->
<!--  &lt;!&ndash; Billing Information &ndash;&gt;-->
<!--  <BaseBlock title="" content-full>-->
<!--    <form @submit.prevent="onSubmit">-->
<!--      <div class="row push">-->
<!--        <div class="col-lg-4">-->
<!--          <p class="fs-sm text-muted">-->
<!--            Your billing information is never shown to other users and only-->
<!--            used for creating your invoices.-->
<!--          </p>-->
<!--        </div>-->
<!--        <div class="col-lg-8 col-xl-5">-->
<!--          <div class="mb-4">-->
<!--            <label class="form-label" for="one-profile-edit-company-name"-->
<!--            >Nom <span class="text-danger">*</span></label-->
<!--            >-->
<!--            <input-->
<!--                type="text"-->
<!--                class="form-control"-->
<!--                :class="{-->
<!--                  'is-invalid': v$.name.$errors.length,-->
<!--                }"-->
<!--                v-model="state.name"-->
<!--                @blur="v$.name.$touch"-->
<!--                placeholder="Enter a name.."-->
<!--                id="name"-->
<!--                name="name"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="mb-4">-->
<!--            <label class="form-label" for="val-suggestions"-->
<!--            >Description <span class="text-danger">*</span></label-->
<!--            >-->
<!--            <textarea-->
<!--                id="description"-->
<!--                class="form-control"-->
<!--                :class="{-->
<!--                  'is-invalid': v$.description.$errors.length,-->
<!--                }"-->
<!--                rows="5"-->
<!--                v-model="state.description"-->
<!--                @blur="v$.description.$touch"-->
<!--                placeholder="What would you like to see?"-->
<!--            ></textarea>-->
<!--            <div-->
<!--                v-if="v$.description.$errors.length"-->
<!--                class="invalid-feedback animated fadeIn"-->
<!--            >-->
<!--              What can we do to become better?-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="mb-4">-->
<!--            <label class="form-label" for="one-profile-edit-street-1"-->
<!--            >Adresse <span class="text-danger">*</span></label-->
<!--            >-->
<!--            <input-->
<!--                type="text"-->
<!--                class="form-control"-->
<!--                id="address"-->
<!--                name="address"-->
<!--                :class="{-->
<!--                  'is-invalid': v$.address.$errors.length,-->
<!--                }"-->
<!--                v-model="state.address"-->
<!--                @blur="v$.address.$touch"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="mb-4">-->
<!--            <button type="submit" class="btn btn-alt-primary">Soumettre</button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </form>-->
<!--  </BaseBlock>-->
<!--  &lt;!&ndash; END Billing Information &ndash;&gt;-->
<!--    </div>-->

<!--</template>-->


<script setup>
import { reactive, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth"; // ← adapte selon ton chemin

// Vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

// Input state variables
const state = reactive({
  name: null,
  description: null,
  address: null,
});

// Validation rules
const rules = computed(() => ({
  name: {
    required,
    minLength: minLength(3),
  },
  description: {
    required,
    minLength: minLength(5),
  },
  address: {
    required,
    minLength: minLength(5),
  },
}));

// Use vuelidate
const v$ = useVuelidate(rules, state);

// On form submission
async function onSubmit() {
  const result = await v$.value.$validate();

  if (!result) {
    // Vuelidate a échoué (champs non valides)
    return;
  }

  // Récupérer le token de l'utilisateur connecté
  const authStore = useAuthStore();
  const token = authStore.token; // ou localStorage.getItem('token')

  if (!token) {
    console.error("Utilisateur non authentifié");
    alert("Vous devez être connecté pour créer une association.");
    return;
  }

  const payload = {
    name: state.name,
    description: state.description,
    address: state.address,
  };

  try {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/associations/create/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );

    console.log("Association créée avec succès :", response.data);
    // Optionnel : réinitialiser le formulaire
    // state.name = state.description = state.address = null;
    // v$.value.$reset();

    // Exemple : afficher un message ou rediriger
    alert("Association créée avec succès !");
  } catch (error) {
    console.error("Erreur API :", error);

    let message = "Une erreur est survenue lors de la création.";
    if (error.response?.data) {
      const data = error.response.data;
      // Support des erreurs structurées (ex: DRF)
      if (data.name) message = data.name[0];
      else if (data.description) message = data.description[0];
      else if (data.address) message = data.address[0];
      else if (data.detail) message = data.detail;
      else if (data.message) message = data.message;
      else message = JSON.stringify(data);
    } else if (error.request) {
      message = "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }

    alert(message);
  }
}
</script>

<template>
  <!-- Hero -->
  <BasePageHeading
      title="Création"
      subtitle="Créez votre association."
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Association</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Création</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <div class="content">
    <!-- Billing Information -->
    <BaseBlock title="" content-full>
      <form @submit.prevent="onSubmit">
        <div class="row push">
          <div class="col-lg-4">
            <p class="fs-sm text-muted">
              Your billing information is never shown to other users and only
              used for creating your invoices.
            </p>
          </div>
          <div class="col-lg-8 col-xl-5">
            <div class="mb-4">
              <label class="form-label" for="name">
                Nom <span class="text-danger">*</span>
              </label>
              <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.name.$errors.length }"
                  v-model="state.name"
                  @blur="v$.name.$touch"
                  placeholder="Enter a name.."
                  id="name"
                  name="name"
              />
              <div v-if="v$.name.$errors.length" class="invalid-feedback animated fadeIn">
                Veuillez entrer un nom d’au moins 3 caractères.
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label" for="description">
                Description <span class="text-danger">*</span>
              </label>
              <textarea
                  id="description"
                  class="form-control"
                  :class="{ 'is-invalid': v$.description.$errors.length }"
                  rows="5"
                  v-model="state.description"
                  @blur="v$.description.$touch"
                  placeholder="Décrivez votre association..."
              ></textarea>
              <div
                  v-if="v$.description.$errors.length"
                  class="invalid-feedback animated fadeIn"
              >
                Veuillez entrer une description d’au moins 5 caractères.
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label" for="address">
                Adresse <span class="text-danger">*</span>
              </label>
              <input
                  type="text"
                  class="form-control"
                  id="address"
                  name="address"
                  :class="{ 'is-invalid': v$.address.$errors.length }"
                  v-model="state.address"
                  @blur="v$.address.$touch"
                  placeholder="123 Rue de l'Exemple"
              />
              <div
                  v-if="v$.address.$errors.length"
                  class="invalid-feedback animated fadeIn"
              >
                Veuillez entrer une adresse valide (au moins 5 caractères).
              </div>
            </div>

            <div class="mb-4">
              <button type="submit" class="btn btn-alt-primary">Soumettre</button>
            </div>
          </div>
        </div>
      </form>
    </BaseBlock>
    <!-- END Billing Information -->
  </div>
</template>