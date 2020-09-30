//DOM helper
function createEC(
  el,
  content,
  className = null,
  id = null,
  type = null,
  name = null,
  value = null,
  forr = null
) {
  let e = document.createElement(el);
  className && e.classList.add(className);
  id && (e.id = id);
  type && (e.type = type);
  name && (e.name = name);
  value && (e.value = value);
  forr && e.setAttribute('for', forr);

  e.innerText = content;
  return e;
}

function showTempModal(message, time) {
  const body = document.querySelector('body');
  let tm = createEC('div', null, 'temp-modal');
  let msg = createEC('h3', message);
  tm.appendChild(msg);
  body.appendChild(tm);

  setTimeout(() => tm.classList.add('fadeOut'), time);
  setTimeout(() => body.removeChild(tm), time + 500);
}

export { showTempModal, createEC };
