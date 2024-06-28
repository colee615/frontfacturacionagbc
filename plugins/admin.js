export default function ({ $axios }, inject) {
  // Create a custom axios instance
  const admin = $axios.create({
    headers: {
      common: {
        Accept: 'text/plain, */*'
      }
    }
  })


 let url ='http://172.65.10.36:8000/admin/'
  admin.url = url
  admin.setBaseURL(url)

  // Inject to context as $admin
  inject('admin', admin)
}
