const http = require('http');
const https = require('https');
const { URL } = require('url');

const BANCO_UNION_BASE_URL = 'https://www.bancounion.com.bo/ComprobantesBun/Index?parametro=';
const ALLOWED_HOST = 'www.bancounion.com.bo';
const MAX_REDIRECTS = 5;

function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeLines(html = '') {
  const plainText = decodeHtmlEntities(String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n'));

  return plainText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function readSequentialValue(lines, label) {
  const normalizedLabel = String(label || '').trim().toUpperCase();
  if (!normalizedLabel) {
    return '';
  }

  const index = lines.findIndex((line) => String(line).trim().toUpperCase() === normalizedLabel);
  if (index === -1) {
    return '';
  }

  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    const current = String(lines[cursor] || '').trim();
    if (!current) {
      continue;
    }
    if (/^(NOMBRE DEL BANCO|USUARIO|AGENCIA|TRANSACCION|TRANSACCIÓN|FECHA|MONTO|MONEDA|DEPOSITANTE|BENEFICIARIO)$/i.test(current)) {
      return '';
    }
    return current;
  }

  return '';
}

function parseAmount(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value)
    .replace(/[^\d.,-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function parseBankReceiptHtml(html, fallbackReference = '', sourceUrl = '') {
  const lines = normalizeLines(html);
  const lineText = lines.join('\n').toUpperCase();

  return {
    amount: parseAmount(readSequentialValue(lines, 'MONTO') || readSequentialValue(lines, 'IMPORTE')),
    reference: fallbackReference || '',
    bank: readSequentialValue(lines, 'AGENCIA') || '',
    bankName: readSequentialValue(lines, 'NOMBRE DEL BANCO') || (lineText.includes('BANCO UNION') || lineText.includes('BANCO UNIÓN') ? 'BANCO UNION S.A.' : ''),
    user: readSequentialValue(lines, 'USUARIO') || '',
    transaction: readSequentialValue(lines, 'TRANSACCION') || readSequentialValue(lines, 'TRANSACCIÓN') || '',
    date: readSequentialValue(lines, 'FECHA') || '',
    currency: readSequentialValue(lines, 'MONEDA') || '',
    depositante: readSequentialValue(lines, 'DEPOSITANTE') || '',
    beneficiario: readSequentialValue(lines, 'BENEFICIARIO') || '',
    sourceUrl
  };
}

function fetchText(targetUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) {
      reject(new Error('Demasiados redireccionamientos'));
      return;
    }

    const url = new URL(targetUrl);
    const client = url.protocol === 'http:' ? http : https;

    const request = client.get(url, (response) => {
      const status = Number(response.statusCode || 0);

      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
        const nextUrl = new URL(response.headers.location, url).toString();
        response.resume();
        fetchText(nextUrl, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      if (status < 200 || status >= 300) {
        response.resume();
        reject(new Error(`Banco Union respondio ${status}`));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => resolve(body));
    });

    request.on('error', reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error('Timeout consultando Banco Union'));
    });
  });
}

function buildTargetUrl(urlParam = '', tokenParam = '') {
  const rawUrl = String(urlParam || '').trim();
  if (rawUrl) {
    const parsed = new URL(rawUrl);
    if (String(parsed.hostname || '').toLowerCase() !== ALLOWED_HOST) {
      throw new Error('Host no permitido');
    }
    if (!String(parsed.pathname || '').startsWith('/ComprobantesBun/Index')) {
      throw new Error('Ruta no permitida');
    }
    return parsed.toString();
  }

  const token = String(tokenParam || '')
    .replace(/^parametro=/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  if (!/^[A-Za-z0-9_\-]{20,}$/.test(token)) {
    throw new Error('Token de comprobante invalido');
  }

  return `${BANCO_UNION_BASE_URL}${encodeURIComponent(token)}`;
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, message: 'Metodo no permitido' });
    return;
  }

  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    const targetUrl = buildTargetUrl(
      requestUrl.searchParams.get('url'),
      requestUrl.searchParams.get('token')
    );
    const reference = String(
      requestUrl.searchParams.get('reference')
      || new URL(targetUrl).searchParams.get('parametro')
      || ''
    ).trim();

    const html = await fetchText(targetUrl);
    const parsed = parseBankReceiptHtml(html, reference, targetUrl);

    sendJson(res, 200, {
      ok: true,
      parsed
    });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      message: error.message || 'No se pudo leer el comprobante de Banco Union'
    });
  }
}

module.exports = handler;
module.exports._internals = {
  parseBankReceiptHtml,
  normalizeLines,
  readSequentialValue,
  parseAmount,
  buildTargetUrl,
  fetchText
};
