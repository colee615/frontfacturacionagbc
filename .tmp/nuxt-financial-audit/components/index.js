export const AdminTemplate = () => import('../..\\..\\components\\AdminTemplate.vue' /* webpackChunkName: "components/admin-template" */).then(c => wrapFunctional(c.default || c))
export const JcLoader = () => import('../..\\..\\components\\JcLoader.vue' /* webpackChunkName: "components/jc-loader" */).then(c => wrapFunctional(c.default || c))
export const BaseAside = () => import('../..\\..\\components\\base\\Aside.vue' /* webpackChunkName: "components/base-aside" */).then(c => wrapFunctional(c.default || c))
export const BaseFooter = () => import('../..\\..\\components\\base\\Footer.vue' /* webpackChunkName: "components/base-footer" */).then(c => wrapFunctional(c.default || c))
export const BaseIcon = () => import('../..\\..\\components\\base\\Icon.vue' /* webpackChunkName: "components/base-icon" */).then(c => wrapFunctional(c.default || c))
export const BaseNav = () => import('../..\\..\\components\\base\\Nav.vue' /* webpackChunkName: "components/base-nav" */).then(c => wrapFunctional(c.default || c))
export const BasePageHeading = () => import('../..\\..\\components\\base\\PageHeading.vue' /* webpackChunkName: "components/base-page-heading" */).then(c => wrapFunctional(c.default || c))
export const CrudCreate = () => import('../..\\..\\components\\crud\\Create.vue' /* webpackChunkName: "components/crud-create" */).then(c => wrapFunctional(c.default || c))
export const CrudUpdate = () => import('../..\\..\\components\\crud\\Update.vue' /* webpackChunkName: "components/crud-update" */).then(c => wrapFunctional(c.default || c))
export const PostCasillas = () => import('../..\\..\\components\\post\\Casillas.vue' /* webpackChunkName: "components/post-casillas" */).then(c => wrapFunctional(c.default || c))
export const PostServicio = () => import('../..\\..\\components\\post\\Servicio.vue' /* webpackChunkName: "components/post-servicio" */).then(c => wrapFunctional(c.default || c))

// nuxt/nuxt.js#8607
function wrapFunctional(options) {
  if (!options || !options.functional) {
    return options
  }

  const propKeys = Array.isArray(options.props) ? options.props : Object.keys(options.props || {})

  return {
    render(h) {
      const attrs = {}
      const props = {}

      for (const key in this.$attrs) {
        if (propKeys.includes(key)) {
          props[key] = this.$attrs[key]
        } else {
          attrs[key] = this.$attrs[key]
        }
      }

      return h(options, {
        on: this.$listeners,
        attrs,
        props,
        scopedSlots: this.$scopedSlots,
      }, this.$slots.default)
    }
  }
}
