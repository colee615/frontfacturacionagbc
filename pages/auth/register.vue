<template>
    <main class="main-content main-content-bg mt-0 ps">
      <section class="form-section">
        <div class="page-header min-vh-75">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <div class="card custom-card">
                  <div class="card-header pb-3 text-center">
                    <h3 class="font-weight-bold text-info">
                      ¡Creación Exitosa! <i class="fas fa-check-circle"></i>
                    </h3>
                  </div>
                  <div class="card-body">
                    <p class="text-center">Tu cuenta ha sido creada exitosamente.</p>
                    <div class="text-center">
                      <button @click="redirectToPage" class="btn bg-gradient-info w-100 mt-4">Ir a la Página</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </template>
  
  <script>
  export default {
    methods: {
      redirectToPage() {
        // Redirigir a una página específica, por ejemplo:
        this.$router.push('login'); // Reemplaza '/pagina-especifica' con la ruta de la página a la que deseas redirigir
      }
    }
  }
  </script>
  
  <style>
  .custom-card {
    border: 1px solid #ccc;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background: linear-gradient(180deg, #f9f9f9, #e6e6e6);
    transition: box-shadow 0.3s ease;
  }
  
  .custom-card:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
  
  .card-header h3 {
    font-size: 24px;
  }
  
  .form-label {
    font-weight: bold;
  }
  
  .btn {
    font-weight: bold;
  }
  
  .btn:hover {
    opacity: 0.8;
  }
  </style>
  