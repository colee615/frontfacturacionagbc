<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body">
        <div class="row">
          <div class="col-12 mb-4">
            <div class="card security-hero">
              <div class="card-body">
                <div class="security-hero-head">
                  <div>
                    <p class="security-kicker mb-2">Centro de Accesos</p>
                    <h4 class="security-title mb-2">Roles y permisos</h4>
                    <p class="security-subtitle mb-0">
                      Administra roles, permisos y vistas del sistema desde una matriz clara de acceso operativo.
                    </p>
                  </div>
                  <div class="security-badge">
                    <i class="fas fa-user-lock"></i>
                    <span>{{ roles.length }} roles activos</span>
                  </div>
                </div>
                <div class="row mt-4 g-3">
                  <div class="col-md-4 col-sm-6">
                    <div class="security-stat">
                      <span class="security-stat-label">Roles</span>
                      <strong>{{ roles.length }}</strong>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6">
                    <div class="security-stat">
                      <span class="security-stat-label">Permisos</span>
                      <strong>{{ permissions.length }}</strong>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-12">
                    <div class="security-stat">
                      <span class="security-stat-label">Vistas</span>
                      <strong>{{ views.length }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12 mb-4">
            <div class="card security-action-card">
              <div class="card-body">
                <div class="security-action-head">
                  <div>
                    <p class="security-section-kicker mb-1">Inicialización</p>
                    <h6 class="mb-1">Catálogo base RBAC</h6>
                    <small>No duplica slugs existentes y deja listo el catálogo inicial.</small>
                  </div>
                  <button class="btn security-btn security-btn-primary" @click="initializeRbacCatalog">
                    <i class="fas fa-bolt"></i>
                    <span>Crear permisos base</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card security-form-card mb-4">
              <div class="card-body">
                <p class="security-section-kicker mb-1">Catálogo</p>
                <h6 class="mb-3">Nuevo rol</h6>
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="roleForm.name" type="text" class="form-control security-input" />
                </div>
                <div class="form-group mb-3">
                  <label>Slug</label>
                  <input v-model.trim="roleForm.slug" type="text" class="form-control security-input" />
                </div>
                <button class="btn security-btn security-btn-dark w-100" @click="createRole">
                  <i class="fas fa-user-tag"></i>
                  <span>Guardar rol</span>
                </button>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card security-form-card mb-4">
              <div class="card-body">
                <p class="security-section-kicker mb-1">Catálogo</p>
                <h6 class="mb-3">Nuevo permiso</h6>
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="permissionForm.name" type="text" class="form-control security-input" />
                </div>
                <div class="form-group mb-3">
                  <label>Slug</label>
                  <input v-model.trim="permissionForm.slug" type="text" class="form-control security-input" />
                </div>
                <button class="btn security-btn security-btn-dark w-100" @click="createPermission">
                  <i class="fas fa-key"></i>
                  <span>Guardar permiso</span>
                </button>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card security-form-card mb-4">
              <div class="card-body">
                <p class="security-section-kicker mb-1">Catálogo</p>
                <h6 class="mb-3">Nueva vista</h6>
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="viewForm.name" type="text" class="form-control security-input" />
                </div>
                <div class="form-group mb-2">
                  <label>Slug</label>
                  <input v-model.trim="viewForm.slug" type="text" class="form-control security-input" />
                </div>
                <div class="form-group mb-3">
                  <label>Ruta</label>
                  <input v-model.trim="viewForm.route" type="text" class="form-control security-input" />
                </div>
                <button class="btn security-btn security-btn-dark w-100" @click="createView">
                  <i class="fas fa-window-maximize"></i>
                  <span>Guardar vista</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card security-matrix-card">
          <div class="card-body">
            <div class="security-matrix-head">
              <div>
                <p class="security-section-kicker mb-1">Asignación</p>
                <h6 class="mb-1">Matriz por rol</h6>
                <small>Selecciona un rol y define qué permisos y vistas tendrá habilitados.</small>
              </div>
              <div class="security-chip" v-if="selectedRole">
                <i class="fas fa-shield-alt"></i>
                <span>{{ selectedRole.name }}</span>
              </div>
            </div>

            <div class="row mb-4">
              <div class="col-lg-4">
                <label>Rol</label>
                <select v-model.number="selectedRoleId" class="form-control security-input">
                  <option :value="0" disabled>Seleccione rol</option>
                  <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }} ({{ r.slug }})</option>
                </select>
              </div>
              <div class="col-lg-8">
                <label>Buscar permiso o vista</label>
                <div class="security-search-wrap">
                  <i class="fas fa-search"></i>
                  <input
                    v-model.trim="filterText"
                    type="text"
                    class="form-control security-input security-search"
                    placeholder="Ej: usuarios.update o notificaciones"
                  />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-lg-7">
                <div class="security-panel">
                  <div class="security-panel-head">
                    <div>
                      <h6 class="mb-1">Permisos por módulo</h6>
                      <small>{{ filteredPermissions.length }} permisos filtrados</small>
                    </div>
                    <button class="btn security-btn security-btn-primary" :disabled="!selectedRoleId" @click="syncRolePermissions">
                      <i class="fas fa-save"></i>
                      <span>Guardar permisos</span>
                    </button>
                  </div>
                  <div class="perm-list security-list">
                    <div v-for="group in groupedPermissions" :key="group.module" class="security-group">
                      <div class="security-group-head">
                        <strong>{{ group.module }}</strong>
                        <span>{{ group.items.length }}</span>
                      </div>
                      <div v-for="p in group.items" :key="p.id" class="security-item-check">
                        <input :id="`perm-${p.id}`" v-model="selectedPermissionIds" class="form-check-input" type="checkbox" :value="p.id" />
                        <label class="form-check-label" :for="`perm-${p.id}`">
                          <span>{{ p.slug }}</span>
                          <small>{{ p.name }}</small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-5">
                <div class="security-panel">
                  <div class="security-panel-head">
                    <div>
                      <h6 class="mb-1">Vistas habilitadas</h6>
                      <small>{{ filteredViews.length }} vistas filtradas</small>
                    </div>
                    <button class="btn security-btn security-btn-primary" :disabled="!selectedRoleId" @click="syncRoleViews">
                      <i class="fas fa-save"></i>
                      <span>Guardar vistas</span>
                    </button>
                  </div>
                  <div class="perm-list security-list">
                    <div v-for="v in filteredViews" :key="v.id" class="security-item-check">
                      <input :id="`view-${v.id}`" v-model="selectedViewIds" class="form-check-input" type="checkbox" :value="v.id" />
                      <label class="form-check-label" :for="`view-${v.id}`">
                        <span>{{ v.slug }}</span>
                        <small>{{ v.route }}</small>
                      </label>
                    </div>
                  </div>
                </div>
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
        { name: 'Usuarios Gestion', slug: 'usuarios.manage' },
        { name: 'Usuarios Crear', slug: 'usuarios.create' },
        { name: 'Usuarios Editar', slug: 'usuarios.update' },
        { name: 'Usuarios Eliminar', slug: 'usuarios.delete' },
        { name: 'Ventas Lectura', slug: 'ventas.read' },
        { name: 'Ventas Escritura', slug: 'ventas.write' },
        { name: 'Ventas Anular', slug: 'ventas.void' },
        { name: 'RBAC Gestion', slug: 'rbac.manage' }
      ],
      baseViews: [
        { name: 'Dashboard', slug: 'dashboard', route: '/' },
        { name: 'Usuarios', slug: 'usuarios', route: '/panel/usuarios/' },
        { name: 'Ventas', slug: 'ventas', route: '/panel/ventas/' },
        { name: 'Notificaciones', slug: 'notificaciones', route: '/panel/notificaciones/' },
        { name: 'Seguridad', slug: 'seguridad', route: '/panel/seguridad/' }
      ]
    };
  },
  computed: {
    selectedRole() {
      return this.roles.find((r) => r.id === this.selectedRoleId) || null;
    },
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
.security-hero {
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(255, 216, 79, 0.22), transparent 26%),
    linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
}

