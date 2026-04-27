<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="security-page">
        <div class="row">
          <div class="col-12 mb-4">
            <div class="card security-hero">
              <div class="card-body">
                <div class="security-hero-head">
                  <div class="security-heading">
                    <span class="security-heading-icon">
                      <i class="fas fa-user-shield"></i>
                    </span>
                    <div>
                    <p class="security-kicker mb-2">Centro de Accesos</p>
                    <h4 class="security-title mb-2">Roles y permisos</h4>
                    <p class="security-subtitle mb-0">
                      Administra roles, permisos y vistas del sistema desde una matriz clara de acceso operativo.
                    </p>
                    </div>
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
                <div class="security-card-title">
                  <div>
                    <p class="security-section-kicker mb-1">Catálogo</p>
                    <h6 class="mb-0">{{ roleForm.id ? 'Editar rol' : 'Nuevo rol' }}</h6>
                  </div>
                  <button v-if="roleForm.id" class="security-mini-btn" type="button" @click="resetRoleForm" title="Cancelar edición">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="roleForm.name" type="text" class="form-control security-input" placeholder="Ej. Supervisor" />
                </div>
                <div class="form-group mb-3">
                  <label>Slug</label>
                  <input v-model.trim="roleForm.slug" type="text" class="form-control security-input" placeholder="Ej. supervisor" />
                </div>
                <button class="btn security-btn security-btn-dark w-100" @click="saveRole">
                  <i class="fas fa-save"></i>
                  <span>{{ roleForm.id ? 'Actualizar rol' : 'Guardar rol' }}</span>
                </button>
                <div class="security-catalog-list">
                  <div v-for="role in roles" :key="role.id" class="security-catalog-item">
                    <div>
                      <strong>{{ role.name }}</strong>
                      <small>{{ role.slug }}</small>
                    </div>
                    <div class="security-row-actions">
                      <span v-if="role.is_system" class="security-lock-chip"><i class="fas fa-lock"></i></span>
                      <button type="button" class="security-icon-btn" @click="editRole(role)" title="Editar rol">
                        <i class="fas fa-pen"></i>
                      </button>
                      <button type="button" class="security-icon-btn security-icon-btn-danger" :disabled="role.is_system" @click="deleteRole(role)" title="Eliminar rol">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card security-form-card mb-4">
              <div class="card-body">
                <div class="security-card-title">
                  <div>
                    <p class="security-section-kicker mb-1">Catálogo</p>
                    <h6 class="mb-0">{{ permissionForm.id ? 'Editar permiso' : 'Nuevo permiso' }}</h6>
                  </div>
                  <button v-if="permissionForm.id" class="security-mini-btn" type="button" @click="resetPermissionForm" title="Cancelar edición">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="permissionForm.name" type="text" class="form-control security-input" placeholder="Ej. Usuarios crear" />
                </div>
                <div class="form-group mb-3">
                  <label>Slug</label>
                  <input v-model.trim="permissionForm.slug" type="text" class="form-control security-input" placeholder="Ej. usuarios.create" />
                </div>
                <button class="btn security-btn security-btn-dark w-100" @click="savePermission">
                  <i class="fas fa-save"></i>
                  <span>{{ permissionForm.id ? 'Actualizar permiso' : 'Guardar permiso' }}</span>
                </button>
                <div class="security-catalog-list">
                  <div v-for="permission in permissions" :key="permission.id" class="security-catalog-item">
                    <div>
                      <strong>{{ permission.name }}</strong>
                      <small>{{ permission.slug }}</small>
                    </div>
                    <div class="security-row-actions">
                      <button type="button" class="security-icon-btn" @click="editPermission(permission)" title="Editar permiso">
                        <i class="fas fa-pen"></i>
                      </button>
                      <button type="button" class="security-icon-btn security-icon-btn-danger" @click="deletePermission(permission)" title="Eliminar permiso">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card security-form-card mb-4">
              <div class="card-body">
                <div class="security-card-title">
                  <div>
                    <p class="security-section-kicker mb-1">Catálogo</p>
                    <h6 class="mb-0">{{ viewForm.id ? 'Editar vista' : 'Nueva vista' }}</h6>
                  </div>
                  <button v-if="viewForm.id" class="security-mini-btn" type="button" @click="resetViewForm" title="Cancelar edición">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="form-group mb-2">
                  <label>Nombre</label>
                  <input v-model.trim="viewForm.name" type="text" class="form-control security-input" placeholder="Ej. Usuarios" />
                </div>
                <div class="form-group mb-2">
                  <label>Slug</label>
                  <input v-model.trim="viewForm.slug" type="text" class="form-control security-input" placeholder="Ej. usuarios" />
                </div>
                <div class="form-group mb-3">
                  <label>Ruta</label>
                  <input v-model.trim="viewForm.route" type="text" class="form-control security-input" placeholder="/panel/usuarios/" />
                </div>
                <button class="btn security-btn security-btn-dark w-100" @click="saveView">
                  <i class="fas fa-save"></i>
                  <span>{{ viewForm.id ? 'Actualizar vista' : 'Guardar vista' }}</span>
                </button>
                <div class="security-catalog-list">
                  <div v-for="view in views" :key="view.id" class="security-catalog-item">
                    <div>
                      <strong>{{ view.name }}</strong>
                      <small>{{ view.slug }} · {{ view.route || 'Sin ruta' }}</small>
                    </div>
                    <div class="security-row-actions">
                      <button type="button" class="security-icon-btn" @click="editView(view)" title="Editar vista">
                        <i class="fas fa-pen"></i>
                      </button>
                      <button type="button" class="security-icon-btn security-icon-btn-danger" @click="deleteView(view)" title="Eliminar vista">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
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
      roleForm: { id: null, name: '', slug: '' },
      permissionForm: { id: null, name: '', slug: '' },
      viewForm: { id: null, name: '', slug: '', route: '', is_active: true },
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
        if (!this.selectedRoleId && this.roles.length) {
          this.selectedRoleId = this.roles[0].id;
        }
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
    resetRoleForm() {
      this.roleForm = { id: null, name: '', slug: '' };
    },
    resetPermissionForm() {
      this.permissionForm = { id: null, name: '', slug: '' };
    },
    resetViewForm() {
      this.viewForm = { id: null, name: '', slug: '', route: '', is_active: true };
    },
    editRole(role) {
      this.roleForm = { id: role.id, name: role.name || '', slug: role.slug || '' };
    },
    editPermission(permission) {
      this.permissionForm = { id: permission.id, name: permission.name || '', slug: permission.slug || '' };
    },
    editView(view) {
      this.viewForm = {
        id: view.id,
        name: view.name || '',
        slug: view.slug || '',
        route: view.route || '',
        is_active: view.is_active !== false
      };
    },
    validateNameSlug(form, label) {
      if (!form.name || !form.slug) {
        this.notify('error', `${label} incompleto`, 'Completa nombre y slug antes de guardar.');
        return false;
      }
      return true;
    },
    async saveRole() {
      if (!this.validateNameSlug(this.roleForm, 'Rol')) return;
      this.load = true;
      try {
        const payload = { name: this.roleForm.name, slug: this.roleForm.slug };
        if (this.roleForm.id) {
          await this.$admin.$put(`rbac/roles/${this.roleForm.id}`, payload);
          this.notify('success', 'Rol actualizado', 'Los datos del rol quedaron guardados.');
        } else {
          await this.$admin.$post('rbac/roles', payload);
          this.notify('success', 'Rol creado', 'Ya puedes asignarle permisos y vistas.');
        }
        this.resetRoleForm();
        await this.loadAll();
      } catch (e) {
        this.notifyError(e, 'No se pudo guardar el rol');
      } finally {
        this.load = false;
      }
    },
    async savePermission() {
      if (!this.validateNameSlug(this.permissionForm, 'Permiso')) return;
      this.load = true;
      try {
        const payload = { name: this.permissionForm.name, slug: this.permissionForm.slug };
        if (this.permissionForm.id) {
          await this.$admin.$put(`rbac/permissions/${this.permissionForm.id}`, payload);
          this.notify('success', 'Permiso actualizado', 'El cambio ya está disponible en la matriz.');
        } else {
          await this.$admin.$post('rbac/permissions', payload);
          this.notify('success', 'Permiso creado', 'Ahora puedes asignarlo a un rol.');
        }
        this.resetPermissionForm();
        await this.loadAll();
      } catch (e) {
        this.notifyError(e, 'No se pudo guardar el permiso');
      } finally {
        this.load = false;
      }
    },
    async saveView() {
      if (!this.validateNameSlug(this.viewForm, 'Vista')) return;
      this.load = true;
      try {
        const payload = {
          name: this.viewForm.name,
          slug: this.viewForm.slug,
          route: this.viewForm.route,
          is_active: this.viewForm.is_active
        };
        if (this.viewForm.id) {
          await this.$admin.$put(`rbac/views/${this.viewForm.id}`, payload);
          this.notify('success', 'Vista actualizada', 'La ruta y el acceso quedaron guardados.');
        } else {
          await this.$admin.$post('rbac/views', payload);
          this.notify('success', 'Vista creada', 'Ahora puedes habilitarla por rol.');
        }
        this.resetViewForm();
        await this.loadAll();
      } catch (e) {
        this.notifyError(e, 'No se pudo guardar la vista');
      } finally {
        this.load = false;
      }
    },
    async deleteRole(role) {
      if (!role || role.is_system) return;
      const result = await this.confirmAction('Eliminar rol', `Se eliminara "${role.name}" del catálogo.`, 'Eliminar');
      if (!result.isConfirmed) return;
      this.load = true;
      try {
        await this.$admin.$delete(`rbac/roles/${role.id}`);
        this.notify('success', 'Rol eliminado', 'El catálogo fue actualizado.');
        if (this.selectedRoleId === role.id) this.selectedRoleId = 0;
        await this.loadAll();
      } catch (e) {
        this.notifyError(e, 'No se pudo eliminar el rol');
      } finally {
        this.load = false;
      }
    },
    async deletePermission(permission) {
      const result = await this.confirmAction('Eliminar permiso', `Se eliminara "${permission.name}" del catálogo.`, 'Eliminar');
      if (!result.isConfirmed) return;
      this.load = true;
      try {
        await this.$admin.$delete(`rbac/permissions/${permission.id}`);
        this.notify('success', 'Permiso eliminado', 'La matriz fue actualizada.');
        await this.loadAll();
      } catch (e) {
        this.notifyError(e, 'No se pudo eliminar el permiso');
      } finally {
        this.load = false;
      }
    },
    async deleteView(view) {
      const result = await this.confirmAction('Eliminar vista', `Se eliminara "${view.name}" del catálogo.`, 'Eliminar');
      if (!result.isConfirmed) return;
      this.load = true;
      try {
        await this.$admin.$delete(`rbac/views/${view.id}`);
        this.notify('success', 'Vista eliminada', 'Los accesos por rol fueron actualizados.');
        await this.loadAll();
      } catch (e) {
        this.notifyError(e, 'No se pudo eliminar la vista');
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

        this.notify('success', 'Catálogo RBAC listo', 'Roles, permisos y vistas base están disponibles.');
      } catch (e) {
        this.notifyError(e, 'No se pudo inicializar el catálogo');
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
        this.notify('success', 'Permisos guardados', 'La matriz del rol fue actualizada.');
      } catch (e) {
        this.notifyError(e, 'No se pudieron guardar los permisos');
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
        this.notify('success', 'Vistas guardadas', 'El menú del rol fue actualizado.');
      } catch (e) {
        this.notifyError(e, 'No se pudieron guardar las vistas');
      } finally {
        this.load = false;
      }
    },
    notify(icon, title, text = '') {
      return this.$swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        icon,
        title,
        text,
        timer: icon === 'error' ? 4200 : 2400,
        timerProgressBar: true,
        customClass: {
          popup: 'security-toast',
          title: 'security-toast-title',
          htmlContainer: 'security-toast-body',
          timerProgressBar: 'security-toast-progress'
        }
      });
    },
    notifyError(e, fallback) {
      const backendErrors = e.response?.data?.errors;
      const backendMessage = e.response?.data?.message || e.response?.data?.error;
      if (backendErrors && typeof backendErrors === 'object') {
        const first = Object.values(backendErrors).flat()[0];
        this.notify('error', fallback, first || 'Revisa los datos enviados.');
        return;
      }
      this.notify('error', fallback, backendMessage || 'Intenta nuevamente.');
    },
    confirmAction(title, text, confirmText) {
      return this.$swal.fire({
        toast: false,
        position: 'center',
        showConfirmButton: true,
        showCancelButton: true,
        reverseButtons: true,
        icon: 'warning',
        title,
        text,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
          popup: 'security-swal',
          title: 'security-swal-title',
          htmlContainer: 'security-swal-body',
          confirmButton: 'security-swal-button security-swal-confirm-danger',
          cancelButton: 'security-swal-button security-swal-cancel',
          actions: 'security-swal-actions'
        }
      });
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

