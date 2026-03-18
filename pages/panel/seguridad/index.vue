<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body">
        <div class="row">
          <div class="col-12">
            <div class="card mb-3 border-primary">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">1) Inicializacion Rapida RBAC</h6>
                <button class="btn btn-primary btn-sm" @click="initializeRbacCatalog">
                  Crear permisos base
                </button>
              </div>
              <div class="card-body">
                <p class="mb-1">
                  Crea automaticamente roles base, permisos por accion y vistas del sistema.
                </p>
                <small class="text-muted">No duplica slugs existentes.</small>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-4">
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">2) Catalogo: Roles</h6>
              </div>
              <div class="card-body">
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="roleForm.name" type="text" class="form-control" />
                </div>
                <div class="form-group mb-3">
                  <label>Slug</label>
                  <input v-model.trim="roleForm.slug" type="text" class="form-control" />
                </div>
                <button class="btn btn-dark btn-sm" @click="createRole">Guardar rol</button>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">2) Catalogo: Permisos</h6>
              </div>
              <div class="card-body">
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="permissionForm.name" type="text" class="form-control" />
                </div>
                <div class="form-group mb-3">
                  <label>Slug</label>
                  <input v-model.trim="permissionForm.slug" type="text" class="form-control" />
                </div>
                <button class="btn btn-dark btn-sm" @click="createPermission">Guardar permiso</button>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">2) Catalogo: Vistas</h6>
              </div>
              <div class="card-body">
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="viewForm.name" type="text" class="form-control" />
                </div>
                <div class="form-group mb-2">
                  <label>Slug</label>
                  <input v-model.trim="viewForm.slug" type="text" class="form-control" />
                </div>
                <div class="form-group mb-3">
                  <label>Ruta</label>
                  <input v-model.trim="viewForm.route" type="text" class="form-control" />
                </div>
                <button class="btn btn-dark btn-sm" @click="createView">Guardar vista</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">3) Asignacion por Rol</h6>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-lg-4">
                <label>Rol</label>
                <select v-model.number="selectedRoleId" class="form-control">
                  <option :value="0" disabled>Seleccione rol</option>
                  <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }} ({{ r.slug }})</option>
                </select>
              </div>
              <div class="col-lg-8">
                <label>Buscar permiso/vista</label>
                <input v-model.trim="filterText" type="text" class="form-control" placeholder="Ej: usuarios.update" />
              </div>
            </div>

            <div class="row">
              <div class="col-lg-7">
                <h6 class="text-sm">Permisos (por modulo)</h6>
                <div class="perm-list">
                  <div v-for="group in groupedPermissions" :key="group.module" class="mb-2">
                    <strong>{{ group.module }}</strong>
                    <div v-for="p in group.items" :key="p.id" class="form-check">
                      <input :id="`perm-${p.id}`" v-model="selectedPermissionIds" class="form-check-input" type="checkbox" :value="p.id" />
                      <label class="form-check-label" :for="`perm-${p.id}`">{{ p.slug }}</label>
                    </div>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm mt-2" :disabled="!selectedRoleId" @click="syncRolePermissions">
                  Guardar permisos del rol
                </button>
              </div>

              <div class="col-lg-5">
                <h6 class="text-sm">Vistas</h6>
                <div class="perm-list">
                  <div v-for="v in filteredViews" :key="v.id" class="form-check">
                    <input :id="`view-${v.id}`" v-model="selectedViewIds" class="form-check-input" type="checkbox" :value="v.id" />
                    <label class="form-check-label" :for="`view-${v.id}`">{{ v.slug }}</label>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm mt-2" :disabled="!selectedRoleId" @click="syncRoleViews">
                  Guardar vistas del rol
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminTemplate>
  </div>
</template>

