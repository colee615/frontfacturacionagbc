// plugins/login.js

export default function ({ $axios }, inject) {
  // Crear una instancia personalizada de axios
  const login = $axios.create({
    headers: {
      common: {
        Accept: 'text/plain, */*'
      }
    }
  })

  let url = 'http://localhost/laravel11/api11fact/apifacturacionagbc/public/admin'
  login.setBaseURL(url)

  // Inyectar en el contexto como $login
  inject('login', login)
}
