# Proyecto Nuxt.js

Este es un proyecto desarrollado con el framework Nuxt.js 2.4.

## Build Setup

```bash
# Instalar las dependencias
$ npm install

# El servidor por defecto es el localhost:3000
$ npm run dev

# Generar para producción dinamic
$ npm run build
$ npm run start

# Generar para producción estatic
$ npm run generate
```


## Special Directories

Puedes crear los siguientes directorios adicionales en un proyecto Nuxt.js, algunos de los cuales tienen comportamientos especiales. Solo pages es obligatorio; puedes eliminar los demás si no deseas utilizar su funcionalidad.

### `assets`

El directorio assets contiene tus recursos no compilados, como archivos Stylus o Sass, imágenes o fuentes.

### `components`

El directorio components contiene tus componentes Vue.js. Los componentes forman las diferentes partes de tu página y pueden ser reutilizados e importados en tus páginas, diseños e incluso otros componentes.

### `pages`

Este directorio contiene las vistas y rutas de tu aplicación. Nuxt leerá todos los archivos *.vue dentro de este directorio y configurará automáticamente Vue Router.


### `plugins`

El directorio plugins contiene los plugins de JavaScript que deseas ejecutar antes de instanciar la aplicación raíz de Vue.js. Este es el lugar para agregar plugins de Vue e inyectar funciones o constantes. Cada vez que necesites usar Vue.use(), deberías crear un archivo en plugins/ y agregar su ruta a plugins en `nuxt.config.js`, en este apartado realizas la conexión para conectar con el backend usando las metricas del jtw.


### `store`

Este directorio contiene tus archivos de Vuex store. Crear un archivo en este directorio activa automáticamente Vuex.