<style>
.security-page {
  color: #344054;
}

.security-hero {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  overflow: hidden;
}

.security-hero .card-body,
.security-action-card .card-body,
.security-form-card .card-body,
.security-matrix-card .card-body {
  padding: 1.55rem 1.65rem;
}

.security-hero-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.security-heading {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.security-heading-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eef2ff;
  color: #5967d8;
  border: 1px solid #e0e7ff;
}

.security-kicker,
.security-section-kicker {
  color: #98a2b3;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.security-title {
  color: #1f2937;
  font-size: 1.35rem;
  font-weight: 800;
}

.security-subtitle {
  color: #667085;
  max-width: 760px;
  font-size: 0.96rem;
}

.security-badge,
.security-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.72rem 0.95rem;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
  color: #4b5565;
  font-weight: 800;
  box-shadow: none;
  white-space: nowrap;
}

.security-stat {
  min-height: 94px;
  padding: 1rem 1.1rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.security-stat-label {
  display: block;
  color: #667085;
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 0.45rem;
}

.security-stat strong {
  color: #1f2937;
  font-size: 1.35rem;
  font-weight: 800;
}

.security-action-card,
.security-form-card,
.security-matrix-card {
  border-radius: 18px;
  overflow: hidden;
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
  color: #667085;
}

.security-matrix-head {
  margin-bottom: 1.5rem;
}

.security-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  min-height: 44px;
  padding: 0.72rem 1.05rem;
  border-radius: 14px;
  border: 1px solid transparent;
  font-size: 0.82rem;
  font-weight: 800;
  box-shadow: none;
}

