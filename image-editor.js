// Image editor: selection, aspect-ratio presets, theme toggle, JPEG export, touch support
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

  const aspectSelect = document.getElementById('aspectSelect');
  const exportType = document.getElementById('exportType');
  const jpegQuality = document.getElementById('jpegQuality');
  const themeToggle = document.getElementById('themeToggle');

  const ctx = canvas.getContext('2d');
  const pctx = preview.getContext('2d');

  let img = null; // Image object currently in use
  let displayImageDataURL = null;

  // transform state
  let rotation = 0; // degrees
  let flipH = false;
  let flipV = false;

  // selection state
  let selecting = false;
  let selStart = null;
  let selRect = null; // {x,y,w,h}

  // aspect ratio helper
  function parseAspect(as){
    if(!as || as==='none') return null;
    const parts = as.split(':').map(Number);
    if(parts.length===2 && parts[0]>0 && parts[1]>0) return parts[0]/parts[1];
    return null;
  }

  function applyTheme(e){
    if(themeToggle.checked){
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }
  themeToggle.addEventListener('change', applyTheme);

  // load file
  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => {
      img = image;
      rotation = 0; flipH = false; flipV = false; selRect = null;
      renderToCanvas();
      updatePreview();
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

  function renderToCanvas(){
    if(!img) return;
    const maxDim = 1200;
    let iw = img.width, ih = img.height;
    const scale = Math.min(1, maxDim / Math.max(iw, ih));
    iw = Math.round(iw * scale); ih = Math.round(ih * scale);

    const normalizedRot = ((rotation % 360) + 360) % 360;
    const isPortrait = normalizedRot === 90 || normalizedRot === 270;
    canvas.width = isPortrait ? ih : iw;
    canvas.height = isPortrait ? iw : ih;

    ctx.save();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(normalizedRot * Math.PI/180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const drawW = normalizedRot === 90 || normalizedRot === 270 ? ih : iw;
    const drawH = normalizedRot === 90 || normalizedRot === 270 ? iw : ih;
    ctx.drawImage(img, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();

    displayImageDataURL = canvas.toDataURL('image/png');
  }

  // pointer helpers (works with mouse + touch via mapped events)
  function getPointerPos(clientX, clientY){
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((clientY - rect.top) * (canvas.height / rect.height));
    return {x,y};
  }

  function startSelection(clientX, clientY){
    if(!img) return;
    selecting = true;
    selStart = getPointerPos(clientX, clientY);
    selRect = {x: selStart.x, y: selStart.y, w:0, h:0};
    drawSelectionOverlay();
  }
  function moveSelection(clientX, clientY){
    if(!selecting) return;
    const pos = getPointerPos(clientX, clientY);
    const aspect = parseAspect(aspectSelect.value);

    if(!aspect){
      selRect.x = Math.min(pos.x, selStart.x);
      selRect.y = Math.min(pos.y, selStart.y);
      selRect.w = Math.abs(pos.x - selStart.x);
      selRect.h = Math.abs(pos.y - selStart.y);
    } else {
      // enforce aspect ratio based on horizontal movement and start point
      const dx = pos.x - selStart.x;
      const dy = pos.y - selStart.y;
      // determine direction
      const signX = dx >= 0 ? 1 : -1;
      const signY = dy >= 0 ? 1 : -1;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // prefer width-driven (so user drags horizontally to set width)
      let w = absDx;
      let h = Math.round(w / aspect);
      if(h === 0) h = 1;
      // if height would exceed pointer, switch to height-driven
      if(h > absDy){
        // keep width-driven
      } else {
        // height-driven
        h = absDy;
        w = Math.round(h * aspect);
      }
      selRect.w = w;
      selRect.h = h;
      selRect.x = selStart.x * 1 + (signX < 0 ? -w : 0);
      selRect.y = selStart.y * 1 + (signY < 0 ? -h : 0);
    }
    drawSelectionOverlay();
  }
  function endSelection(){
    selecting = false;
    drawSelectionOverlay();
  }

  // mouse events
  canvas.addEventListener('mousedown', (e) => { startSelection(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => { moveSelection(e.clientX, e.clientY); });
  window.addEventListener('mouseup', (e) => { endSelection(); });

  // touch events (map to same handlers)
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; startSelection(t.clientX, t.clientY); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.touches[0]; moveSelection(t.clientX, t.clientY); });
  canvas.addEventListener('touchend', (e) => { e.preventDefault(); endSelection(); });

  function drawSelectionOverlay(){
    if(!img) return;
    const tempImg = new Image();
    tempImg.onload = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(tempImg, 0,0,canvas.width,canvas.height);

      if (selRect && (selRect.w>0 && selRect.h>0)){
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0,0,canvas.width,selRect.y);
        ctx.fillRect(0,selRect.y+selRect.h,canvas.width,canvas.height-(selRect.y+selRect.h));
        ctx.fillRect(0,selRect.y,selRect.x,selRect.h);
        ctx.fillRect(selRect.x+selRect.w,selRect.y,canvas.width-(selRect.x+selRect.w),selRect.h);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = '#7be3ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6,4]);
        ctx.strokeRect(selRect.x+0.5, selRect.y+0.5, selRect.w, selRect.h);
        ctx.restore();
      }
    };
    tempImg.src = displayImageDataURL || canvas.toDataURL();
  }

  cropBtn.addEventListener('click', () => {
    if(!img) return;
    const sx = selRect && selRect.w>0 ? selRect.x : 0;
    const sy = selRect && selRect.h>0 ? selRect.y : 0;
    const sw = selRect && selRect.w>0 ? selRect.w : canvas.width;
    const sh = selRect && selRect.h>0 ? selRect.h : canvas.height;

    const out = document.createElement('canvas');
    out.width = sw; out.height = sh;
    const outCtx = out.getContext('2d');
    outCtx.drawImage(canvas, sx, sy, sw, sh, 0,0, sw, sh);

    const data = out.toDataURL('image/png');
    const newImg = new Image();
    newImg.onload = () => {
      img = newImg; rotation = 0; flipH = false; flipV = false; selRect = null;
      renderToCanvas(); updatePreview();
    };
    newImg.src = data;
  });

  rotateLeftBtn.addEventListener('click', () => { if(!img) return; rotation = (rotation - 90) % 360; renderToCanvas(); updatePreview(); drawSelectionOverlay(); });
  rotateRightBtn.addEventListener('click', () => { if(!img) return; rotation = (rotation + 90) % 360; renderToCanvas(); updatePreview(); drawSelectionOverlay(); });
  flipHBtn.addEventListener('click', () => { if(!img) return; flipH = !flipH; renderToCanvas(); updatePreview(); drawSelectionOverlay(); });
  flipVBtn.addEventListener('click', () => { if(!img) return; flipV = !flipV; renderToCanvas(); updatePreview(); drawSelectionOverlay(); });

  resetBtn.addEventListener('click', () => { if(!img) return; rotation = 0; flipH = false; flipV = false; selRect = null; renderToCanvas(); updatePreview(); });

  downloadBtn.addEventListener('click', () => {
    if(!img) return;
    const type = exportType.value || 'png';
    const quality = parseFloat(jpegQuality.value) || 0.9;

    if(type === 'png'){
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'edited-image.png';
      document.body.appendChild(a); a.click(); a.remove();
      return;
    }

    // JPEG: ensure no transparency by drawing white background first
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width; tmp.height = canvas.height;
    const tctx = tmp.getContext('2d');
    tctx.fillStyle = window.getComputedStyle(document.body).backgroundColor || '#fff';
    tctx.fillRect(0,0,tmp.width,tmp.height);
    tctx.drawImage(canvas,0,0);
    const data = tmp.toDataURL('image/jpeg', quality);
    const a = document.createElement('a');
    a.href = data; a.download = 'edited-image.jpg'; document.body.appendChild(a); a.click(); a.remove();
  });

  function updatePreview(){
    if(!img){ pctx.clearRect(0,0,preview.width,preview.height); return; }
    const w = canvas.width, h = canvas.height;
    const pw = preview.width, ph = preview.height;
    const s = Math.min(pw / w, ph / h);
    pctx.clearRect(0,0,pw,ph);
    pctx.drawImage(canvas, 0,0,w,h, 0,0, Math.round(w*s), Math.round(h*s));
  }

  // initial empty message
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#999';
  ctx.font = '16px system-ui, Arial';
  ctx.fillText('No image loaded — choose a file above', 20, 40);

  // expose a small API for debugging
  window._editor = { renderToCanvas, updatePreview, drawSelectionOverlay };
})();
