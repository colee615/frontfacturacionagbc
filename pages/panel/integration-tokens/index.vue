<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="enterprise-page-shell">
        <section class="enterprise-filter-card tokens-header-card">
          <div class="enterprise-page-header tokens-page-header">
            <div>
              <p class="enterprise-page-kicker">Centro de integracion</p>
              <h2 class="enterprise-page-title">Tokens de integracion</h2>
              <p class="enterprise-page-copy">
                Crea credenciales para sistemas externos. Si no envias fecha de expiracion, el token no vence.
              </p>
            </div>
            <div class="tokens-header-actions">
              <div class="tokens-badge">
                <i class="fas fa-key"></i>
                <span>{{ tokens.length }} registros</span>
              </div>
              <button class="enterprise-btn-soft primary" @click="openCreate">
                <i class="fas fa-plus"></i>
                <span>Nuevo token</span>
              </button>
            </div>
          </div>
        </section>

        <section class="enterprise-content-card enterprise-table-card tokens-table-card">
          <div v-if="tokens.length" class="table-wrap tokens-table-wrap enterprise-table-wrap">
            <table class="tokens-table enterprise-table">
              <thead>
                <tr>
                  <th>
                    <span class="head-label"><i class="fas fa-hashtag"></i><span>#</span></span>
                  </th>
                  <th>
                    <span class="head-label"><i class="fas fa-tag"></i><span>Nombre</span></span>
                  </th>
                  <th>
                    <span class="head-label"><i class="fas fa-fingerprint"></i><span>Prefijo</span></span>
                  </th>
                  <th>
                    <span class="head-label"><i class="fas fa-toggle-on"></i><span>Estado</span></span>
                  </th>
                  <th>
                    <span class="head-label"><i class="fas fa-calendar-alt"></i><span>Expira</span></span>
                  </th>
                  <th>
                    <span class="head-label"><i class="fas fa-clock"></i><span>Ultimo uso</span></span>
                  </th>
                  <th>
                    <span class="head-label"><i class="fas fa-cog"></i><span>Acciones</span></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(t, i) in tokens" :key="t.id">
                  <td><strong class="token-index">{{ i + 1 }}</strong></td>
                  <td>
                    <div class="token-main">
                      <strong>{{ t.name }}</strong>
                    </div>
                  </td>
                  <td><code class="token-prefix">{{ t.token_prefix }}</code></td>
                  <td>
                    <span class="token-state" :class="t.is_active ? 'active' : 'inactive'">
                      {{ t.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td><strong class="token-date">{{ t.expires_at || 'Sin expiracion' }}</strong></td>
                  <td><strong class="token-date">{{ t.last_used_at || 'Sin uso' }}</strong></td>
                  <td>
                    <div class="token-action-group">
                      <button class="token-action token-action-view" type="button" @click="revealToken(t)" title="Ver">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button v-if="t.is_active" class="token-action token-action-warn" type="button" @click="deactivateToken(t)" title="Desactivar">
                        <i class="fas fa-ban"></i>
                      </button>
                      <button v-else class="token-action token-action-success" type="button" @click="activateToken(t)" title="Activar">
                        <i class="fas fa-check"></i>
                      </button>
                      <button class="token-action token-action-danger" type="button" @click="deleteToken(t)" title="Eliminar">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state tokens-empty-state">
            <h3>Sin tokens</h3>
            <p>No hay tokens registrados todavia.</p>
          </div>
        </section>

        <div v-if="showTokenModal" class="tokens-modal-backdrop" @click.self="closeTokenModal">
          <div class="tokens-modal" role="dialog" aria-modal="true" aria-labelledby="tokens-modal-title">
            <div class="tokens-modal-header">
              <div class="tokens-modal-title-block">
                <span class="tokens-modal-icon">
                  <i :class="tokenModalMode === 'create' ? 'fas fa-key' : 'fas fa-eye'"></i>
                </span>
                <div>
                  <p class="tokens-kicker mb-1">{{ tokenModalMode === 'create' ? 'Nuevo token' : 'Token generado' }}</p>
                  <h5 id="tokens-modal-title" class="mb-0">
                    {{ tokenModalMode === 'create' ? 'Crear token de integracion' : activeToken?.name || 'Token de integracion' }}
                  </h5>
                </div>
              </div>
              <button type="button" class="tokens-modal-close" @click="closeTokenModal" aria-label="Cerrar">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="tokens-modal-body">
              <div v-if="tokenModalMode === 'create'">
                <div class="tokens-form-note">
                  <i class="fas fa-info-circle"></i>
                  <span>Completa los datos para generar una credencial nueva. Si no envias expiracion, el token no vence.</span>
                </div>

                <div class="row g-3">
                  <div class="form-group col-12">
                    <label for="token-name">Nombre del token <span>*</span></label>
                    <div class="tokens-field">
                      <i class="fas fa-tag"></i>
                      <input id="token-name" v-model.trim="tokenForm.name" type="text" class="form-control" placeholder="Ej. Bolipost">
                    </div>
                  </div>
                  <div class="form-group col-12">
                    <label for="token-description">Descripcion</label>
                    <div class="tokens-field">
                      <i class="fas fa-align-left"></i>
                      <textarea id="token-description" v-model.trim="tokenForm.description" class="form-control tokens-textarea" rows="3" placeholder="Descripcion opcional"></textarea>
                    </div>
                  </div>
                  <div class="form-group col-12">
                    <label for="token-expires">Expiracion</label>
                    <div class="tokens-field">
                      <i class="fas fa-calendar-alt"></i>
                      <input id="token-expires" v-model="tokenForm.expires_at" type="datetime-local" class="form-control">
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="tokens-token-result">
                <div class="tokens-result-pill">
                  <i class="fas fa-shield-alt"></i>
                  <span>Guarda este valor en un lugar seguro</span>
                </div>
                <div class="tokens-secret-box">
                  <code>{{ generatedToken || 'No disponible' }}</code>
                </div>
              </div>
            </div>

            <div class="tokens-modal-footer">
              <button type="button" class="btn tokens-modal-secondary" @click="closeTokenModal" :disabled="savingToken">
                {{ tokenModalMode === 'create' ? 'Cancelar' : 'Cerrar' }}
              </button>
              <button
                v-if="tokenModalMode === 'create'"
                type="button"
                class="btn tokens-modal-primary"
                @click="saveToken"
                :disabled="savingToken"
              >
                <i v-if="savingToken" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-plus"></i>
                <span>{{ savingToken ? 'Guardando...' : 'Crear token' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminTemplate>
  </div>
</template>

<script>
export default {
  name: 'IntegrationTokensPage',
  data() {
    return {
      load: false,
      page: 'Panel',
      modulo: 'Tokens de integracion',
      tokens: [],
      showTokenModal: false,
      tokenModalMode: 'create',
      savingToken: false,
      activeToken: null,
      generatedToken: '',
      tokenForm: {
        name: '',
        description: '',
        expires_at: ''
      }
    };
  },
  methods: {
    resetTokenForm() {
      this.tokenForm = {
        name: '',
        description: '',
        expires_at: ''
      };
    },
    openCreate() {
      this.tokenModalMode = 'create';
      this.activeToken = null;
      this.generatedToken = '';
      this.resetTokenForm();
      this.showTokenModal = true;
    },
    closeTokenModal() {
      if (this.savingToken) return;
      this.showTokenModal = false;
      this.tokenModalMode = 'create';
      this.activeToken = null;
      this.generatedToken = '';
      this.resetTokenForm();
    },
    async loadTokens() {
      this.load = true;
      try {
        this.tokens = await this.$admin.$get('integration-tokens');
      } catch (e) {
        this.notifyError(e, 'No se pudieron cargar los tokens');
      } finally {
        this.load = false;
      }
    },
    async saveToken() {
      const name = (this.tokenForm.name || '').trim();
      const description = (this.tokenForm.description || '').trim();
      const expires = (this.tokenForm.expires_at || '').trim();

      if (!name) {
        this.notifyError(null, 'El nombre es obligatorio');
        return;
      }

      this.savingToken = true;
      try {
        const payload = { name, description: description || null };
        if (expires) payload.expires_at = expires;

        const res = await this.$admin.$post('integration-tokens', payload);
        await this.loadTokens();

        this.activeToken = { name };
        this.generatedToken = res?.plain_text_token || 'No disponible';
        this.tokenModalMode = 'reveal';
      } catch (e) {
        this.notifyError(e, 'No se pudo crear el token');
      } finally {
        this.savingToken = false;
      }
    },
    async revealToken(token) {
      try {
        const res = await this.$admin.$get(`integration-tokens/${token.id}/reveal`);
        this.activeToken = token;
        this.generatedToken = res?.plain_text_token || 'No disponible';
        this.tokenModalMode = 'reveal';
        this.showTokenModal = true;
      } catch (e) {
        this.notifyError(e, 'No se pudo revelar el token');
      }
    },
    async activateToken(token) {
      try {
        await this.$admin.$put(`integration-tokens/${token.id}/activate`);
        await this.loadTokens();
      } catch (e) {
        this.notifyError(e, 'No se pudo activar el token');
      }
    },
    async deactivateToken(token) {
      try {
        await this.$admin.$put(`integration-tokens/${token.id}/deactivate`);
        await this.loadTokens();
      } catch (e) {
        this.notifyError(e, 'No se pudo desactivar el token');
      }
    },
    async deleteToken(token) {
      const result = await this.$swal.fire({
        icon: 'warning',
        title: 'Eliminar token',
        text: `Se eliminara ${token.name}. Esta accion no se puede deshacer.`,
        showCancelButton: true,
        confirmButtonText: 'Eliminar'
      });
      if (!result.isConfirmed) return;

      try {
        await this.$admin.$delete(`integration-tokens/${token.id}`);
        await this.loadTokens();
      } catch (e) {
        this.notifyError(e, 'No se pudo eliminar el token');
      }
    },
    notifyError(e, fallback) {
      const message = e && e.response
        ? (e.response.data?.message || e.response.data?.error || fallback)
        : fallback;

      this.$swal.fire({ icon: 'error', title: fallback, text: message });
    }
  },
  mounted() {
    this.loadTokens();
  }
};
</script>

<style scoped>
.tokens-header-card {
  margin-bottom: 1rem;
}

.tokens-page-header {
  gap: 1rem;
}

.tokens-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tokens-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 42px;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
  color: #40506f;
  font-size: 0.86rem;
  font-weight: 800;
}

.tokens-badge i {
  color: #5967d8;
}

.tokens-table-wrap {
  border: 1px solid #edf1f6;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.tokens-table {
  width: 100%;
  min-width: 1040px;
  border-collapse: collapse;
  background: #fff;
}

.tokens-table thead th {
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

.tokens-table tbody td {
  padding: 1rem 0.9rem;
  border-bottom: 1px solid #edf1f6;
  color: #33415c;
  vertical-align: middle;
}

.tokens-table tbody tr:last-child td {
  border-bottom: 0;
}

.tokens-table tbody tr:hover {
  background: #fbfcff;
}

.token-index,
.token-date,
.token-main strong {
  color: #223658;
  font-weight: 700;
}

.token-prefix {
  display: inline-flex;
  align-items: center;
  padding: 0.34rem 0.55rem;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #d9467a;
  font-size: 0.82rem;
  font-weight: 700;
}

.token-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.token-state.active {
  background: #ecfdf3;
  color: #067647;
  border-color: #abefc6;
}

.token-state.inactive {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.token-action-group {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.token-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.token-action:hover {
  transform: translateY(-1px);
}

.token-action-view {
  color: #2d4f8f;
  border-color: #dbe4f0;
}

.token-action-warn {
  color: #a16207;
  border-color: #f6d77a;
}

.token-action-success {
  color: #067647;
  border-color: #abefc6;
}

.token-action-danger {
  color: #b42318;
  border-color: #f5b3ad;
}

.token-action i {
  font-size: 0.82rem;
}

.empty-state {
  padding: 1.8rem 1rem;
  text-align: center;
}

.empty-state h3 {
  margin: 0;
  color: #1d3360;
  font-size: 1.35rem;
  font-weight: 800;
}

.empty-state p {
  margin: 0.45rem 0 0;
  color: #6f7c92;
}

.tokens-modal-backdrop {
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

.tokens-modal {
  width: min(100%, 540px);
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(215, 222, 235, 0.95);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
  overflow: hidden;
}

.tokens-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.35rem;
  background: #f8fafc;
  border-bottom: 1px solid #e6ebf3;
}

.tokens-modal-title-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.tokens-modal-title-block h5 {
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 800;
}

.tokens-modal-icon {
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

.tokens-modal-close {
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

.tokens-modal-close:hover {
  background: #fff1f0;
  border-color: #fecdc9;
  color: #b42318;
}

.tokens-modal-body {
  padding: 1.35rem;
}

.tokens-form-note {
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

.tokens-form-note i {
  color: #5967d8;
  margin-top: 0.16rem;
}

.tokens-kicker {
  color: #8b94a7;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.tokens-field {
  position: relative;
}

.tokens-field i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  color: #98a2b3;
  font-size: 0.9rem;
}

.tokens-field .form-control {
  height: 46px;
  padding-left: 42px !important;
  border-radius: 14px !important;
  font-size: 0.92rem;
}

.tokens-textarea.form-control {
  height: auto;
  min-height: 96px;
  padding-top: 0.85rem;
  resize: vertical;
}

.tokens-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.35rem 1.25rem;
  background: #ffffff;
  border-top: 1px solid #eef2f7;
}

.tokens-modal-secondary,
.tokens-modal-primary {
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

.tokens-modal-secondary {
  background: #ffffff;
  border: 1px solid #d8e0ec;
  color: #4b5565;
}

.tokens-modal-primary {
  background: #1f2937;
  border: 1px solid rgba(31, 41, 55, 0.16);
  color: #ffffff;
}

.tokens-modal-secondary:disabled,
.tokens-modal-primary:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.tokens-token-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tokens-result-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 0.95rem;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
  color: #667085;
  font-size: 0.88rem;
  font-weight: 650;
}

.tokens-result-pill i {
  color: #5967d8;
}

.tokens-secret-box {
  padding: 1rem 1.05rem;
  border-radius: 16px;
  background: #fff7df;
  border: 1px solid #f6d77a;
  overflow: auto;
}

.tokens-secret-box code {
  color: #7a5400;
  word-break: break-all;
  font-size: 0.9rem;
}

@media (max-width: 991px) {
  .tokens-header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .tokens-table {
    min-width: 1040px;
  }

  .tokens-modal-header {
    flex-direction: column;
    align-items: stretch;
  }

  .tokens-modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .tokens-modal-secondary,
  .tokens-modal-primary {
    width: 100%;
  }
}
</style>
