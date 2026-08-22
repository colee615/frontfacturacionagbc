const { Jimp } = require('jimp');
const QrCodeReader = require('qrcode-reader');
const jsQR = require('jsqr');
const {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer
} = require('@zxing/library');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 12 * 1024 * 1024) {
        reject(new Error('Payload demasiado grande'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function dataUrlToBuffer(value = '') {
  const match = String(value).match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
  if (!match) {
    throw new Error('Imagen base64 invalida');
  }

  return Buffer.from(match[1], 'base64');
}

function decodeWithQrCodeReader(image) {
  return new Promise((resolve) => {
    try {
      const qr = new QrCodeReader();
      qr.callback = (error, result) => {
        if (error || !result?.result) {
          resolve(null);
          return;
        }

        resolve(String(result.result));
      };
      qr.decode(image.bitmap);
    } catch (error) {
      resolve(null);
    }
  });
}

function decodeWithJsQr(image) {
  try {
    const { data, width, height } = image.bitmap;
    const result = jsQR(new Uint8ClampedArray(data), width, height, {
      inversionAttempts: 'attemptBoth'
    });
    return result?.data ? String(result.data) : null;
  } catch (error) {
    return null;
  }
}

function decodeWithZxing(image) {
  try {
    const { data, width, height } = image.bitmap;
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new MultiFormatReader();
    reader.setHints(hints);

    const luminanceSource = new RGBLuminanceSource(new Uint8ClampedArray(data), width, height);
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    const result = reader.decode(binaryBitmap);
    return result?.getText ? String(result.getText()) : null;
  } catch (error) {
    return null;
  }
}

async function buildVariants(baseImage) {
  const variants = [];
  const pushVariant = (label, image) => {
    if (image) {
      variants.push({ label, image });
    }
  };

  pushVariant('original', baseImage.clone());
  pushVariant('grayscale', baseImage.clone().greyscale());
  pushVariant('contrast', baseImage.clone().greyscale().contrast(1));
  pushVariant('threshold', baseImage.clone().greyscale().contrast(1).posterize(2));
  pushVariant('rotate-4', baseImage.clone().rotate(4).greyscale().contrast(1));
  pushVariant('rotate+4', baseImage.clone().rotate(-4).greyscale().contrast(1));
  pushVariant('rotate-8', baseImage.clone().rotate(8).greyscale().contrast(1));
  pushVariant('rotate+8', baseImage.clone().rotate(-8).greyscale().contrast(1));

  const w = baseImage.bitmap.width;
  const h = baseImage.bitmap.height;
  const lowerHalf = Math.max(1, Math.floor(h * 0.55));
  const lowerHalfY = Math.max(0, h - lowerHalf);
  pushVariant(
    'lower-half',
    baseImage.clone().crop({ x: 0, y: lowerHalfY, w, h: lowerHalf }).scale(4).greyscale().contrast(1)
  );
  pushVariant(
    'lower-half-threshold',
    baseImage.clone().crop({ x: 0, y: lowerHalfY, w, h: lowerHalf }).scale(5).greyscale().contrast(1).posterize(2)
  );

  const lowerSquareSize = Math.max(1, Math.min(w, Math.floor(h * 0.48)));
  const lowerSquareX = Math.max(0, Math.floor((w - lowerSquareSize) / 2));
  const lowerSquareY = Math.max(0, Math.floor(h * 0.48));
  pushVariant(
    'lower-square',
    baseImage.clone().crop({ x: lowerSquareX, y: Math.min(lowerSquareY, Math.max(0, h - lowerSquareSize)), w: lowerSquareSize, h: lowerSquareSize }).scale(6).greyscale().contrast(1)
  );
  pushVariant(
    'lower-square-threshold',
    baseImage.clone().crop({ x: lowerSquareX, y: Math.min(lowerSquareY, Math.max(0, h - lowerSquareSize)), w: lowerSquareSize, h: lowerSquareSize }).scale(7).greyscale().contrast(1).posterize(2)
  );

  const squareSize = Math.max(1, Math.min(w, h));
  const squareX = Math.max(0, Math.floor((w - squareSize) / 2));
  const squareY = Math.max(0, Math.floor((h - squareSize) / 2));
  pushVariant(
    'square-center',
    baseImage.clone().crop({ x: squareX, y: squareY, w: squareSize, h: squareSize }).scale(5).greyscale().contrast(1)
  );

  return variants;
}

async function decodeImageBuffer(buffer) {
  const image = await Jimp.read(buffer);
  const variants = await buildVariants(image);
  const attempts = [];

  for (const variant of variants) {
    const readerValue = await decodeWithQrCodeReader(variant.image);
    attempts.push(`${variant.label}:qrcode-reader:${readerValue ? 'ok' : 'no'}`);
    if (readerValue) {
      return {
        ok: true,
        rawText: readerValue,
        engine: 'qrcode-reader',
        variant: variant.label,
        attempts
      };
    }

    const jsqrValue = decodeWithJsQr(variant.image);
    attempts.push(`${variant.label}:jsqr:${jsqrValue ? 'ok' : 'no'}`);
    if (jsqrValue) {
      return {
        ok: true,
        rawText: jsqrValue,
        engine: 'jsqr',
        variant: variant.label,
        attempts
      };
    }

    const zxingValue = decodeWithZxing(variant.image);
    attempts.push(`${variant.label}:zxing:${zxingValue ? 'ok' : 'no'}`);
    if (zxingValue) {
      return {
        ok: true,
        rawText: zxingValue,
        engine: 'zxing',
        variant: variant.label,
        attempts
      };
    }
  }

  return {
    ok: false,
    rawText: '',
    engine: '',
    variant: '',
    attempts
  };
}

module.exports = async function qrDecodeMiddleware(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, message: 'Metodo no permitido' });
    return;
  }

  try {
    const body = await readBody(req);
    const payload = JSON.parse(body || '{}');
    const imageDataUrl = String(payload.imageDataUrl || '').trim();
    if (!imageDataUrl) {
      sendJson(res, 400, { ok: false, message: 'Imagen requerida' });
      return;
    }

    const buffer = dataUrlToBuffer(imageDataUrl);
    const decoded = await decodeImageBuffer(buffer);
    sendJson(res, 200, decoded);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message: error.message || 'No se pudo decodificar el QR'
    });
  }
};