<script>
export default {
  name: 'SeguridadIndexPage',
  data() {
    return {
      load: false,
      page: 'Panel',
      modulo: 'Seguridad',
      roles: [],
      permissions: [],
      views: [],
      selectedRoleId: 0,
      selectedPermissionIds: [],
      selectedViewIds: [],
      filterText: '',
      roleForm: { name: '', slug: '' },
      permissionForm: { name: '', slug: '' },
      viewForm: { name: '', slug: '', route: '' },
      baseRoles: [
        { name: 'Administrador', slug: 'admin' },
        { name: 'Usuario', slug: 'usuario' }
      ],
      basePermissions: [
        { name: 'Dashboard', slug: 'dashboard.view' },
        { name: 'Empresa', slug: 'empresa.manage' },
        { name: 'Sucursales Gestion', slug: 'sucursales.manage' },
        { name: 'Sucursales Crear', slug: 'sucursales.create' },
        { name: 'Sucursales Editar', slug: 'sucursales.update' },
        { name: 'Sucursales Eliminar', slug: 'sucursales.delete' },
        { name: 'Usuarios Gestion', slug: 'usuarios.manage' },
        { name: 'Usuarios Crear', slug: 'usuarios.create' },
        { name: 'Usuarios Editar', slug: 'usuarios.update' },
        { name: 'Usuarios Eliminar', slug: 'usuarios.delete' },
        { name: 'Clientes Lectura', slug: 'clientes.read' },
        { name: 'Clientes Escritura', slug: 'clientes.write' },
        { name: 'Clientes Crear', slug: 'clientes.create' },
        { name: 'Clientes Editar', slug: 'clientes.update' },
        { name: 'Clientes Eliminar', slug: 'clientes.delete' },
        { name: 'Servicios Gestion', slug: 'servicios.manage' },
        { name: 'Servicios Crear', slug: 'servicios.create' },
        { name: 'Servicios Editar', slug: 'servicios.update' },
        { name: 'Servicios Eliminar', slug: 'servicios.delete' },
        { name: 'Ventas Lectura', slug: 'ventas.read' },
        { name: 'Ventas Escritura', slug: 'ventas.write' },
        { name: 'Ventas Anular', slug: 'ventas.void' },
        { name: 'RBAC Gestion', slug: 'rbac.manage' }
      ],
      baseViews: [
        { name: 'Dashboard', slug: 'dashboard', route: '/' },
        { name: 'Usuarios', slug: 'usuarios', route: '/panel/usuarios/' },
        { name: 'Sucursales', slug: 'sucursales', route: '/panel/sucursales/' },
        { name: 'Clientes', slug: 'clientes', route: '/panel/clientes/' },
        { name: 'Servicios', slug: 'servicios', route: '/panel/servicios/' },
        { name: 'Ventas', slug: 'ventas', route: '/panel/ventas/' },
        { name: 'Reportes', slug: 'reportes', route: '/panel/reportes/' },
        { name: 'Notificaciones', slug: 'notificaciones', route: '/panel/notificaciones/' },
        { name: 'Seguridad', slug: 'seguridad', route: '/panel/seguridad/' }
      ]
    };
  },
  computed: {
    filteredPermissions() {
      const q = (this.filterText || '').toString().toLowerCase();
      if (!q) return this.permissions;
      return this.permissions.filter((p) => ((p && p.slug) ? p.slug : '').toString().toLowerCase().includes(q) || ((p && p.name) ? p.name : '').toString().toLowerCase().includes(q));
    },
    filteredViews() {
      const q = (this.filterText || '').toString().toLowerCase();
      if (!q) return this.views;
      return this.views.filter((v) => ((v && v.slug) ? v.slug : '').toString().toLowerCase().includes(q) || ((v && v.name) ? v.name : '').toString().toLowerCase().includes(q));
    },
    groupedPermissions() {
      const map = {};
      for (const p of this.filteredPermissions) {
        const moduleName = (p.slug || '').split('.')[0] || 'otros';
        if (!map[moduleName]) map[moduleName] = [];
        map[moduleName].push(p);
      }
      return Object.keys(map)
        .sort()
        .map((module) => ({ module, items: map[module] }));
    }
  },
  watch: {
    selectedRoleId() {
      this.loadSelectedRoleData();
    }
  },
  methods: {
    async getData(path) {
      return this.$admin.$get(path);
    },
    async loadAll() {
      this.load = true;
      try {
        const [roles, permissions, views] = await Promise.all([
          this.getData('rbac/roles'),
          this.getData('rbac/permissions'),
          this.getData('rbac/views')
        ]);
        this.roles = roles || [];
        this.permissions = permissions || [];
        this.views = views || [];
        this.loadSelectedRoleData();
      } finally {
        this.load = false;
      }
    },
    loadSelectedRoleData() {
      const role = this.roles.find((r) => r.id === this.selectedRoleId);
      this.selectedPermissionIds = role ? (role.permissions || []).map((p) => p.id) : [];
      this.selectedViewIds = role ? (role.views || []).map((v) => v.id) : [];
    },
    async createRole() {
      if (!this.roleForm.name || !this.roleForm.slug) return;
      this.load = true;
      try {
        await this.$admin.$post('rbac/roles', this.roleForm);
        this.roleForm = { name: '', slug: '' };
        await this.loadAll();
      } finally {
        this.load = false;
      }
    },
    async createPermission() {
      if (!this.permissionForm.name || !this.permissionForm.slug) return;
      this.load = true;
      try {
        await this.$admin.$post('rbac/permissions', this.permissionForm);
        this.permissionForm = { name: '', slug: '' };
        await this.loadAll();
      } finally {
        this.load = false;
      }
    },
    async createView() {
      if (!this.viewForm.name || !this.viewForm.slug) return;
      this.load = true;
      try {
        await this.$admin.$post('rbac/views', this.viewForm);
        this.viewForm = { name: '', slug: '', route: '' };
        await this.loadAll();
      } finally {
        this.load = false;
      }
    },
    async initializeRbacCatalog() {
      this.load = true;
      try {
        if (!this.permissions.length || !this.views.length || !this.roles.length) {
          await this.loadAll();
        }

        const currentRoleSlugs = new Set(this.roles.map((r) => r.slug));
        const currentPermissionSlugs = new Set(this.permissions.map((p) => p.slug));
        const currentViewSlugs = new Set(this.views.map((v) => v.slug));

        for (const role of this.baseRoles) {
          if (!currentRoleSlugs.has(role.slug)) {
            await this.$admin.$post('rbac/roles', role);
          }
        }

        for (const permission of this.basePermissions) {
          if (!currentPermissionSlugs.has(permission.slug)) {
            await this.$admin.$post('rbac/permissions', permission);
          }
        }

        for (const view of this.baseViews) {
          if (!currentViewSlugs.has(view.slug)) {
            await this.$admin.$post('rbac/views', view);
          }
        }

        await this.loadAll();

        this.$swal.fire({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          icon: 'success',
          title: 'Catalogo RBAC inicializado',
          timer: 1800
        });
      } finally {
        this.load = false;
      }
    },
    async syncRolePermissions() {
      if (!this.selectedRoleId) return;
      this.load = true;
      try {
        await this.$admin.$post(`rbac/roles/${this.selectedRoleId}/permissions`, {
          permission_ids: this.selectedPermissionIds
        });
        await this.refreshCurrentSessionAccess();
        await this.loadAll();
      } finally {
        this.load = false;
      }
    },
    async syncRoleViews() {
      if (!this.selectedRoleId) return;
      this.load = true;
      try {
        await this.$admin.$post(`rbac/roles/${this.selectedRoleId}/views`, {
          view_ids: this.selectedViewIds
        });
        await this.refreshCurrentSessionAccess();
        await this.loadAll();
      } finally {
        this.load = false;
      }
    },
    async refreshCurrentSessionAccess() {
      const token = this.$store.state.auth.token;
      if (!token) return;
      try {
        const res = await this.$admin.$get('me');
        const user = res.usuario || this.$store.state.auth.user;
        const roles = res.roles || [];
        const permissions = res.permissions || [];
        const views = res.views || [];
        this.$store.dispatch('auth/login', { token, user, roles, permissions, views });
      } catch (e) {
        // No-op: interceptor handles auth failures.
      }
    }
  },
  mounted() {
    this.loadAll();
  }
};
</script>

<style scoped>
.perm-list {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 0.75rem;
}
</style>