.security-btn-primary {
  background: #1f2937;
  color: #fff;
  border-color: rgba(31, 41, 55, 0.16);
}

.security-btn-dark {
  background: #1f2937;
  color: #fff;
  border-color: rgba(31, 41, 55, 0.16);
}

.security-input {
  min-height: 46px;
  border-radius: 14px !important;
  font-size: 0.92rem;
}

.security-form-card label,
.security-matrix-card label {
  color: #344054;
  font-size: 0.83rem;
  font-weight: 800;
  margin-bottom: 0.45rem;
}

.security-card-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.security-card-title h6,
.security-matrix-head h6,
.security-panel-head h6 {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 800;
}

.security-mini-btn,
.security-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9defd;
  background: #eef2ff;
  color: #3442a8;
}

.security-icon-btn-danger {
  background: #fff1f0;
  border-color: #f5b3ad;
  color: #b42318;
}

.security-icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.security-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.security-lock-chip {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
  color: #98a2b3;
}

.security-catalog-list {
  max-height: 250px;
  overflow-y: auto;
  margin-top: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid #eef2f7;
}

.security-catalog-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0;
}

.security-catalog-item + .security-catalog-item {
  border-top: 1px solid #eef2f7;
}

.security-catalog-item strong {
  display: block;
  color: #24324d;
  font-size: 0.9rem;
  font-weight: 800;
}

