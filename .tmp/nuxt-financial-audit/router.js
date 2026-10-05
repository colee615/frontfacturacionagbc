import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _4664bc5c = () => interopDefault(import('..\\..\\pages\\auth\\login.vue' /* webpackChunkName: "pages/auth/login" */))
const _4819646c = () => interopDefault(import('..\\..\\pages\\auth\\register.vue' /* webpackChunkName: "pages/auth/register" */))
const _6057bec6 = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\index.vue' /* webpackChunkName: "pages/cajero/ventas/index" */))
const _132aa67a = () => interopDefault(import('..\\..\\pages\\panel\\integration-tokens\\index.vue' /* webpackChunkName: "pages/panel/integration-tokens/index" */))
const _44099b03 = () => interopDefault(import('..\\..\\pages\\panel\\notificaciones\\index.vue' /* webpackChunkName: "pages/panel/notificaciones/index" */))
const _df517592 = () => interopDefault(import('..\\..\\pages\\panel\\seguridad\\index.vue' /* webpackChunkName: "pages/panel/seguridad/index" */))
const _865b60b0 = () => interopDefault(import('..\\..\\pages\\panel\\usuarios\\index.vue' /* webpackChunkName: "pages/panel/usuarios/index" */))
const _d2042aec = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\auditoria.vue' /* webpackChunkName: "pages/cajero/ventas/auditoria" */))
const _479138f7 = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\lista.vue' /* webpackChunkName: "pages/cajero/ventas/lista" */))
const _01dec24b = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\protocolo.vue' /* webpackChunkName: "pages/cajero/ventas/protocolo" */))
const _5efa54d1 = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\servicios.vue' /* webpackChunkName: "pages/cajero/ventas/servicios" */))
const _4489ca48 = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\servicios-contrato.vue' /* webpackChunkName: "pages/cajero/ventas/servicios-contrato" */))
const _3ee91188 = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\sucursal.vue' /* webpackChunkName: "pages/cajero/ventas/sucursal" */))
const _2cbe812e = () => interopDefault(import('..\\..\\pages\\cajero\\ventas\\invoice\\_id.vue' /* webpackChunkName: "pages/cajero/ventas/invoice/_id" */))
const _389f64fc = () => interopDefault(import('..\\..\\pages\\panel\\notificaciones\\detalle\\_id.vue' /* webpackChunkName: "pages/panel/notificaciones/detalle/_id" */))
const _75f51fa3 = () => interopDefault(import('..\\..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/auth/login",
    component: _4664bc5c,
    name: "auth-login"
  }, {
    path: "/auth/register",
    component: _4819646c,
    name: "auth-register"
  }, {
    path: "/cajero/ventas",
    component: _6057bec6,
    name: "cajero-ventas"
  }, {
    path: "/panel/integration-tokens",
    component: _132aa67a,
    name: "panel-integration-tokens"
  }, {
    path: "/panel/notificaciones",
    component: _44099b03,
    name: "panel-notificaciones"
  }, {
    path: "/panel/seguridad",
    component: _df517592,
    name: "panel-seguridad"
  }, {
    path: "/panel/usuarios",
    component: _865b60b0,
    name: "panel-usuarios"
  }, {
    path: "/cajero/ventas/auditoria",
    component: _d2042aec,
    name: "cajero-ventas-auditoria"
  }, {
    path: "/cajero/ventas/lista",
    component: _479138f7,
    name: "cajero-ventas-lista"
  }, {
    path: "/cajero/ventas/protocolo",
    component: _01dec24b,
    name: "cajero-ventas-protocolo"
  }, {
    path: "/cajero/ventas/servicios",
    component: _5efa54d1,
    name: "cajero-ventas-servicios"
  }, {
    path: "/cajero/ventas/servicios-contrato",
    component: _4489ca48,
    name: "cajero-ventas-servicios-contrato"
  }, {
    path: "/cajero/ventas/sucursal",
    component: _3ee91188,
    name: "cajero-ventas-sucursal"
  }, {
    path: "/cajero/ventas/invoice/:id?",
    component: _2cbe812e,
    name: "cajero-ventas-invoice-id"
  }, {
    path: "/panel/notificaciones/detalle/:id?",
    component: _389f64fc,
    name: "panel-notificaciones-detalle-id"
  }, {
    path: "/",
    component: _75f51fa3,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
