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
                  <BasePageHeading title="Roles y permisos" icon="shield" eyebrow="Administración" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav class="security-main-nav" aria-label="Secciones de seguridad">
          <button type="button" :class="{ active: securityView === 'roles' }" :aria-current="securityView === 'roles' ? 'page' : null" @click="securityView = 'roles'; roleDetailOpen = false"><i class="fas fa-user-tag"></i><span>Roles</span></button>
          <button type="button" :class="{ active: securityView === 'permissions' }" :aria-current="securityView === 'permissions' ? 'page' : null" @click="securityView = 'permissions'"><i class="fas fa-key"></i><span>Permisos</span></button>
        </nav>

        <section v-if="securityView === 'permissions'" class="security-setup-card" aria-labelledby="security-catalog-title">
          <div class="security-setup-copy">
            <span class="security-section-kicker">Configuración inicial</span>
            <h2 id="security-catalog-title">Completa el catálogo del sistema</h2>
            <p>Agrega roles, permisos y vistas estándar que todavía no existan.</p>
          </div>
          <button type="button" class="btn security-btn security-btn-primary" @click="initializeRbacCatalog">
            <i class="fas fa-bolt"></i><span>Completar catálogo base</span>
          </button>
        </section>

        <section v-if="securityView === 'roles' && roleDetailOpen" class="card security-assignment-card" aria-labelledby="security-assignment-title">
          <div class="card-body">
            <div class="security-section-heading">
              <div>
                <p class="security-section-kicker mb-1">Accesos del rol</p>
                <h2 id="security-assignment-title">{{ selectedRole ? selectedRole.name : 'Configurar rol' }}</h2>
                <p>Marca las acciones y secciones disponibles para este rol y guarda cada grupo.</p>
              </div>
              <button type="button" class="security-back-button" @click="backToRoles"><i class="fas fa-arrow-left"></i> Volver a roles</button>
            </div>
            <div v-if="selectedRole" class="security-role-context"><i class="fas fa-shield-alt"></i><span>Estás editando los accesos de <strong>{{ selectedRole.name }}</strong> <small>({{ selectedRole.slug }})</small></span></div>
            <div class="security-global-filter"><label for="security-access-search">Buscar un permiso o una vista</label><div class="security-search-wrap"><i class="fas fa-search"></i><input id="security-access-search" v-model.trim="filterText" type="search" class="form-control security-input security-search" placeholder="Ej. usuarios, crear, ventas.read" /></div></div>

            <div class="row security-assignment-panels">
              <div class="col-lg-7 mb-3 mb-lg-0">
                <div class="security-panel">
                  <div class="security-panel-head">
                    <div><span class="security-panel-icon"><i class="fas fa-sliders-h"></i></span><div><h3>Permisos de acciones</h3><small>Controlan tareas como crear, editar o eliminar.</small></div></div>
                    <button type="button" class="btn security-btn security-btn-primary" :disabled="!selectedRoleId" @click="syncRolePermissions"><i class="fas fa-save"></i><span>Guardar permisos</span></button>
                  </div>
                  <div class="security-selection-summary"><span><strong>{{ selectedPermissionIds.length }}</strong> seleccionados</span><span>{{ filteredPermissions.length }} visibles</span></div>
                  <div v-if="groupedPermissions.length" class="security-access-list">
                    <section v-for="group in groupedPermissions" :key="group.module" class="security-group">
                      <div class="security-group-head"><strong>{{ moduleLabel(group.module) }}</strong><span>{{ group.items.length }}</span></div>
                      <label v-for="p in group.items" :key="p.id" class="security-access-row" :for="`perm-${p.id}`">
                        <input :id="`perm-${p.id}`" v-model="selectedPermissionIds" class="form-check-input" type="checkbox" :value="p.id" />
                        <span class="security-access-copy"><strong>{{ p.name }}</strong><small>{{ p.slug }}</small></span><i class="fas fa-check security-check-mark"></i>
                      </label>
                    </section>
                  </div>
                  <div v-else class="security-list-empty"><i class="fas fa-search"></i><strong>No hay permisos con ese nombre</strong><span>Prueba con otra palabra.</span></div>
                </div>
              </div>
              <div class="col-lg-5">
                <div class="security-panel security-views-panel">
                  <div class="security-panel-head">
                    <div><span class="security-panel-icon"><i class="fas fa-window-maximize"></i></span><div><h3>Vistas del sistema</h3><small>Definen qué secciones aparecen para el rol.</small></div></div>
                    <button type="button" class="btn security-btn security-btn-primary" :disabled="!selectedRoleId" @click="syncRoleViews"><i class="fas fa-save"></i><span>Guardar vistas</span></button>
                  </div>
                  <div class="security-selection-summary"><span><strong>{{ selectedViewIds.length }}</strong> seleccionadas</span><span>{{ filteredViews.length }} visibles</span></div>
                  <div v-if="filteredViews.length" class="security-access-list security-view-list">
                    <label v-for="v in filteredViews" :key="v.id" class="security-access-row" :for="`view-${v.id}`">
                      <input :id="`view-${v.id}`" v-model="selectedViewIds" class="form-check-input" type="checkbox" :value="v.id" />
                      <span class="security-access-copy"><strong>{{ v.name }}</strong><small>{{ v.route || v.slug }}</small></span><i class="fas fa-check security-check-mark"></i>
                    </label>
                  </div>
                  <div v-else class="security-list-empty"><i class="fas fa-window-maximize"></i><strong>No hay vistas con ese nombre</strong><span>Prueba con otra palabra.</span></div>
                  <div class="security-note"><i class="fas fa-lightbulb"></i><span>Habilita una vista para que el rol pueda encontrar esa sección en su menú.</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="(securityView === 'roles' && !roleDetailOpen) || securityView === 'permissions'" class="security-catalog-section" aria-labelledby="security-catalog-manager-title">
          <div class="security-section-heading security-catalog-heading">
            <div>
              <p class="security-section-kicker mb-1">{{ securityView === 'roles' ? 'Administración' : 'Catálogo de accesos' }}</p>
              <h2 id="security-catalog-manager-title">{{ securityView === 'roles' ? 'Gestiona los roles' : 'Gestiona permisos y vistas' }}</h2>
              <p v-if="securityView === 'roles'">Un rol agrupa los accesos de un tipo de usuario. Pulsa «Configurar accesos» para elegirlos.</p>
              <p v-else>Los permisos son acciones; las vistas son secciones del menú que cada rol puede abrir.</p>
            </div>
          </div>
          <div v-if="securityView === 'permissions'" class="security-catalog-tabs" role="tablist" aria-label="Tipo de catálogo">
            <button type="button" role="tab" :aria-selected="catalogTab === 'permissions'" :class="{ active: catalogTab === 'permissions' }" @click="catalogTab = 'permissions'"><i class="fas fa-key"></i> Permisos</button>
            <button type="button" role="tab" :aria-selected="catalogTab === 'views'" :class="{ active: catalogTab === 'views' }" @click="catalogTab = 'views'"><i class="fas fa-window-maximize"></i> Vistas</button>
          </div>

          <div v-if="securityView === 'roles' && !roleDetailOpen" class="card security-catalog-card">
            <div class="security-catalog-form">
              <div class="security-card-title"><div><span class="security-form-step">{{ roleForm.id ? 'Editar rol' : 'Nuevo rol' }}</span><h3>{{ roleForm.id ? 'Actualizar rol' : 'Crear un rol' }}</h3></div><button v-if="roleForm.id" class="security-mini-btn" type="button" @click="resetRoleForm" aria-label="Cancelar edición"><i class="fas fa-times"></i></button></div>
              <label for="role-name">Nombre del rol</label><input id="role-name" v-model.trim="roleForm.name" type="text" class="form-control security-input" placeholder="Ej. Supervisor" />
              <label for="role-slug">Identificador único</label><input id="role-slug" v-model.trim="roleForm.slug" type="text" class="form-control security-input" placeholder="Ej. supervisor" /><small class="security-field-hint">Sin espacios; se usa internamente para identificar el rol.</small>
              <button type="button" class="btn security-btn security-btn-primary w-100" @click="saveRole"><i class="fas fa-save"></i><span>{{ roleForm.id ? 'Guardar cambios' : 'Crear rol' }}</span></button>
            </div>
            <div class="security-catalog-content"><div class="security-catalog-list-heading"><h3>Roles existentes</h3><span>{{ roles.length }} en total</span></div><div v-if="roles.length" class="security-catalog-list">
              <div v-for="role in roles" :key="role.id" class="security-catalog-item security-role-item"><div class="security-catalog-item-copy"><strong>{{ role.name }}</strong><small>{{ role.slug }}<span v-if="role.is_system" class="security-system-label"><i class="fas fa-lock"></i> Protegido</span></small><small class="security-role-access-count">{{ (role.permissions || []).length }} permisos · {{ (role.views || []).length }} vistas habilitadas</small></div><div class="security-role-actions"><button type="button" class="security-configure-role" @click="openRoleAccess(role)"><i class="fas fa-sliders-h"></i> Configurar accesos</button><button type="button" class="security-icon-btn" @click="editRole(role)" :aria-label="`Editar rol ${role.name}`" title="Editar rol"><i class="fas fa-pen"></i></button><button v-if="!role.is_system" type="button" class="security-icon-btn security-icon-btn-danger" @click="deleteRole(role)" :aria-label="`Eliminar rol ${role.name}`" title="Eliminar rol"><i class="fas fa-trash"></i></button></div></div>
            </div><div v-else class="security-list-empty"><strong>Aún no hay roles</strong><span>Crea el primer rol con el formulario.</span></div></div>
          </div>

          <div v-else-if="securityView === 'permissions' && catalogTab === 'permissions'" class="card security-catalog-card">
            <div class="security-catalog-form"><div class="security-card-title"><div><span class="security-form-step">{{ permissionForm.id ? 'Editar permiso' : 'Nuevo permiso' }}</span><h3>{{ permissionForm.id ? 'Actualizar permiso' : 'Crear un permiso' }}</h3></div><button v-if="permissionForm.id" class="security-mini-btn" type="button" @click="resetPermissionForm" aria-label="Cancelar edición"><i class="fas fa-times"></i></button></div>
              <label for="permission-name">Nombre del permiso</label><input id="permission-name" v-model.trim="permissionForm.name" type="text" class="form-control security-input" placeholder="Ej. Crear usuarios" />
              <label for="permission-slug">Identificador único</label><input id="permission-slug" v-model.trim="permissionForm.slug" type="text" class="form-control security-input" placeholder="Ej. usuarios.create" /><small class="security-field-hint">Usa el formato módulo.acción, por ejemplo ventas.read.</small>
              <button type="button" class="btn security-btn security-btn-primary w-100" @click="savePermission"><i class="fas fa-save"></i><span>{{ permissionForm.id ? 'Guardar cambios' : 'Crear permiso' }}</span></button>
            </div>
            <div class="security-catalog-content"><div class="security-catalog-list-heading"><h3>Permisos existentes</h3><span>{{ permissions.length }} en total</span></div><div v-if="permissions.length" class="security-catalog-list">
              <div v-for="permission in permissions" :key="permission.id" class="security-catalog-item"><div class="security-catalog-item-copy"><strong>{{ permission.name }}</strong><small>{{ permission.slug }}</small></div><div class="security-row-actions"><button type="button" class="security-icon-btn" @click="editPermission(permission)" :aria-label="`Editar permiso ${permission.name}`" title="Editar permiso"><i class="fas fa-pen"></i></button><button type="button" class="security-icon-btn security-icon-btn-danger" @click="deletePermission(permission)" :aria-label="`Eliminar permiso ${permission.name}`" title="Eliminar permiso"><i class="fas fa-trash"></i></button></div></div>
            </div><div v-else class="security-list-empty"><strong>Aún no hay permisos</strong><span>Crea permisos para definir acciones disponibles.</span></div></div>
          </div>

          <div v-else-if="securityView === 'permissions' && catalogTab === 'views'" class="card security-catalog-card">
            <div class="security-catalog-form"><div class="security-card-title"><div><span class="security-form-step">{{ viewForm.id ? 'Editar vista' : 'Nueva vista' }}</span><h3>{{ viewForm.id ? 'Actualizar vista' : 'Crear una vista' }}</h3></div><button v-if="viewForm.id" class="security-mini-btn" type="button" @click="resetViewForm" aria-label="Cancelar edición"><i class="fas fa-times"></i></button></div>
              <label for="view-name">Nombre de la vista</label><input id="view-name" v-model.trim="viewForm.name" type="text" class="form-control security-input" placeholder="Ej. Usuarios" />
              <label for="view-slug">Identificador único</label><input id="view-slug" v-model.trim="viewForm.slug" type="text" class="form-control security-input" placeholder="Ej. usuarios" />
              <label for="view-route">Ruta de la página</label><input id="view-route" v-model.trim="viewForm.route" type="text" class="form-control security-input" placeholder="/panel/usuarios/" /><small class="security-field-hint">Debe coincidir con la dirección de la página en el sistema.</small>
              <button type="button" class="btn security-btn security-btn-primary w-100" @click="saveView"><i class="fas fa-save"></i><span>{{ viewForm.id ? 'Guardar cambios' : 'Crear vista' }}</span></button>
            </div>
            <div class="security-catalog-content"><div class="security-catalog-list-heading"><h3>Vistas existentes</h3><span>{{ views.length }} en total</span></div><div v-if="views.length" class="security-catalog-list">
              <div v-for="view in views" :key="view.id" class="security-catalog-item"><div class="security-catalog-item-copy"><strong>{{ view.name }}</strong><small>{{ view.slug }} · {{ view.route || 'Sin ruta' }}</small></div><div class="security-row-actions"><button type="button" class="security-icon-btn" @click="editView(view)" :aria-label="`Editar vista ${view.name}`" title="Editar vista"><i class="fas fa-pen"></i></button><button type="button" class="security-icon-btn security-icon-btn-danger" @click="deleteView(view)" :aria-label="`Eliminar vista ${view.name}`" title="Eliminar vista"><i class="fas fa-trash"></i></button></div></div>
            </div><div v-else class="security-list-empty"><strong>Aún no hay vistas</strong><span>Crea vistas para controlar las secciones disponibles.</span></div></div>
          </div>
        </section>
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
      securityView: 'roles',
      roleDetailOpen: false,
      selectedRoleId: 0,
      selectedPermissionIds: [],
      selectedViewIds: [],
      filterText: '',
      catalogTab: 'permissions',
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
        { name: 'Gestión de usuarios', slug: 'usuarios.manage' },
        { name: 'Usuarios Crear', slug: 'usuarios.create' },
        { name: 'Usuarios Editar', slug: 'usuarios.update' },
        { name: 'Usuarios Eliminar', slug: 'usuarios.delete' },
        { name: 'Ventas Lectura', slug: 'ventas.read' },
        { name: 'Ventas Escritura', slug: 'ventas.write' },
        { name: 'Ventas Anular', slug: 'ventas.void' },
        { name: 'Gestión RBAC', slug: 'rbac.manage' }
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
      return this.views.filter((v) => ((v && v.slug) ? v.slug : '').toString().toLowerCase().includes(q) || ((v && v.name) ? v.name : '').toString().toLowerCase().includes(q) || ((v && v.route) ? v.route : '').toString().toLowerCase().includes(q));
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
    openRoleAccess(role) {
      this.selectedRoleId = role.id;
      this.loadSelectedRoleData();
      this.filterText = '';
      this.roleDetailOpen = true;
    },
    backToRoles() {
      this.roleDetailOpen = false;
      this.filterText = '';
    },
    moduleLabel(module) {
      const labels = { dashboard: 'Panel principal', usuarios: 'Usuarios', usuario: 'Usuarios', ventas: 'Ventas', rbac: 'Roles y permisos', empresa: 'Empresa' };
      return labels[module] || String(module || 'Otros').replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
    },
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
.security-page { padding-bottom: 2rem; color: #344054; }
.security-page .card { border: 1px solid #e2e8f0; border-radius: 18px; background: #fff; box-shadow: 0 8px 28px rgba(25, 50, 75, .045); }
.security-hero { margin-bottom: .25rem; }
.security-hero .card-body { padding: 1.25rem 1.5rem; }
.security-hero-head { display: flex; align-items: center; justify-content: space-between; }
.security-main-nav { display: flex; gap: .35rem; width: fit-content; max-width: 100%; margin: 0 0 1.4rem; padding: .3rem; border: 1px solid #dfe7ee; border-radius: 14px; background: #f1f5f8; }
.security-main-nav button { display: inline-flex; align-items: center; gap: .55rem; min-width: 150px; min-height: 44px; padding: .5rem .9rem; border: 0; border-radius: 11px; background: transparent; color: #52677b; font-size: .87rem; font-weight: 800; text-align: left; }
.security-main-nav button i { color: #698196; }
.security-main-nav button.active { background: #fff; color: #087f80; box-shadow: 0 2px 8px rgba(20, 44, 65, .1); }
.security-main-nav button.active i { color: #087f80; }
.security-main-nav button.active small { background: #e5f5f2; color: #087f80; }
.security-setup-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 1.35rem; padding: 1.1rem 1.35rem; border: 1px solid #dcece9; border-radius: 15px; background: #f3faf8; }
.security-section-kicker { margin: 0; color: #07868a; font-size: .68rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.security-setup-copy h2 { margin: .2rem 0 .25rem; color: #17324d; font-size: 1rem; font-weight: 800; }
.security-setup-copy p { margin: 0; color: #66788b; font-size: .84rem; }
.security-btn { display: inline-flex; align-items: center; justify-content: center; gap: .45rem; min-height: 41px; padding: .6rem .9rem; border: 1px solid transparent; border-radius: 11px; font-size: .8rem; font-weight: 800; box-shadow: none; }
.security-btn-primary { background: #07868a; border-color: #07868a; color: #fff; }
.security-btn-primary:hover:not(:disabled) { background: #067579; border-color: #067579; color: #fff; }
.security-btn:disabled { cursor: not-allowed; opacity: .52; }
.security-catalog-section { margin-top: .25rem; }
.security-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.security-section-heading h2 { margin: .18rem 0 .25rem; color: #17324d; font-size: 1.25rem; font-weight: 800; }
.security-section-heading p { margin: 0; color: #66788b; font-size: .86rem; }
.security-catalog-tabs { display: flex; gap: .3rem; width: fit-content; max-width: 100%; margin-bottom: .75rem; padding: .28rem; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #f1f5f9; }
.security-catalog-tabs button { display: inline-flex; align-items: center; gap: .45rem; min-height: 38px; padding: .45rem .75rem; border: 0; border-radius: 9px; background: transparent; color: #617286; font-size: .8rem; font-weight: 750; white-space: nowrap; }
.security-catalog-tabs button.active { background: #fff; color: #087f80; box-shadow: 0 2px 7px rgba(15, 35, 55, .1); }
.security-catalog-card { display: grid; grid-template-columns: minmax(260px, .72fr) minmax(0, 1.28fr); overflow: hidden; }
.security-catalog-form { padding: 1.25rem 1.4rem; border-right: 1px solid #e8edf3; }
.security-catalog-content { min-width: 0; padding: 1.25rem 1.4rem; }
.security-card-title { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; margin-bottom: .9rem; }
.security-card-title h3 { margin: .18rem 0 0; color: #17324d; font-size: 1rem; font-weight: 800; }
.security-form-step { color: #07868a; font-size: .66rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.security-catalog-form > label { display: block; margin: .75rem 0 .32rem; color: #42566b; font-size: .77rem; font-weight: 800; }
.security-input { min-height: 42px; border: 1px solid #dce5ee; border-radius: 10px !important; color: #344054; font-size: .86rem; }
.security-input:focus { border-color: #64bdb2; box-shadow: 0 0 0 3px rgba(8, 134, 138, .1); }
.security-field-hint { display: block; margin: .32rem 0 .65rem; color: #8492a3; font-size: .71rem; line-height: 1.4; }
.security-catalog-form .security-btn { margin-top: .55rem; }
.security-mini-btn, .security-icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 auto; align-items: center; justify-content: center; border: 1px solid #d9defd; border-radius: 10px; background: #eef2ff; color: #3442a8; cursor: pointer; }
.security-mini-btn { width: 30px; height: 30px; }
.security-icon-btn-danger { border-color: #f5b3ad; background: #fff1f0; color: #b42318; }
.security-row-actions { display: inline-flex; align-items: center; gap: .4rem; flex-shrink: 0; }
.security-catalog-list-heading { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-bottom: .35rem; }
.security-catalog-list-heading h3 { margin: 0; color: #263d53; font-size: .88rem; font-weight: 800; }
.security-catalog-list-heading > span { color: #8592a2; font-size: .73rem; }
.security-catalog-content .security-catalog-list { max-height: 390px; margin: 0; padding: 0; overflow-y: auto; border: 0; }
.security-catalog-item { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .7rem .25rem; }
.security-catalog-item + .security-catalog-item { border-top: 1px solid #edf1f5; }
.security-catalog-item-copy { min-width: 0; }
.security-catalog-item-copy strong { display: block; overflow: hidden; color: #24324d; font-size: .86rem; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.security-catalog-item-copy small { display: flex; align-items: center; gap: .4rem; margin-top: .15rem; overflow-wrap: anywhere; color: #718197; font-size: .73rem; }
.security-role-access-count { color: #8090a1 !important; font-size: .69rem !important; }
.security-system-label { display: inline-flex; align-items: center; gap: .25rem; padding: .12rem .38rem; border-radius: 20px; background: #f1f5f9; color: #64748b; font-size: .65rem; font-weight: 700; }
.security-role-item { flex-wrap: wrap; }
.security-role-actions { display: inline-flex; align-items: center; justify-content: flex-end; gap: .4rem; flex-shrink: 0; }
.security-configure-role { display: inline-flex; align-items: center; gap: .38rem; min-height: 34px; padding: .4rem .62rem; border: 1px solid #ccece7; border-radius: 9px; background: #effaf8; color: #087f80; font-size: .72rem; font-weight: 800; white-space: nowrap; }
.security-configure-role:hover { border-color: #91d3c8; background: #e4f6f2; }
.security-list-empty { display: flex; min-height: 145px; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; color: #8190a2; text-align: center; }
.security-list-empty strong { color: #526477; font-size: .86rem; }
.security-list-empty span { font-size: .76rem; }
.security-assignment-card { margin-bottom: 1.5rem; padding: 1.4rem; }
.security-role-context { display: flex; align-items: center; gap: .55rem; margin: -.3rem 0 1rem; padding: .65rem .8rem; border: 1px solid #d9efeb; border-radius: 10px; background: #f2faf8; color: #526f6b; font-size: .8rem; }
.security-role-context > i { color: #07868a; }
.security-role-context strong { color: #087f80; }
.security-back-button { display: inline-flex; align-items: center; gap: .4rem; min-height: 38px; padding: .5rem .75rem; border: 1px solid #dce5ec; border-radius: 10px; background: #fff; color: #52677b; font-size: .78rem; font-weight: 800; }
.security-global-filter { max-width: 540px; margin-bottom: 1rem; }
.security-global-filter label { display: block; margin-bottom: .35rem; color: #42566b; font-size: .77rem; font-weight: 800; }
.security-search-wrap { position: relative; }
.security-search-wrap > i { position: absolute; top: 50%; left: 14px; z-index: 1; transform: translateY(-50%); color: #94a3b8; }
.security-search { padding-left: 40px !important; }
.security-assignment-panels > [class*="col-"] { display: flex; }
.security-panel { display: flex; flex: 1; flex-direction: column; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 14px; background: #fbfcfe; }
.security-panel-head { display: flex; align-items: center; justify-content: space-between; gap: .8rem; padding-bottom: .8rem; border-bottom: 1px solid #e8edf3; }
.security-panel-head > div { display: flex; align-items: center; gap: .65rem; }
.security-panel-icon { display: grid; width: 36px; height: 36px; flex: 0 0 auto; place-items: center; border: 1px solid #ccece7; border-radius: 11px; background: #e9f8f5; color: #087f80; }
.security-panel-head h3 { margin: 0 0 .12rem; color: #17324d; font-size: .93rem; font-weight: 800; }
.security-panel-head small { display: block; color: #748397; font-size: .73rem; }
.security-selection-summary { display: flex; justify-content: space-between; gap: .7rem; padding: .65rem 0 .5rem; color: #738196; font-size: .73rem; }
.security-selection-summary strong { color: #087f80; }
.security-access-list { max-height: 400px; overflow-y: auto; padding: .45rem; border: 1px solid #e6ebf1; border-radius: 11px; background: #fff; }
.security-group + .security-group { margin-top: .55rem; }
.security-group-head { position: sticky; top: -.45rem; z-index: 1; display: flex; align-items: center; justify-content: space-between; margin: 0; padding: .55rem .5rem .4rem; background: #fff; color: #526477; }
.security-group-head strong { font-size: .74rem; letter-spacing: .04em; text-transform: uppercase; }
.security-group-head span { display: inline-grid; min-width: 23px; height: 23px; place-items: center; border-radius: 20px; background: #edf5f5; color: #087f80; font-size: .7rem; font-weight: 800; }
.security-access-row { position: relative; display: flex; align-items: center; gap: .65rem; min-height: 52px; margin: 0; padding: .6rem .5rem; border-top: 1px solid #f0f3f7; border-radius: 8px; cursor: pointer; }
.security-access-row:hover, .security-access-row:has(input:checked) { background: #f0f9f7; }
.security-access-row .form-check-input { width: 16px; height: 16px; flex: 0 0 auto; margin: 0; accent-color: #07868a; }
.security-access-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: .12rem; }
.security-access-copy strong { overflow: hidden; color: #273d53; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }
.security-access-copy small { overflow: hidden; color: #8290a1; font-size: .7rem; text-overflow: ellipsis; white-space: nowrap; }
.security-check-mark { color: #07868a; font-size: .75rem; opacity: 0; }
.security-access-row:has(input:checked) .security-check-mark { opacity: 1; }
.security-note { display: flex; gap: .5rem; margin-top: .7rem; padding: .7rem; border: 1px solid #d8eeea; border-radius: 10px; background: #f1faf8; color: #55736f; font-size: .73rem; line-height: 1.4; }
.security-note i { color: #07868a; }
.security-toast, .security-swal { border: 1px solid #e6ebf3 !important; border-radius: 15px !important; background: #fff !important; box-shadow: 0 18px 48px rgba(15, 23, 42, .16) !important; }
.security-toast { width: min(420px, calc(100vw - 24px)) !important; padding: .9rem 1rem !important; }
.security-toast-title, .security-swal-title { color: #1f2937 !important; font-weight: 800 !important; }
.security-toast-body, .security-swal-body { color: #667085 !important; font-weight: 600 !important; }
.security-toast-progress { background: rgba(8, 134, 138, .25) !important; }
.security-swal { width: min(440px, calc(100vw - 28px)) !important; padding: 1.4rem !important; }
.security-swal-actions { gap: .65rem !important; }
.security-swal-button { min-width: 110px; min-height: 40px; padding: .62rem .9rem; border: 1px solid transparent; border-radius: 11px; font-size: .8rem; font-weight: 800; }
.security-swal-cancel { border-color: #d8e0ec; background: #fff; color: #4b5565; }
.security-swal-confirm-danger { border-color: #b42318; background: #b42318; color: #fff; }
body.enterprise-dark .security-page .card, body.enterprise-dark .security-setup-card, body.enterprise-dark .security-panel, body.enterprise-dark .security-swal, body.enterprise-dark .security-toast { border-color: rgba(82, 99, 128, .75) !important; background: #151e2b !important; color: #dbe4ef; }
body.enterprise-dark .security-main-nav, body.enterprise-dark .security-catalog-tabs { border-color: rgba(82, 99, 128, .75); background: #101827; }
body.enterprise-dark .security-main-nav button, body.enterprise-dark .security-catalog-tabs button { color: #aab8c9; }
body.enterprise-dark .security-main-nav button.active, body.enterprise-dark .security-catalog-tabs button.active { background: #1c2939; color: #7de0d0; }
body.enterprise-dark .security-setup-card { background: #112a2b !important; }
body.enterprise-dark .security-setup-copy h2, body.enterprise-dark .security-section-heading h2, body.enterprise-dark .security-card-title h3, body.enterprise-dark .security-catalog-list-heading h3, body.enterprise-dark .security-catalog-item-copy strong, body.enterprise-dark .security-panel-head h3, body.enterprise-dark .security-access-copy strong { color: #f1f5f9; }
body.enterprise-dark .security-setup-copy p, body.enterprise-dark .security-section-heading p, body.enterprise-dark .security-catalog-item-copy small, body.enterprise-dark .security-panel-head small, body.enterprise-dark .security-access-copy small { color: #9aa8ba; }
body.enterprise-dark .security-catalog-form { border-color: rgba(82, 99, 128, .56); }
body.enterprise-dark .security-catalog-form > label, body.enterprise-dark .security-global-filter label { color: #dbe4ef; }
body.enterprise-dark .security-input { border-color: rgba(82, 99, 128, .86); background: #0f1726; color: #e5e7eb; }
body.enterprise-dark .security-input::placeholder { color: #728198; }
body.enterprise-dark .security-catalog-content .security-catalog-item + .security-catalog-item, body.enterprise-dark .security-access-row { border-color: rgba(82, 99, 128, .42); }
body.enterprise-dark .security-access-list, body.enterprise-dark .security-group-head { border-color: rgba(82, 99, 128, .75); background: #101827; }
body.enterprise-dark .security-access-row:hover, body.enterprise-dark .security-access-row:has(input:checked) { background: rgba(8, 134, 138, .18); }
body.enterprise-dark .security-system-label { background: #253347; color: #cbd5e1; }
body.enterprise-dark .security-role-context, body.enterprise-dark .security-note { border-color: rgba(8, 134, 138, .35); background: rgba(8, 134, 138, .12); color: #a8d8d1; }
body.enterprise-dark .security-role-context strong { color: #7de0d0; }
body.enterprise-dark .security-back-button, body.enterprise-dark .security-swal-cancel { border-color: rgba(82, 99, 128, .78); background: #101827; color: #cbd5e1; }
body.enterprise-dark .security-toast-title, body.enterprise-dark .security-swal-title { color: #f8fafc !important; }
body.enterprise-dark .security-toast-body, body.enterprise-dark .security-swal-body { color: #94a3b8 !important; }
@media (max-width: 991px) {
  .security-catalog-card { grid-template-columns: 1fr; }
  .security-catalog-form { border-right: 0; border-bottom: 1px solid #e8edf3; }
  .security-section-heading { flex-direction: column; }
  .security-section-heading .security-back-button { align-self: flex-start; }
}
@media (max-width: 767px) {
  .security-hero .card-body { padding: 1rem; }
  .security-main-nav { width: 100%; }
  .security-main-nav button { min-width: 0; flex: 1; }
  .security-setup-card { align-items: stretch; flex-direction: column; padding: 1rem; }
  .security-setup-card .security-btn { width: 100%; }
  .security-catalog-tabs { width: 100%; }
  .security-catalog-tabs button { flex: 1; justify-content: center; padding-inline: .5rem; }
  .security-catalog-form, .security-catalog-content { padding: 1rem; }
  .security-catalog-item { align-items: flex-start; flex-wrap: wrap; }
  .security-role-item .security-catalog-item-copy { width: 100%; }
  .security-role-actions { width: 100%; justify-content: flex-start; }
  .security-assignment-card { padding: 1rem; }
  .security-panel-head { align-items: stretch; flex-direction: column; }
  .security-panel-head .security-btn { width: 100%; }
}
</style>
