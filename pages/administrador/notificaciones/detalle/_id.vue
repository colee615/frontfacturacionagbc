<template>
    <div>
        <JcLoader :load="load"></JcLoader>
        <AdminTemplate :page="page" :modulo="modulo">
            <template #body>
                <div class="container mt-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="mb-0">Reporte de Notificación</h4>
                                <p class="text-sm mb-0">
                                    Notificación número <b>{{ model.id }}</b> del <b>{{ model.fecha }}</b>
                                </p>
                                <p class="text-sm mb-0">
                                    Mensaje:<b>{{ model.mensaje }}</b>
                                </p>
                                <p class="text-sm mb-0">
    Observación: <b>{{ parsedDetalle.observacion ? parsedDetalle.observacion : 'No hay observaciones' }}</b>
</p>


                            </div>
                            <button @click="$router.back()" class="btn btn-primary btn-sm">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                        <div class="card-body">
                            <hr class="my-4">
                            <div class="row">
                                <div class="col-lg-8">
                                    <h5 class="mb-3">Detalles de la Notificación</h5>
                                    <ul class="list-unstyled">
                                        <li><strong>Estado:</strong> {{ model.estado }}</li>
                                        <li><strong>Fuente:</strong> {{ model.fuente }}</li>
                                        <li><strong>Código de Seguimiento:</strong> {{ model.codigo_seguimiento }}</li>
                                        <li><strong>CUF:</strong> {{ parsedDetalle.cuf }}</li>
                                        <li><strong>N° Factura:</strong> {{ parsedDetalle.nroFactura }}</li>

                                    </ul>
                                </div>
                                <div class="col-lg-4 text-center mt-4 mt-lg-0">
                                    <img src="/assets/img/logo.png" alt="Logo de la Empresa"
                                        style="width: 150px; height: auto;">
                                </div>
                            </div>
                            <hr class="my-4">
                            <div class="row">
                                <div class="col-lg-8">
                                    <h5 class="mb-3">Información Adicional</h5>
                                    <ul class="list-unstyled">
                                        <li><strong>URL PDF:</strong> <a :href="parsedDetalle.urlPdf" target="_blank">{{
            parsedDetalle.urlPdf }}</a></li>
                                        <li><strong>URL XML:</strong> <a :href="parsedDetalle.urlXml" target="_blank">{{
                                                parsedDetalle.urlXml }}</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </AdminTemplate>
    </div>
</template>

<script>
export default {
    data() {
        return {
            load: true,
            page: 'Reporte',
            modulo: 'Notificaciones',
            model: {
                detalle: {}
            },
            parsedDetalle: {
                cuf: '',
                nroFactura: '',
                urlPdf: '',
                urlXml: '',
                observacion: '',
            }
        };
    },
    methods: {
        async GET_DATA(path) {
            try {
                const response = await this.$admin.$get(path);
                this.model = response;
                if (response.detalle) {
                    this.parsedDetalle = JSON.parse(response.detalle);
                }
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                this.load = false;
            }
        },
    },
    mounted() {
        this.$nextTick(async () => {
            try {
                await this.GET_DATA('notificaciones/' + this.$route.params.id);
            } catch (e) {
                console.log(e);
            } finally {
                this.load = false;
            }
        });
    },
};
</script>

<style scoped>
.card {
    border-radius: 10px;
}

.card-header {
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
}

.card-body {
    background-color: #ffffff;
}

.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
}

.btn-primary:hover {
    background-color: #0056b3;
    border-color: #0056b3;
}

.list-unstyled {
    padding-left: 0;
    list-style: none;
}

.list-unstyled li {
    margin-bottom: 10px;
}

img {
    max-width: 100%;
    height: auto;
}
</style>