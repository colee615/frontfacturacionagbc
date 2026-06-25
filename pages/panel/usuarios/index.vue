<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body" class="users-page enterprise-page-shell">
            <section class="enterprise-filter-card users-directory-shell">
               <div class="enterprise-page-header users-page-header">
                  <div>
                     <p class="enterprise-page-kicker">Centro de accesos</p>
                     <h2 class="enterprise-page-title">Gestion de usuarios</h2>
                     <p class="enterprise-page-copy">Administra credenciales, roles y estado operativo en una sola vista ordenada.</p>
                  </div>
                  <div class="users-badge users-badge-soft">
                     <i class="fas fa-users"></i>
                     <span>{{ filteredList.length }} registros</span>
                  </div>
               </div>
               <div class="enterprise-toolbar-row users-topbar">
                  <div class="enterprise-search-field users-search-field">
                     <i class="fas fa-search"></i>
                     <input v-model="search" type="text" class="form-control" placeholder="Buscar por nombre, correo o rol">
                  </div>
                  <div class="enterprise-toolbar-actions users-toolbar-actions">
                     <button v-if="canCreateUsuarios" type="button" class="btn enterprise-btn-soft primary users-toolbar-btn" @click="openCreateModal">
                        <i class="fas fa-plus"></i>
                        <span>Nuevo usuario</span>
                     </button>
                     <button @click="generateReport('excel')" class="btn enterprise-btn-soft users-toolbar-btn">
                        <i class="fas fa-file-excel"></i>
                        <span>Excel</span>
                     </button>
                     <button @click="generateReport('pdf')" class="btn enterprise-btn-soft users-toolbar-btn">
                        <i class="fas fa-file-pdf"></i>
                        <span>PDF</span>
                     </button>
                  </div>
               </div>
            </section>
            <section class="enterprise-content-card users-directory-card">
               <div class="users-card-head users-card-head-clean">
                  <div>
                     <p class="users-kicker mb-2">Directorio</p>
                     <h6 class="mb-1">Usuarios registrados</h6>
                     <p class="mb-0">Consulta rapida del equipo con sus permisos y estado actual.</p>
                  </div>
               </div>
               <div v-if="filteredList.length" class="table-wrap users-table-wrap enterprise-table-wrap">
                  <table class="users-table enterprise-table">
                     <thead>
                        <tr>
                           <th>
                              <span class="head-label">
                                 <i class="fas fa-hashtag"></i>
                                 <span>#</span>
                              </span>
                           </th>
                           <th>
                              <span class="head-label">
                                 <i class="fas fa-user"></i>
                                 <span>Nombre</span>
                              </span>
                           </th>
                           <th>
                              <span class="head-label">
                                 <i class="fas fa-envelope"></i>
                                 <span>Email</span>
                              </span>
                           </th>
                           <th>
                              <span class="head-label">
                                 <i class="fas fa-user-tag"></i>
                                 <span>Rol</span>
                              </span>
                           </th>
                           <th>
                              <span class="head-label">
                                 <i class="fas fa-toggle-on"></i>
                                 <span>Estado</span>
                              </span>
                           </th>
                           <th>
                              <span class="head-label">
                                 <i class="fas fa-cog"></i>
                                 <span>Acciones</span>
                              </span>
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="(m, i) in paginatedList" :key="m.id">
                           <td>
                              <strong class="users-row-index">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</strong>
                           </td>
                           <td>
                              <div class="users-name-block">
                                 <strong>{{ m.name }}</strong>
                              </div>
                           </td>
                           <td>
                              <span class="users-email">{{ m.email }}</span>
                           </td>
                           <td>
                              <div class="users-role-list">
                                 <span v-for="role in userRoles(m)" :key="role.id || role.slug" class="users-role-chip">
                                    <i class="fas fa-user-tag"></i>
                                    {{ role.name || role.slug }}
                                 </span>
                                 <span v-if="!userRoles(m).length" class="users-role-empty">Sin rol</span>
                              </div>
                           </td>
                           <td>
                              <span class="users-state" :class="estadoBadgeClass(m.estado)">
                                 {{ estadoLabel(m.estado) }}
                              </span>
                           </td>
                           <td>
                              <div class="users-action-group">
                                 <button v-if="canUpdateUsuarios" type="button" class="btn users-icon-btn users-icon-btn-info" @click="openEditModal(m)">
                                    <i class="fas fa-pen"></i>
                                 </button>
                                 <button v-if="canDeleteUsuarios && m.estado === 1" type="button" @click="Eliminar(m.id)"
                                    class="btn users-icon-btn users-icon-btn-danger">
                                    <i class="fas fa-trash"></i>
                                 </button>
                                 <button v-if="canUpdateUsuarios && m.estado === 2" type="button" @click="Activar(m.id)"
                                    class="btn users-icon-btn users-icon-btn-success">
                                    <i class="fas fa-check"></i>
                                 </button>
                              </div>
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  <div class="users-table-footer">
                     <p class="footer-copy">
                        Mostrando {{ rangeStart }} a {{ rangeEnd }} de {{ filteredList.length }} usuarios
                     </p>

                     <div class="users-pager">
                        <button class="pager-btn" type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                           <i class="fas fa-angle-left"></i>
                        </button>

                        <button
                           v-for="page in visiblePages"
                           :key="page"
                           type="button"
                           class="pager-btn"
                           :class="{ active: page === currentPage }"
                           @click="changePage(page)"
                        >
                           {{ page }}
                        </button>

                        <button class="pager-btn" type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                           <i class="fas fa-angle-right"></i>
                        </button>
                     </div>
                  </div>
               </div>

               <div v-else class="empty-state users-empty-state">
                  <h3>Sin resultados</h3>
                  <p>No se encontraron usuarios con ese criterio de busqueda.</p>
               </div>
            </section>
            <div v-if="showUserModal" class="users-modal-backdrop" @click.self="closeUserModal">
               <div class="users-modal" role="dialog" aria-modal="true" aria-labelledby="users-modal-title">
                  <div class="users-modal-header">
                     <div class="users-modal-title-block">
                        <span class="users-modal-icon">
                           <i :class="isEditMode ? 'fas fa-user-edit' : 'fas fa-user-plus'"></i>
                        </span>
                        <div>
                           <p class="users-kicker mb-1">{{ isEditMode ? 'Editar acceso' : 'Nuevo acceso' }}</p>
                           <h5 id="users-modal-title" class="mb-0">{{ isEditMode ? 'Actualizar usuario' : 'Crear usuario' }}</h5>
                        </div>
                     </div>
                     <button type="button" class="users-modal-close" @click="closeUserModal" aria-label="Cerrar">
                        <i class="fas fa-times"></i>
                     </button>
                  </div>

                  <div class="users-modal-body">
                     <div class="users-form-note">
                        <i class="fas fa-info-circle"></i>
                        <span>{{ isEditMode ? 'La contraseÃ±a solo se cambia si escribes una nueva.' : 'Completa los datos obligatorios para registrar el acceso.' }}</span>
                     </div>

                     <div class="row g-3">
                        <div class="form-group col-12">
                           <label for="modal-user-name">Nombre del usuario <span>*</span></label>
                           <div class="users-field">
                              <i class="fas fa-user"></i>
                              <input id="modal-user-name" v-model="userForm.name" type="text" class="form-control" placeholder="Ej. Juan Perez">
                           </div>
                        </div>
                        <div class="form-group col-12">
                           <label for="modal-user-email">Correo electronico <span>*</span></label>
                           <div class="users-field">
                              <i class="fas fa-envelope"></i>
                              <input id="modal-user-email" v-model="userForm.email" type="email" class="form-control" placeholder="usuario@dominio.com">
                           </div>
                        </div>
                        <div class="form-group col-12">
                           <label for="modal-user-role">Rol del usuario <span>*</span></label>
                           <div class="users-field">
                              <i class="fas fa-user-tag"></i>
                              <select id="modal-user-role" v-model.number="userForm.role_id" class="form-control users-select">
                                 <option :value="null" disabled>Seleccione un rol</option>
                                 <option v-for="role in rolesCatalog" :key="role.id" :value="role.id">
                                    {{ role.name }} ({{ role.slug }})
                                 </option>
                              </select>
                           </div>
                        </div>
                        <div class="form-group col-12">
                           <label for="modal-user-password">ContraseÃ±a <span v-if="!isEditMode">*</span></label>
                           <div class="users-field">
                              <i class="fas fa-lock"></i>
                              <input id="modal-user-password" v-model="userForm.password" type="password" class="form-control" :placeholder="isEditMode ? 'Dejar en blanco para conservarla' : 'ContraseÃ±a de acceso'">
                           </div>
                        </div>
                     </div>
                  </div>

                  <div class="users-modal-footer">
                     <button type="button" class="btn users-modal-secondary" @click="closeUserModal" :disabled="savingUser">
                        Cancelar
                     </button>
                     <button type="button" class="btn users-modal-primary" @click="saveUser" :disabled="savingUser">
                        <i v-if="savingUser" class="fas fa-spinner fa-spin"></i>
                        <i v-else :class="isEditMode ? 'fas fa-save' : 'fas fa-plus'"></i>
                        <span>{{ savingUser ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear usuario' }}</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </AdminTemplate>
   </div>
</template>
<script>
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';

export default {
   name: "IndexPage",
   head() {

      return {
         title: this.modulo,
      };

   },
   data() {
      return {
         load: true,
         list: [],
         rolesCatalog: [],
         search: '',
         apiUrl: 'usuarios',
         page: 'Panel',
         modulo: 'Usuarios',
         url_nuevo: '/panel/usuarios/nuevo',
         url_editar: '/panel/usuarios/editar/',
         currentPage: 1,
         itemsPerPage: 14,
         showUserModal: false,
         userFormMode: 'create',
         savingUser: false,
         userForm: {
            id: null,
            name: '',
            email: '',
            role_id: null,
            password: '',
         }
      };
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      permissions() {
         return this.$store.state.auth.permissions || [];
      },
      canCreateUsuarios() {
         return this.permissions.includes('usuarios.manage') || this.permissions.includes('usuarios.create');
      },
      canUpdateUsuarios() {
         return this.permissions.includes('usuarios.manage') || this.permissions.includes('usuarios.update');
      },
      canDeleteUsuarios() {
         return this.permissions.includes('usuarios.manage') || this.permissions.includes('usuarios.delete');
      },
      canManageUsuarios() {
         return this.permissions.includes('usuarios.manage');
      },
      isEditMode() {
         return this.userFormMode === 'edit';
      },
      activeCount() {
         return this.list.filter(item => item.estado === 1).length;
      },
      inactiveCount() {
         return this.list.filter(item => item.estado === 2).length;
      },
      filteredList() {
         const term = (this.search || '').toString().toLowerCase();
         return this.list.filter(item => {
            const name = ((item && item.name) ? item.name : '').toString().toLowerCase();
            const email = ((item && item.email) ? item.email : '').toString().toLowerCase();
            const roles = this.userRoles(item).map(role => `${role.name || ''} ${role.slug || ''}`).join(' ').toLowerCase();
            return name.includes(term) || email.includes(term) || roles.includes(term);
         });
      },
      totalPages() {
         return Math.max(1, Math.ceil(this.filteredList.length / this.itemsPerPage));
      },
      rangeStart() {
         if (!this.filteredList.length) {
            return 0;
         }

         return ((this.currentPage - 1) * this.itemsPerPage) + 1;
      },
      rangeEnd() {
         return Math.min(this.currentPage * this.itemsPerPage, this.filteredList.length);
      },
      paginatedList() {
         const start = (this.currentPage - 1) * this.itemsPerPage;
         const end = start + this.itemsPerPage;
         return this.filteredList.slice(start, end);
      },
      visiblePages() {
         const total = this.totalPages;
         const current = this.currentPage;
         const start = Math.max(1, current - 2);
         const end = Math.min(total, start + 4);
         const pages = [];

         for (let page = start; page <= end; page += 1) {
            pages.push(page);
         }

         return pages;
      }
   },
   watch: {
      search() {
         this.currentPage = 1;
      },
      filteredList() {
         if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
         }
      }
   },
   methods: {
      emptyUserForm() {
         return {
            id: null,
            name: '',
            email: '',
            role_id: null,
            password: '',
         };
      },
      resetUserForm() {
         this.userForm = this.emptyUserForm();
      },
      openCreateModal() {
         if (!this.canCreateUsuarios) return;
         this.userFormMode = 'create';
         this.resetUserForm();
         this.showUserModal = true;
      },
      async openEditModal(user) {
         if (!this.canUpdateUsuarios || !user) return;
         this.userFormMode = 'edit';
         this.userForm = {
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            role_id: this.primaryRoleId(user),
            password: '',
         };
         this.showUserModal = true;

         try {
            this.savingUser = true;
            const data = await this.GET_DATA(this.apiUrl + "/" + user.id);
            this.userForm = {
               ...this.userForm,
               ...data,
               role_id: this.primaryRoleId(data),
               password: '',
            };
         } catch (e) {
            console.error(e);
         } finally {
            this.savingUser = false;
         }
      },
      closeUserModal() {
         if (this.savingUser) return;
         this.showUserModal = false;
         this.resetUserForm();
      },
      validateUserForm() {
         const errors = [];
         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         const name = this.userForm.name ? this.userForm.name.trim() : '';
         const email = this.userForm.email ? this.userForm.email.trim() : '';
         const password = this.userForm.password ? this.userForm.password.trim() : '';

         if (!name || name.length > 255) {
            errors.push('El nombre del usuario es obligatorio.');
         }
         if (!email || !emailPattern.test(email) || email.length > 255) {
            errors.push('El correo electronico del usuario no es valido.');
         }
         if (!this.userForm.role_id) {
            errors.push('Seleccione un rol para el usuario.');
         }
         if (!this.isEditMode && !password) {
            errors.push('La contraseÃ±a del usuario es obligatoria.');
         }

         return errors;
      },
      userPayload() {
         const payload = {
            name: this.userForm.name ? this.userForm.name.trim() : '',
            email: this.userForm.email ? this.userForm.email.trim() : '',
            role_ids: this.userForm.role_id ? [this.userForm.role_id] : [],
         };
         const password = this.userForm.password ? this.userForm.password.trim() : '';

         if (!this.isEditMode || password) {
            payload.password = password;
         }

         return payload;
      },
      showFormErrors(errors) {
         this.notify({
            icon: 'error',
            title: 'Datos incompletos',
            text: 'Revisa los campos marcados antes de continuar.',
            html: `<ul class="users-toast-list">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
            timer: 4200,
         });
      },
      notify({ icon = 'success', title = '', text = '', html = '', timer = 2400 }) {
         return this.$swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            icon,
            title,
            text,
            html,
            timer,
            timerProgressBar: true,
            showClass: {
               popup: 'animate__animated animate__fadeInRight'
            },
            hideClass: {
               popup: 'animate__animated animate__fadeOutRight'
            },
            customClass: {
               popup: 'users-toast',
               title: 'users-toast-title',
               htmlContainer: 'users-toast-body',
               timerProgressBar: 'users-toast-progress'
            }
         });
      },
      confirmAction({ icon = 'warning', title = '', text = '', confirmText = 'Confirmar', confirmClass = 'users-swal-confirm' }) {
         return this.$swal.fire({
            toast: false,
            position: 'center',
            showConfirmButton: true,
            showCancelButton: true,
            reverseButtons: true,
            icon,
            title,
            text,
            confirmButtonText: confirmText,
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
               popup: 'users-swal',
               title: 'users-swal-title',
               htmlContainer: 'users-swal-body',
               confirmButton: `users-swal-button ${confirmClass}`,
               cancelButton: 'users-swal-button users-swal-cancel',
               actions: 'users-swal-actions'
            }
         });
      },
      showBackendError(e, fallback) {
         const backendErrors = e.response?.data?.errors;
         const backendMessage = e.response?.data?.message || e.response?.data?.error;

         if (backendErrors && typeof backendErrors === 'object') {
            const items = Object.values(backendErrors).flat().map(err => `<li>${err}</li>`).join('');
            this.notify({
               showConfirmButton: false,
               icon: 'error',
               title: fallback,
               text: 'El servidor devolvio observaciones.',
               html: `<ul class="users-toast-list">${items}</ul>`,
               timer: 5200,
            });
            return;
         }

         this.notify({
            icon: 'error',
            title: backendMessage || fallback,
            text: 'Intenta nuevamente o verifica los datos enviados.',
            timer: 4200,
         });
      },
      async refreshUsers() {
         const data = await this.GET_DATA(this.apiUrl);
         this.list = data;
      },
      async refreshRoles() {
         const roles = await this.GET_DATA('rbac/roles');
         this.rolesCatalog = Array.isArray(roles) ? roles : [];
      },
      userRoles(user) {
         return Array.isArray(user && user.roles) ? user.roles : [];
      },
      primaryRoleId(user) {
         const roles = this.userRoles(user);
         if (roles.length && roles[0].id) {
            return roles[0].id;
         }
         return null;
      },
      async saveUser() {
         if (this.isEditMode && !this.canUpdateUsuarios) return;
         if (!this.isEditMode && !this.canCreateUsuarios) return;

         const errors = this.validateUserForm();
         if (errors.length) {
            this.showFormErrors(errors);
            return;
         }

         this.savingUser = true;
         try {
            const payload = this.userPayload();

            if (this.isEditMode) {
               await this.$admin.$put(this.apiUrl + "/" + this.userForm.id, payload);
            } else {
               await this.$admin.$post(this.apiUrl, payload);
            }

            await this.refreshUsers();
            this.notify({
               icon: 'success',
               title: this.isEditMode ? 'Usuario actualizado' : 'Usuario creado',
               text: this.isEditMode ? 'Los datos y el rol quedaron guardados.' : 'El nuevo acceso ya esta disponible.',
            });
            this.showUserModal = false;
            this.resetUserForm();
         } catch (e) {
            console.error(e);
            this.showBackendError(e, this.isEditMode ? 'No se pudo actualizar el usuario' : 'No se pudo crear el usuario');
         } finally {
            this.savingUser = false;
         }
      },
      estadoLabel(estado) {
         if (estado === 1) return 'Activo';
         if (estado === 2) return 'Inactivo';
         return 'Desconocido';
      },
      estadoBadgeClass(estado) {
         if (estado === 1) return 'activo';
         if (estado === 2) return 'inactivo';
         return 'desconocido';
      },
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async EliminarItem(id) {
         if (!this.canDeleteUsuarios) return;
         this.load = true;
         try {
            const res = await this.$admin.$delete(this.apiUrl + "/" + id);

            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0];
            });

            this.notify({
               icon: 'success',
               title: 'Usuario desactivado',
               text: 'El acceso fue retirado del listado activo.',
            });
         } catch (e) {
            this.notify({
               icon: 'error',
               title: 'No se pudo desactivar',
               text: 'El usuario no fue modificado. Intenta nuevamente.',
               timer: 4200,
            });
         } finally {
            this.load = false;
         }
      },
      Eliminar(id) {
         if (!this.canDeleteUsuarios) return;
         let self = this;
         this.confirmAction({
            icon: 'warning',
            title: 'Desactivar usuario',
            text: 'El usuario perdera el acceso hasta que vuelvas a activarlo.',
            confirmText: 'Desactivar',
            confirmClass: 'users-swal-confirm-danger'
         }).then(async (result) => {
            if (result.isConfirmed) {
               await self.EliminarItem(id);
            }
         });
      },
      async ActivarItem(id) {
         if (!this.canUpdateUsuarios) return;
         this.load = true;
         try {
            const res = await this.$admin.$put(this.apiUrl + "/activar/" + id);
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0];
            });
            this.notify({
               icon: 'success',
               title: 'Usuario activado',
               text: 'El acceso vuelve a estar disponible.',
            });
         } catch (e) {
            this.notify({
               icon: 'error',
               title: 'No se pudo activar',
               text: 'El usuario no fue modificado. Intenta nuevamente.',
               timer: 4200,
            });
         } finally {
            this.load = false;
         }
      },
      Activar(id) {
         if (!this.canUpdateUsuarios) return;
         this.confirmAction({
            icon: 'warning',
            title: 'Activar usuario',
            text: 'El usuario recuperara el acceso al sistema.',
            confirmText: 'Activar',
            confirmClass: 'users-swal-confirm-success'
         }).then(async (result) => {
            if (result.isConfirmed) {
               await this.ActivarItem(id);
            }
         });
      },
      generateReport(format) {
         const data = this.filteredList.map((item, index) => ({
            '#': index + 1,
            'Nombre': item.name,
            'Email': item.email,
            'Estado': item.estado === 1 ? 'Activo' : item.estado === 2 ? 'Inactivo' : 'Desconocido'
         }));

         switch (format) {
            case 'excel':
               this.generateExcel(data);
               break;
            case 'pdf':
               this.generatePDF(data);
               break;
         }
      },
      generateExcel(data) {
         const ws = utils.json_to_sheet(data);
         const wsOpts = {
            header: ['#', 'Nombre', 'Email', 'Estado'],
            font: {
               name: 'Arial',
               sz: 12,
               bold: true
            },
            fill: {
               fgColor: { rgb: "FFFF00" }
            },
            border: {
               top: { style: 'thin', color: { rgb: '000000' } },
               bottom: { style: 'thin', color: { rgb: '000000' } },
               left: { style: 'thin', color: { rgb: '000000' } },
               right: { style: 'thin', color: { rgb: '000000' } }
            }
         };

         ws['!cols'] = [
            { wpx: 50 },
            { wpx: 150 },
            { wpx: 200 },
            { wpx: 100 }
         ];

         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, "usuarios");

         writeFile(wb, "Usuarios.xlsx");
      },
      generatePDF(data) {
         const doc = new jsPDF();
         const tableColumn = ['#', 'Nombre', 'Email', 'Estado'];
         const tableRows = data.map(item => [
            item['#'],
            item['Nombre'],
            item['Email'],
            item['Estado']
         ]);

         doc.setFontSize(18);
         doc.text('Reporte de Usuarios', 14, 22);

         autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            styles: {
               cellPadding: 5,
               fontSize: 6,
               valign: 'middle',
               overflow: 'linebreak',
               fillColor: [255, 255, 255],
               textColor: [0, 0, 0],
               lineColor: [44, 62, 80],
               lineWidth: 0.75
            },
            headStyles: {
               fillColor: [44, 62, 80],
               textColor: [255, 255, 255],
               fontSize: 6,
               fontStyle: 'bold'
            },
            footStyles: {
               fillColor: [44, 62, 80],
               textColor: [255, 255, 255],
               fontSize: 6,
               fontStyle: 'bold'
            },
            theme: 'grid'
         });

         doc.save('Usuarios.pdf');
      },
      changePage(page) {
         if (page < 1 || page > this.totalPages) {
            return;
         }

         this.currentPage = page;
      }
   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await Promise.all([
               this.GET_DATA(this.apiUrl),
               this.GET_DATA('rbac/roles')
            ]).then((v) => {
               this.list = Array.isArray(v[0]) ? v[0] : [];
               this.rolesCatalog = Array.isArray(v[1]) ? v[1] : [];
            })
         } catch (e) {

         } finally {
            this.load = false
         }
      });
   },
};
</script>
<style>
.users-page {
   color: #344054;
}

.users-directory-shell {
   padding: 1.1rem 1.15rem;
}

.users-directory-card {
   padding: 1rem;
}

.users-page-header {
   margin-bottom: 0.95rem;
}

.users-badge-soft {
   background: #f4f7ff;
   border-color: #dbe4ff;
   color: #2f57b8;
}

.users-topbar {
   align-items: center;
}

.users-toolbar-actions {
   justify-content: flex-end;
}

.users-toolbar-btn {
   min-width: 132px;
}

.users-card-head-clean {
   margin-bottom: 1rem;
}

.users-card-head-clean .users-kicker {
   color: #8f9bb2;
   font-size: 0.76rem;
   letter-spacing: 0.2em;
}

.users-hero,
.users-card {
   border-radius: 18px;
   overflow: hidden;
}

.users-hero {
   background: rgba(255, 255, 255, 0.98);
}

.users-hero .card-body,
.users-card .card-body {
   padding: 1.55rem 1.65rem;
}

.users-hero-head {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
}

.users-heading {
   display: flex;
   align-items: flex-start;
   gap: 1rem;
   min-width: 0;
}

.users-heading-icon {
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

.users-kicker {
   color: #98a2b3;
   font-size: 0.72rem;
   font-weight: 800;
   letter-spacing: 0.16em;
   text-transform: uppercase;
}

.users-title {
   color: #1f2937;
   font-size: 1.35rem;
   font-weight: 800;
}

.users-subtitle {
   color: #667085;
   max-width: 720px;
   font-size: 0.96rem;
}

.users-badge {
   display: inline-flex;
   align-items: center;
   gap: 0.55rem;
   padding: 0.72rem 0.95rem;
   border-radius: 999px;
   background: #f8fafc;
   border: 1px solid #e6ebf3;
   color: #4b5565;
   font-weight: 800;
   white-space: nowrap;
}

.users-stat {
   min-height: 94px;
   padding: 1rem 1.1rem;
   border-radius: 16px;
   background: #f8fafc;
   border: 1px solid #e6ebf3;
   display: flex;
   flex-direction: column;
   justify-content: center;
}

.users-stat-label {
   display: block;
   color: #667085;
   font-size: 0.78rem;
   font-weight: 700;
   margin-bottom: 0.45rem;
}

.users-stat strong {
   color: #1f2937;
   font-size: 1.35rem;
   font-weight: 800;
}

.users-card-head {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding-bottom: 1.1rem;
   margin-bottom: 1.1rem;
   border-bottom: 1px solid rgba(230, 235, 243, 0.95);
}

.users-card-head h6 {
   color: #1f2937;
   font-size: 1rem;
   font-weight: 800;
}

.users-card-head p {
   color: #667085;
   font-size: 0.88rem;
}

.users-toolbar {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   margin-bottom: 1.2rem;
   flex-wrap: wrap;
}

.users-search-wrap {
   position: relative;
   flex: 1 1 420px;
}

.users-search-wrap i {
   position: absolute;
   left: 15px;
   top: 50%;
   transform: translateY(-50%);
   color: #94a3b8;
   z-index: 2;
}

.users-search {
   height: 46px;
   padding-left: 44px !important;
   border-radius: 14px !important;
   font-size: 0.92rem;
}

.users-actions {
   display: flex;
   gap: 0.55rem;
   flex-wrap: wrap;
}

.users-btn {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 0.48rem;
   min-height: 44px;
   padding: 0.72rem 1rem;
   border-radius: 14px;
   border: 1px solid transparent;
   font-size: 0.78rem;
   font-weight: 800;
   letter-spacing: 0;
   text-transform: uppercase;
   box-shadow: none;
   transition: all 0.18s ease;
}

.users-btn:hover {
   transform: translateY(-1px);
}

.users-btn-primary {
   background: #1f2937;
   color: #fff;
   border-color: rgba(31, 41, 55, 0.16);
}

.users-btn-success {
   background: #fff7df;
   color: #8a6100;
   border-color: #f6d77a;
}

.users-btn-danger {
   background: #fff1f0;
   color: #b42318;
   border-color: #f5b3ad;
}

.users-table-wrap {
   border: 1px solid #edf1f6;
   border-radius: 16px;
   overflow: hidden;
   background: #ffffff;
}

.users-table {
   width: 100%;
   min-width: 1040px;
   border-collapse: collapse;
   background: #fff;
}

.users-table thead th {
   padding: 0.95rem 0.9rem;
   text-align: left;
   font-size: 0.83rem;
   font-weight: 700;
   color: #495468;
   background: linear-gradient(180deg, #ffffff 0%, #fafbfd 100%);
   border-bottom: 1px solid #edf1f6;
}

.head-label {
   display: inline-flex;
   align-items: center;
   gap: 0.5rem;
}

.head-label i {
   color: #7d8798;
   font-size: 0.95rem;
}

.users-table tbody td {
   padding: 1rem 0.9rem;
   border-bottom: 1px solid #edf1f6;
   color: #33415c;
   vertical-align: middle;
}

.users-table tbody tr:last-child td {
   border-bottom: 0;
}

.users-table tbody tr:hover {
   background: #fbfcff;
}

.users-row-index {
   color: #667085;
   font-weight: 700;
}

.users-name-block {
   display: flex;
   flex-direction: column;
   gap: 0.18rem;
}

.users-name-block strong {
   color: #24324d !important;
   font-size: 0.93rem;
   font-weight: 800;
}

.users-email {
   color: #4b5565 !important;
   font-size: 0.92rem;
   font-weight: 600;
}

.users-role-list {
   display: flex;
   align-items: center;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.users-role-chip {
   display: inline-flex;
   align-items: center;
   gap: 0.38rem;
   min-height: 30px;
   padding: 0.32rem 0.62rem;
   border-radius: 999px;
   background: #eef2ff;
   border: 1px solid #dfe5ff;
   color: #3442a8;
   font-size: 0.76rem;
   font-weight: 800;
   white-space: nowrap;
}

.users-role-chip i {
   font-size: 0.72rem;
}

.users-role-empty {
   color: #98a2b3 !important;
   font-size: 0.82rem;
   font-weight: 700;
}

.users-state {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   min-width: 78px;
   padding: 0.38rem 0.7rem;
   border-radius: 999px;
   border: 1px solid transparent;
   font-size: 0.78rem;
   font-weight: 800;
   letter-spacing: 0;
   white-space: nowrap;
}

.users-state.activo {
   background: #ecfdf3;
   color: #067647 !important;
   border-color: #abefc6;
}

.users-state.inactivo {
   background: #fff5f5;
   color: #b42318 !important;
   border-color: #fecdc9;
}

.users-state.desconocido {
   background: #f1f5f9;
   color: #475569 !important;
   border-color: #e2e8f0;
}

.users-action-group {
   display: flex;
   gap: 0.5rem;
   flex-wrap: wrap;
   justify-content: flex-end;
}

.users-icon-btn {
   width: 36px;
   height: 36px;
   border-radius: 12px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   border: 1px solid transparent;
   box-shadow: none;
   transition: all 0.18s ease;
}

.users-icon-btn:hover {
   transform: translateY(-1px);
}

.users-icon-btn-info {
   background: #eef2ff;
   border-color: #d9defd;
   color: #3442a8;
}

.users-icon-btn-danger {
   background: #fff1f0;
   border-color: #f5b3ad;
   color: #b42318;
}

.users-icon-btn-success {
   background: #ecfdf3;
   border-color: #abefc6;
   color: #067647;
}

.users-empty {
   color: #7b8aa3;
   font-weight: 700;
}

.users-empty-state {
   padding: 1.8rem 1rem;
}

.users-empty-state h3 {
   margin: 0;
   color: #1d3360;
   font-size: 1.7rem;
   font-weight: 800;
}

.users-empty-state p {
   margin: 0.45rem 0 0;
   color: #6f7c92;
}

.users-table-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 0.95rem 1rem;
   border-top: 1px solid #edf1f6;
   background: #fff;
}

.footer-copy {
   margin: 0;
   color: #6f7c92;
   font-size: 0.9rem;
}

.users-pager {
   display: flex;
   align-items: center;
   gap: 0.45rem;
}

.pager-btn {
   min-width: 36px;
   height: 36px;
   padding: 0 0.7rem;
   border: 1px solid #e5eaf2;
   border-radius: 8px;
   background: #fff;
   color: #627089;
   font-weight: 700;
   transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.pager-btn:hover:not(:disabled) {
   transform: translateY(-1px);
   border-color: #c8d7ee;
   box-shadow: 0 8px 16px rgba(29, 56, 104, 0.08);
}

.pager-btn.active {
   border-color: #ff6f6f;
   color: #e04f4f;
   box-shadow: inset 0 0 0 1px rgba(224, 79, 79, 0.08);
}

.pager-btn:disabled {
   opacity: 0.45;
   cursor: not-allowed;
}

.users-modal-backdrop {
   position: fixed;
   inset: 0;
   z-index: 2050;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 1.25rem;
   background: rgba(15, 23, 42, 0.48);
   backdrop-filter: blur(8px);
}

.users-modal {
   width: min(100%, 560px);
   border-radius: 22px;
   background: #ffffff;
   border: 1px solid rgba(215, 222, 235, 0.95);
   box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
   overflow: hidden;
}

.users-modal-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 1.25rem 1.35rem;
   background: #f8fafc;
   border-bottom: 1px solid #e6ebf3;
}

.users-modal-title-block {
   display: flex;
   align-items: center;
   gap: 0.85rem;
   min-width: 0;
}

.users-modal-title-block h5 {
   color: #1f2937;
   font-size: 1.1rem;
   font-weight: 800;
}

.users-modal-icon {
   width: 44px;
   height: 44px;
   border-radius: 15px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   background: #eef2ff;
   color: #5967d8;
   border: 1px solid #dfe5ff;
   flex-shrink: 0;
}

.users-modal-close {
   width: 38px;
   height: 38px;
   border-radius: 12px;
   border: 1px solid #e6ebf3;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   background: #ffffff;
   color: #667085;
   transition: all 0.18s ease;
}

.users-modal-close:hover {
   background: #fff1f0;
   border-color: #fecdc9;
   color: #b42318;
}

.users-modal-body {
   padding: 1.35rem;
}

.users-form-note {
   display: flex;
   align-items: flex-start;
   gap: 0.6rem;
   padding: 0.85rem 0.95rem;
   margin-bottom: 1.15rem;
   border-radius: 14px;
   background: #f8fafc;
   border: 1px solid #e6ebf3;
   color: #667085;
   font-size: 0.88rem;
   font-weight: 650;
}

.users-form-note i {
   color: #5967d8;
   margin-top: 0.16rem;
}

.users-modal label {
   color: #344054;
   font-size: 0.83rem;
   font-weight: 800;
   margin-bottom: 0.45rem;
}

.users-modal label span {
   color: #b42318;
}

.users-field {
   position: relative;
}

.users-field i {
   position: absolute;
   left: 14px;
   top: 50%;
   transform: translateY(-50%);
   z-index: 2;
   color: #98a2b3;
   font-size: 0.9rem;
}

.users-field .form-control {
   height: 46px;
   padding-left: 42px !important;
   border-radius: 14px !important;
   font-size: 0.92rem;
}

.users-field .users-select {
   appearance: auto;
   padding-right: 1.95rem !important;
}

.users-modal-footer {
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 0.75rem;
   padding: 1rem 1.35rem 1.25rem;
   background: #ffffff;
   border-top: 1px solid #eef2f7;
}

.users-modal-secondary,
.users-modal-primary {
   min-height: 44px;
   border-radius: 14px;
   padding: 0.72rem 1rem;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 0.48rem;
   font-size: 0.82rem;
   font-weight: 800;
   box-shadow: none;
}

.users-modal-secondary {
   background: #ffffff;
   border: 1px solid #d8e0ec;
   color: #4b5565;
}

.users-modal-primary {
   background: #1f2937;
   border: 1px solid rgba(31, 41, 55, 0.16);
   color: #ffffff;
}

.users-modal-secondary:disabled,
.users-modal-primary:disabled {
   opacity: 0.72;
   cursor: not-allowed;
}

.users-toast {
   width: min(420px, calc(100vw - 24px)) !important;
   padding: 0.95rem 1rem !important;
   border-radius: 16px !important;
   background: #ffffff !important;
   border: 1px solid #e6ebf3 !important;
   box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16) !important;
}

.users-toast-title {
   color: #1f2937 !important;
   font-size: 0.95rem !important;
   font-weight: 800 !important;
   line-height: 1.25 !important;
}

.users-toast-body {
   color: #667085 !important;
   font-size: 0.86rem !important;
   font-weight: 600 !important;
   margin-top: 0.25rem !important;
}

.users-toast-list {
   margin: 0.4rem 0 0 !important;
   padding-left: 1.05rem !important;
   text-align: left !important;
}

.users-toast-list li + li {
   margin-top: 0.25rem;
}

.users-toast-progress {
   background: rgba(89, 103, 216, 0.22) !important;
}

.users-swal {
   width: min(440px, calc(100vw - 28px)) !important;
   padding: 1.5rem !important;
   border-radius: 20px !important;
   background: #ffffff !important;
   border: 1px solid #e6ebf3 !important;
   box-shadow: 0 28px 80px rgba(15, 23, 42, 0.22) !important;
}

.users-swal-title {
   color: #1f2937 !important;
   font-size: 1.15rem !important;
   font-weight: 800 !important;
}

.users-swal-body {
   color: #667085 !important;
   font-size: 0.92rem !important;
   font-weight: 600 !important;
}

.users-swal-actions {
   gap: 0.7rem !important;
   margin-top: 1.25rem !important;
}

.users-swal-button {
   min-width: 116px;
   min-height: 42px;
   border-radius: 13px;
   border: 1px solid transparent;
   padding: 0.68rem 1rem;
   font-size: 0.82rem;
   font-weight: 800;
}

.users-swal-cancel {
   background: #ffffff;
   border-color: #d8e0ec;
   color: #4b5565;
}

.users-swal-confirm,
.users-swal-confirm-danger,
.users-swal-confirm-success {
   color: #ffffff;
}

.users-swal-confirm {
   background: #5967d8;
   border-color: #5967d8;
}

.users-swal-confirm-danger {
   background: #b42318;
   border-color: #b42318;
}

.users-swal-confirm-success {
   background: #067647;
   border-color: #067647;
}

body.enterprise-dark .users-page .users-hero,
body.enterprise-dark .users-page .users-card,
body.enterprise-dark .users-modal {
   background: #151e2b !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
   box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25) !important;
}

body.enterprise-dark .users-title,
body.enterprise-dark .users-card-head h6,
body.enterprise-dark .users-modal-title-block h5,
body.enterprise-dark .users-stat strong,
body.enterprise-dark .users-name-block strong {
   color: #f8fafc !important;
}

body.enterprise-dark .users-subtitle,
body.enterprise-dark .users-card-head p,
body.enterprise-dark .users-stat-label,
body.enterprise-dark .users-email,
body.enterprise-dark .users-row-index,
body.enterprise-dark .users-role-empty,
body.enterprise-dark .users-empty {
   color: #94a3b8 !important;
}

body.enterprise-dark .users-kicker {
   color: #aab4c6 !important;
}

body.enterprise-dark .users-heading-icon,
body.enterprise-dark .users-modal-icon {
   background: rgba(89, 103, 216, 0.18) !important;
   border-color: rgba(129, 140, 248, 0.28) !important;
   color: #c7d2fe !important;
}

body.enterprise-dark .users-badge,
body.enterprise-dark .users-stat,
body.enterprise-dark .users-form-note {
   background: #101827 !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
   color: #cbd5e1 !important;
}

body.enterprise-dark .users-card-head,
body.enterprise-dark .users-modal-header,
body.enterprise-dark .users-modal-footer {
   background: transparent !important;
   border-color: rgba(82, 99, 128, 0.72) !important;
}

body.enterprise-dark .users-search,
body.enterprise-dark .users-field .form-control {
   background: #0f1726 !important;
   border-color: rgba(82, 99, 128, 0.86) !important;
   color: #e5e7eb !important;
}

body.enterprise-dark .users-search::placeholder,
body.enterprise-dark .users-field .form-control::placeholder {
   color: #728198 !important;
}

body.enterprise-dark .users-search-wrap i,
body.enterprise-dark .users-field i {
   color: #8ea0bb !important;
}

body.enterprise-dark .users-btn-primary,
body.enterprise-dark .users-modal-primary {
   background: #f8fafc !important;
   border-color: rgba(248, 250, 252, 0.2) !important;
   color: #111827 !important;
}

body.enterprise-dark .users-btn-success {
   background: rgba(245, 158, 11, 0.16) !important;
   border-color: rgba(245, 158, 11, 0.32) !important;
   color: #fbbf24 !important;
}

body.enterprise-dark .users-btn-danger {
   background: rgba(239, 68, 68, 0.14) !important;
   border-color: rgba(239, 68, 68, 0.3) !important;
   color: #fca5a5 !important;
}

body.enterprise-dark .users-table-wrap {
   background: #101827 !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
}

body.enterprise-dark .users-table thead th {
   border-color: rgba(82, 99, 128, 0.72) !important;
   color: #aab4c6 !important;
}

body.enterprise-dark .users-table tbody tr {
   border-color: rgba(82, 99, 128, 0.48) !important;
}

body.enterprise-dark .users-table tbody tr:hover {
   background: rgba(30, 41, 59, 0.58) !important;
}

body.enterprise-dark .head-label i {
   color: #8ea0bb !important;
}

body.enterprise-dark .users-state.activo {
   background: rgba(34, 197, 94, 0.14) !important;
   border-color: rgba(34, 197, 94, 0.28) !important;
   color: #86efac !important;
}

body.enterprise-dark .users-state.inactivo {
   background: rgba(239, 68, 68, 0.14) !important;
   border-color: rgba(239, 68, 68, 0.28) !important;
   color: #fca5a5 !important;
}

body.enterprise-dark .users-state.desconocido {
   background: rgba(148, 163, 184, 0.12) !important;
   border-color: rgba(148, 163, 184, 0.24) !important;
   color: #cbd5e1 !important;
}

body.enterprise-dark .users-role-chip {
   background: rgba(89, 103, 216, 0.18) !important;
   border-color: rgba(129, 140, 248, 0.3) !important;
   color: #c7d2fe !important;
}

body.enterprise-dark .users-icon-btn-info {
   background: rgba(89, 103, 216, 0.18) !important;
   border-color: rgba(129, 140, 248, 0.3) !important;
   color: #c7d2fe !important;
}

body.enterprise-dark .users-icon-btn-danger {
   background: rgba(239, 68, 68, 0.14) !important;
   border-color: rgba(239, 68, 68, 0.32) !important;
   color: #fca5a5 !important;
}

body.enterprise-dark .users-icon-btn-success {
   background: rgba(34, 197, 94, 0.14) !important;
   border-color: rgba(34, 197, 94, 0.28) !important;
   color: #86efac !important;
}

body.enterprise-dark .users-table-footer {
   background: #101827 !important;
   border-color: rgba(82, 99, 128, 0.72) !important;
}

body.enterprise-dark .footer-copy {
   color: #aab4c6 !important;
}

body.enterprise-dark .pager-btn {
   background: transparent !important;
   border-color: rgba(82, 99, 128, 0.42) !important;
   color: #94a3b8 !important;
   box-shadow: none !important;
}

body.enterprise-dark .pager-btn:hover:not(:disabled) {
   background: rgba(89, 103, 216, 0.16) !important;
   border-color: rgba(129, 140, 248, 0.24) !important;
   color: #e0e7ff !important;
}

body.enterprise-dark .pager-btn.active {
   background: #5967d8 !important;
   border-color: #5967d8 !important;
   color: #ffffff !important;
}

body.enterprise-dark .pager-btn:disabled {
   color: #5f6f86 !important;
   opacity: 1;
}

body.enterprise-dark .users-modal-backdrop {
   background: rgba(3, 7, 18, 0.68) !important;
}

body.enterprise-dark .users-modal-close,
body.enterprise-dark .users-modal-secondary {
   background: #101827 !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
   color: #cbd5e1 !important;
}

body.enterprise-dark .users-modal label {
   color: #e5e7eb !important;
}

body.enterprise-dark .users-toast,
body.enterprise-dark .users-swal {
   background: #151e2b !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
   box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38) !important;
}

body.enterprise-dark .users-toast-title,
body.enterprise-dark .users-swal-title {
   color: #f8fafc !important;
}

body.enterprise-dark .users-toast-body,
body.enterprise-dark .users-swal-body {
   color: #aab4c6 !important;
}

body.enterprise-dark .users-swal-cancel {
   background: #101827;
   border-color: rgba(82, 99, 128, 0.78);
   color: #cbd5e1;
}

@media (max-width: 991px) {
   .users-hero-head {
      flex-direction: column;
      align-items: stretch;
   }

   .users-badge {
      width: fit-content;
   }
}

@media (max-width: 767px) {
   .users-hero .card-body,
   .users-card .card-body {
      padding: 1.2rem;
   }

   .users-heading {
      gap: 0.75rem;
   }

   .users-heading-icon {
      width: 42px;
      height: 42px;
      border-radius: 14px;
   }

   .users-actions,
   .users-btn,
   .users-search-wrap {
      width: 100%;
   }

   .users-action-group {
      justify-content: flex-start;
   }

   .users-table-footer {
      flex-direction: column;
      align-items: stretch;
    }

   .users-pager {
      justify-content: center;
      flex-wrap: wrap;
   }

   .users-modal {
      border-radius: 18px;
   }

   .users-modal-header,
   .users-modal-body,
   .users-modal-footer {
      padding-left: 1rem;
      padding-right: 1rem;
   }

   .users-modal-footer {
      flex-direction: column-reverse;
   }

   .users-modal-secondary,
   .users-modal-primary {
      width: 100%;
   }
}
</style>