.security-catalog-item small {
  color: #667085;
  font-size: 0.78rem;
  font-weight: 650;
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
  border: 1px solid #e6ebf3;
  border-radius: 16px;
  padding: 1rem;
  background: #f8fafc;
}

.perm-list {
  max-height: 460px;
  overflow-y: auto;
  border: 1px solid #e6ebf3;
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

.security-toast,
.security-swal {
  border-radius: 16px !important;
  background: #ffffff !important;
  border: 1px solid #e6ebf3 !important;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16) !important;
}

.security-toast {
  width: min(420px, calc(100vw - 24px)) !important;
  padding: 0.95rem 1rem !important;
}

.security-toast-title,
.security-swal-title {
  color: #1f2937 !important;
  font-weight: 800 !important;
}

.security-toast-body,
.security-swal-body {
  color: #667085 !important;
  font-weight: 600 !important;
}

.security-toast-progress {
  background: rgba(89, 103, 216, 0.22) !important;
}

.security-swal {
  width: min(440px, calc(100vw - 28px)) !important;
  padding: 1.5rem !important;
}

.security-swal-actions {
  gap: 0.7rem !important;
}

.security-swal-button {
  min-width: 116px;
  min-height: 42px;
  border-radius: 13px;
  border: 1px solid transparent;
  padding: 0.68rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.security-swal-cancel {
  background: #ffffff;
  border-color: #d8e0ec;
  color: #4b5565;
}

.security-swal-confirm-danger {
  background: #b42318;
  border-color: #b42318;
  color: #ffffff;
}

body.enterprise-dark .security-page .card,
body.enterprise-dark .security-hero,
body.enterprise-dark .security-action-card,
body.enterprise-dark .security-form-card,
body.enterprise-dark .security-matrix-card,
body.enterprise-dark .security-toast,
body.enterprise-dark .security-swal {
  background: #151e2b !important;
  border-color: rgba(82, 99, 128, 0.78) !important;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25) !important;
}

body.enterprise-dark .security-title,
body.enterprise-dark .security-stat strong,
body.enterprise-dark .security-card-title h6,
body.enterprise-dark .security-matrix-head h6,
body.enterprise-dark .security-panel-head h6,
body.enterprise-dark .security-catalog-item strong,
body.enterprise-dark .security-group-head,
body.enterprise-dark .security-item-check .form-check-label span,
body.enterprise-dark .security-toast-title,
body.enterprise-dark .security-swal-title {
  color: #f8fafc !important;
}

body.enterprise-dark .security-subtitle,
body.enterprise-dark .security-stat-label,
body.enterprise-dark .security-action-head small,
body.enterprise-dark .security-matrix-head small,
body.enterprise-dark .security-panel-head small,
body.enterprise-dark .security-catalog-item small,
body.enterprise-dark .security-item-check .form-check-label small,
body.enterprise-dark .security-toast-body,
body.enterprise-dark .security-swal-body {
  color: #94a3b8 !important;
}

body.enterprise-dark .security-kicker,
body.enterprise-dark .security-section-kicker {
  color: #aab4c6 !important;
}

body.enterprise-dark .security-heading-icon,
body.enterprise-dark .security-mini-btn,
body.enterprise-dark .security-icon-btn {
  background: rgba(89, 103, 216, 0.18) !important;
  border-color: rgba(129, 140, 248, 0.3) !important;
  color: #c7d2fe !important;
}

body.enterprise-dark .security-icon-btn-danger {
  background: rgba(239, 68, 68, 0.14) !important;
  border-color: rgba(239, 68, 68, 0.32) !important;
  color: #fca5a5 !important;
}

body.enterprise-dark .security-badge,
body.enterprise-dark .security-chip,
body.enterprise-dark .security-stat,
body.enterprise-dark .security-panel,
body.enterprise-dark .perm-list,
body.enterprise-dark .security-lock-chip {
  background: #101827 !important;
  border-color: rgba(82, 99, 128, 0.78) !important;
  color: #cbd5e1 !important;
}

body.enterprise-dark .security-catalog-list,
body.enterprise-dark .security-catalog-item + .security-catalog-item,
body.enterprise-dark .security-group-head,
body.enterprise-dark .security-item-check + .security-item-check {
  border-color: rgba(82, 99, 128, 0.56) !important;
}

body.enterprise-dark .security-group-head span {
  background: rgba(148, 163, 184, 0.12) !important;
  color: #cbd5e1 !important;
}

body.enterprise-dark .security-form-card label,
body.enterprise-dark .security-matrix-card label {
  color: #e5e7eb !important;
}

body.enterprise-dark .security-input {
  background: #0f1726 !important;
  border-color: rgba(82, 99, 128, 0.86) !important;
  color: #e5e7eb !important;
}

body.enterprise-dark .security-input::placeholder {
  color: #728198 !important;
}

body.enterprise-dark .security-btn-primary,
body.enterprise-dark .security-btn-dark {
  background: #f8fafc !important;
  border-color: rgba(248, 250, 252, 0.2) !important;
  color: #111827 !important;
}

body.enterprise-dark .security-swal-cancel {
  background: #101827;
  border-color: rgba(82, 99, 128, 0.78);
  color: #cbd5e1;
}

@media (max-width: 991px) {
  .security-hero-head {
    flex-direction: column;
    align-items: stretch;
  }

  .security-badge {
    width: fit-content;
  }
}

@media (max-width: 767px) {
  .security-hero .card-body,
  .security-action-card .card-body,
  .security-form-card .card-body,
  .security-matrix-card .card-body {
    padding: 1.2rem;
  }

  .security-heading {
    gap: 0.75rem;
  }

  .security-heading-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
  }

  .security-btn {
    width: 100%;
  }
}
</style>
