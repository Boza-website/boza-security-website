// Basic client-side image cropper + simple edits (rotate/flip/download)
(() => {
  const fileInput = document.getElementById('fileInput');
  const canvas = document.getElementById('canvas');
  const preview = document.getElementById('preview');
  const cropBtn = document.getElementById('cropBtn');
  const rotateLeftBtn = document.getElementById('rotateLeftBtn');
  const rotateRightBtn = document.getElementById('rotateRightBtn');
  const flipHBtn = document.getElementById('flipHBtn');
  const flipVBtn = document.getElementById('flipVBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const ctx = canvas.getContext('2d');
  const pctx = preview.getContext('2d');

  let img = null; // original loaded image (Image object)
  let displayImageDataURL = null; // current displayed image as dataURL

  // transform state
  let rotation = 0; // degrees, normalized to 0/90/180/270
  let flipH = false;
  let flipV = false;

  // selection state in canvas pixel coords
  let selecting = false;
  let selStart = null;
  let selRect = null; // {x,y,w,h}

  // load image from file
  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => {
      img = image;
      rotation = 0; flipH = false; flipV = false;
      renderToCanvas();
      updatePreview();
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

  function renderToCanvas() {
    if (!img) return;
    // compute canvas size to fit the image (no upscaling) but allow large images to scale down to 1200px max
    const maxDim = 1200;
    let iw = img.width, ih = img.height;
    const scale = Math.min(1, maxDim / Math.max(iw, ih));
    iw = Math.round(iw * scale); ih = Math.round(ih * scale);

    // if rotated by 90/270, swap dims
    const normalizedRot = ((rotation % 360) + 360) % 360;
    const isPortrait = normalizedRot === 90 || normalizedRot === 270;
    canvas.width = isPortrait ? ih : iw;
    canvas.height = isPortrait ? iw : ih;

    // clear and draw transformed image
    ctx.save();
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // move origin to center to rotate/flip
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(normalizedRot * Math.PI/180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // draw image centered
    // when rotated we need to draw with swapped width/height
    const drawW = normalizedRot === 90 || normalizedRot === 270 ? ih : iw;
    const drawH = normalizedRot === 90 || normalizedRot === 270 ? iw : ih;

    // If we scaled image, draw at -drawW/2
    ctx.drawImage(img, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();

    // store current display dataURL
    displayImageDataURL = canvas.toDataURL('image/png');
  }

  // mouse selection handlers
  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((evt.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((evt.clientY - rect.top) * (canvas.height / rect.height));
    return {x,y};
  }

  canvas.addEventListener('mousedown', (e) => {
    if (!img) return;
    selecting = true;
    selStart = getMousePos(e);
    selRect = {x: selStart.x, y: selStart.y, w:0, h:0};
    drawSelectionOverlay();
  });
  window.addEventListener('mousemove', (e) => {
    if (!selecting) return;
    const pos = getMousePos(e);
    selRect.x = Math.min(pos.x, selStart.x);
    selRect.y = Math.min(pos.y, selStart.y);
    selRect.w = Math.abs(pos.x - selStart.x);
    selRect.h = Math.abs(pos.y - selStart.y);
    drawSelectionOverlay();
  });
  window.addEventListener('mouseup', (e) => {
    if (!selecting) return;
    selecting = false;
    drawSelectionOverlay();
  });

  function drawSelectionOverlay() {
    // draw the image first (it already is on canvas), then draw overlay using a semi-transparent layer on top
    // We'll redraw image from stored dataURL to ensure overlay is fresh
    if (!img) return;
    // restore image from dataURL
    const tempImg = new Image();
    tempImg.onload = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(tempImg, 0,0,canvas.width,canvas.height);

      if (selRect && (selRect.w>0 && selRect.h>0)){
        // darken outside
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        // top
        ctx.fillRect(0,0,canvas.width,selRect.y);
        // bottom
        ctx.fillRect(0,selRect.y+selRect.h,canvas.width,canvas.height-(selRect.y+selRect.h));
        // left
        ctx.fillRect(0,selRect.y,selRect.x,selRect.h);
        // right
        ctx.fillRect(selRect.x+selRect.w,selRect.y,canvas.width-(selRect.x+selRect.w),selRect.h);
        ctx.restore();

        // draw selection border
        ctx.save();
        ctx.strokeStyle = '#3fc3ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6,4]);
        ctx.strokeRect(selRect.x+0.5, selRect.y+0.5, selRect.w, selRect.h);
        ctx.restore();
      }
    };
    tempImg.src = displayImageDataURL || canvas.toDataURL();
  }

  cropBtn.addEventListener('click', () => {
    if (!img) return;
    // if no selection, crop full canvas
    const sx = selRect && selRect.w>0 ? selRect.x : 0;
    const sy = selRect && selRect.h>0 ? selRect.y : 0;
    const sw = selRect && selRect.w>0 ? selRect.w : canvas.width;
    const sh = selRect && selRect.h>0 ? selRect.h : canvas.height;

    const out = document.createElement('canvas');
    out.width = sw; out.height = sh;
    const outCtx = out.getContext('2d');
    outCtx.drawImage(canvas, sx, sy, sw, sh, 0,0, sw, sh);

    // set the cropped image as the new working image
    const data = out.toDataURL('image/png');
    const newImg = new Image();
    newImg.onload = () => {
      img = newImg;
      rotation = 0; flipH = false; flipV = false; selRect = null;
      // resize preview canvas if needed
      renderToCanvas();
      updatePreview();
    };
    newImg.src = data;
  });

  rotateLeftBtn.addEventListener('click', () => {
    if (!img) return; rotation = (rotation - 90) % 360; renderToCanvas(); updatePreview(); drawSelectionOverlay();
  });
  rotateRightBtn.addEventListener('click', () => {
    if (!img) return; rotation = (rotation + 90) % 360; renderToCanvas(); updatePreview(); drawSelectionOverlay();
  });
  flipHBtn.addEventListener('click', () => { if(!img) return; flipH = !flipH; renderToCanvas(); updatePreview(); drawSelectionOverlay(); });
  flipVBtn.addEventListener('click', () => { if(!img) return; flipV = !flipV; renderToCanvas(); updatePreview(); drawSelectionOverlay(); });

  resetBtn.addEventListener('click', () => {
    if (!img) return; // reload original image not available; we'll just clear transforms
    rotation = 0; flipH = false; flipV = false; selRect = null; renderToCanvas(); updatePreview();
  });

  downloadBtn.addEventListener('click', () => {
    if (!img) return;
    // download current canvas content as PNG
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'edited-image.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  function updatePreview() {
    if (!img) { pctx.clearRect(0,0,preview.width,preview.height); return; }
    // draw scaled preview of the whole canvas into preview
    const w = canvas.width, h = canvas.height;
    const pw = preview.width, ph = preview.height;
    // compute scale to fit
    const s = Math.min(pw / w, ph / h);
    pctx.clearRect(0,0,pw,ph);
    pctx.drawImage(canvas, 0,0,w,h, 0,0, Math.round(w*s), Math.round(h*s));
  }

  // initial empty canvas message
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#999';
  ctx.font = '16px system-ui, Arial';
  ctx.fillText('No image loaded — choose a file above', 20, 40);
})();
