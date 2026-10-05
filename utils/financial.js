// API decisions are authoritative. The fallback supports a staggered deployment.
export function financialState(sale = {}) {
  if (sale.financiero) return sale.financiero;
  const state = String(sale.estadoSufe || sale.estado_sufe || sale.estadoFiscal || sale.respuesta_emision?.estadoSufe || sale.estado_emision || sale.status?.key || 'SIN_ESTADO').trim().toUpperCase();
  const payment = String(sale.estado_pago || sale.estadoPago || '').trim().toLowerCase();
  const order = String(sale.codigoOrden || '').toUpperCase();
  const qr = Number(sale.metodoPago) === 5 || sale.metodo_pago === 'qr' || sale.canal_emision === 'qr' || sale.medioPago === 'QR' || /^VQC?-/.test(order);
  const annulled = ['ANULADA', 'ANULADO', 'DESCARTADA'].includes(state);
  const active = ['PROCESADA', 'PROCESADO', 'FACTURADA', 'EMITIDO', 'ANULACION_SOLICITADA', 'ANULACION_OBSERVADA'].includes(state);
  const canceled = ['cancelado', 'anulado', 'fallido', 'reembolsado', 'revertido'].includes(payment);
  const paid = ['pagado', 'confirmado'].includes(payment) || (!qr && !payment && active);
  const labels = (sale.detalle || []).map(i => [i.descripcion, i.titulo, i.nombre_servicio, i.servicio, i.nombre].filter(Boolean).join(' ')).join(' ').toLowerCase();
  const receivable = [true, 1, '1', 'true'].includes(sale.es_cuenta_por_cobrar);
  const category = state === 'REGISTRADA_OFICIAL' ? 'OFICIAL' : (receivable || sale.canal_operativo === 'contrato' || sale.empresa_nombre || sale.empresa_sigla || /\bcontratos?\b/.test(labels)) ? 'CONTRATO' : /\beca\b/.test(labels) ? 'ECA' : 'NORMAL';
  const included = active && !annulled && !canceled && paid && category === 'NORMAL' && Number(sale.total || 0) >= 0;
  return { estadoFiscal: state, estadoPago: payment || 'sin_evidencia', medioPago: qr ? 'QR' : 'EFECTIVO', categoria: category,
    anulada: annulled, facturaVigente: active, pagoConfirmado: paid, pagoCancelado: canceled, incluidaEnTotalVendido: included };
}

export function addMoney(a, b) { return (Math.round(Number(a || 0) * 100) + Math.round(Number(b || 0) * 100)) / 100; }