.security-hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.security-kicker,
.security-section-kicker {
  color: #b78916;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.security-title {
  color: #24324d;
  font-weight: 800;
}

.security-subtitle {
  color: #6b7a90;
  max-width: 760px;
}

.security-badge,
.security-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.8rem 1rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(215, 224, 236, 0.9);
  color: #4a5b79;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.security-stat {
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(223, 230, 240, 0.92);
}

.security-stat-label {
  display: block;
  color: #7b8aa3;
  font-size: 0.84rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.security-stat strong {
  color: #22314d;
  font-size: 1.5rem;
  font-weight: 800;
}

.security-action-card,
.security-form-card,
.security-matrix-card {
  border-radius: 24px;
}

.security-action-head,
.security-matrix-head,
.security-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.security-action-head small,
.security-matrix-head small,
.security-panel-head small {
  color: #7b8aa3;
}

.security-matrix-head {
  margin-bottom: 1.5rem;
}

.security-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 44px;
  padding: 0.72rem 1.05rem;
  border-radius: 14px;
  border: none;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.security-btn-primary {
  background: #344258;
  color: #fff;
}

.security-btn-dark {
  background: linear-gradient(135deg, #1f2937 0%, #334155 100%);
  color: #fff;
}

.security-input {
  min-height: 48px;
  border-radius: 14px !important;
}

.security-search-wrap {
  position: relative;
}

.security-search-wrap i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.security-search {
  padding-left: 46px !important;
}

.security-panel {
  border: 1px solid rgba(223, 230, 240, 0.92);
  border-radius: 20px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
}

.perm-list {
  max-height: 460px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 0.9rem;
  background: #fff;
}

.security-list {
  margin-top: 1rem;
}

.security-group + .security-group {
  margin-top: 1rem;
}

.security-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid #eef2f7;
  color: #24324d;
}

.security-group-head span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 800;
}

.security-item-check {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.7rem 0.2rem;
}

.security-item-check + .security-item-check {
  border-top: 1px solid #f1f5f9;
}

.security-item-check .form-check-input {
  margin-top: 0.25rem;
}

.security-item-check .form-check-label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  cursor: pointer;
}

.security-item-check .form-check-label span {
  color: #24324d;
  font-weight: 700;
}

.security-item-check .form-check-label small {
  color: #7b8aa3;
}

@media (max-width: 991px) {
  .security-hero-head {
    flex-direction: column;
  }
}
</style>
