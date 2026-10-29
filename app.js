'use strict';

const byId = (id) => document.getElementById(id);
const sides = ['before', 'after'];
const images = { before: null, after: null };
const revisions = { before: 0, after: 0 };
const stage = byId('stage');
const divider = byId('divider');
const zoom = byId('zoom');
const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function renderView() {
  const split = Number(divider.value);
  stage.style.setProperty('--split', `${split}%`);
  stage.style.setProperty('--zoom', zoom.value);
  byId('divider-value').textContent = `${split}% before`;
  divider.setAttribute('aria-valuetext', `${split} percent before, ${100 - split} percent after`);
}

function renderImages() {
  const ready = Boolean(images.before && images.after);
  stage.classList.toggle('ready', ready);
  stage.style.aspectRatio = ready ? String(images.before.width / images.before.height) : '4 / 3';
  byId('empty-state').hidden = ready;
  byId('before-image').hidden = !ready;
  byId('after-layer').hidden = !ready;
  byId('divider-line').hidden = !ready;
  divider.disabled = !ready;
  zoom.disabled = !ready;
  byId('reset-view').disabled = !ready;
  byId('dimension-warning').hidden = !ready || Math.abs(images.before.width / images.before.height - images.after.width / images.after.height) < 0.01;
  if (!ready) {
    const loaded = images.before ? 'before' : images.after ? 'after' : null;
    byId('empty-state').querySelector('span').textContent = loaded
      ? `${loaded === 'before' ? 'Before' : 'After'} is ready. Choose the other image to compare.`
      : 'Choose a before and an after image above.';
  }
}

function imageStatus(side, message, error = false) {
  const status = byId(`${side}-status`);
  status.textContent = message;
  status.classList.toggle('error', error);
}

async function loadImage(side, file) {
  if (!file) return;
  const revision = ++revisions[side];
  let objectUrl;
  try {
    if (!acceptedTypes.has(file.type)) throw new Error('Choose a PNG, JPEG, or WebP image.');
    if (file.size > 20 * 1024 * 1024) throw new Error('This image is over 20 MB. Save a smaller copy and try again.');
    imageStatus(side, 'Opening image on your device…');
    objectUrl = URL.createObjectURL(file);
    const decoded = new Image();
    decoded.src = objectUrl;
    await decoded.decode();
    if (revision !== revisions[side]) return;
    if (decoded.naturalWidth * decoded.naturalHeight > 36_000_000) {
      throw new Error('This image is over 36 megapixels. Resize a copy and try again.');
    }
    const previous = images[side];
    images[side] = { url: objectUrl, width: decoded.naturalWidth, height: decoded.naturalHeight };
    byId(`${side}-image`).src = objectUrl;
    objectUrl = null;
    if (previous) URL.revokeObjectURL(previous.url);
    imageStatus(side, `${decoded.naturalWidth} × ${decoded.naturalHeight} pixels · ready on this device`);
    renderImages();
  } catch (error) {
    if (revision !== revisions[side]) return;
    const message = error instanceof Error && error.name !== 'EncodingError'
      ? error.message : 'This file could not be opened. Try a different PNG, JPEG, or WebP image.';
    imageStatus(side, `${message}${images[side] ? ' Your previous image is still in use.' : ''}`, true);
    byId(`${side}-file`).value = '';
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function renderLabel(side) {
  const label = byId(`${side}-label`).value.trim() || (side === 'before' ? 'Before' : 'After');
  byId(`${side}-caption`).textContent = label;
  byId(`${side}-image`).alt = `${label}: ${side} image selected on your device`;
}

for (const side of sides) {
  byId(`${side}-file`).addEventListener('change', (event) => loadImage(side, event.target.files[0]));
  byId(`${side}-label`).addEventListener('input', () => renderLabel(side));
}
divider.addEventListener('input', renderView);
zoom.addEventListener('change', renderView);
byId('reset-view').addEventListener('click', () => {
  divider.value = '50';
  zoom.value = '1';
  renderView();
});

function moveDivider(event) {
  const bounds = stage.getBoundingClientRect();
  divider.value = String(Math.round(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))));
  renderView();
}
stage.addEventListener('pointerdown', (event) => {
  if (divider.disabled || event.button !== 0) return;
  stage.setPointerCapture(event.pointerId);
  moveDivider(event);
});
stage.addEventListener('pointermove', (event) => {
  if (stage.hasPointerCapture(event.pointerId)) moveDivider(event);
});
stage.addEventListener('pointerup', (event) => {
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
});

byId('export-notes').addEventListener('click', () => {
  const notes = {
    format: 'makeup-comparison-notes',
    version: 1,
    createdAt: new Date().toISOString(),
    question: byId('question').value.trim(),
    labels: Object.fromEntries(sides.map((side) => [side, byId(`${side}-label`).value.trim() || side])),
    comparisonCheck: byId('fairness').value,
    observations: byId('observations').value.trim(),
    nextPracticeStep: byId('practice').value.trim(),
    view: { beforePercent: Number(divider.value), zoom: Number(zoom.value) },
    images: Object.fromEntries(sides.map((side) => [side, images[side] ? { width: images[side].width, height: images[side].height } : null])),
    scope: 'Personal observations for styling practice, not a medical assessment or a measure of AI accuracy. Images and original filenames are not included.',
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(notes, null, 2) + '\n'], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `makeup-comparison-notes-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  byId('export-status').textContent = 'Notes file prepared. Check your browser downloads.';
});

byId('clear-workspace').addEventListener('click', () => {
  if (!window.confirm('Clear both images and all unsaved notes? Export your notes first if you want to keep them.')) return;
  for (const side of sides) {
    revisions[side] += 1;
    if (images[side]) URL.revokeObjectURL(images[side].url);
    images[side] = null;
    byId(`${side}-file`).value = '';
    byId(`${side}-image`).removeAttribute('src');
    byId(`${side}-label`).value = side === 'before' ? 'Before' : 'After';
    imageStatus(side, 'No image chosen.');
    renderLabel(side);
  }
  for (const id of ['question', 'observations', 'practice']) byId(id).value = '';
  byId('fairness').value = 'not-assessed';
  byId('export-status').textContent = '';
  divider.value = '50';
  zoom.value = '1';
  renderView();
  renderImages();
  byId('before-file').focus();
});

renderView();
renderImages();
