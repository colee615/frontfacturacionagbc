export default function ({ $axios }, inject) {
  // Create a custom axios instance
  const admin = $axios.create({
    headers: {
      common: {
        Accept: 'text/plain, */*'
      }
    }
  })


  let url ='http://localhost/laravel11/api11fact/public/admin/'
  admin.url = url
  admin.setBaseURL(url)

  // Inject to context as $admin
  inject('admin', admin)
}
