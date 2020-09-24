function markerContent(pub, allTags, allLocationInfo) {
  const allLocationInfoDisplay = allLocationInfo.map(
    (o) => o.display && o.value
  );

  let content = document.createElement('div');

  // ----------------------- DEFAULT DISPLAYED CONTENT
  //title
  let h3 = createEC('h3', pub.properties.name);
  content.appendChild(h3);
  //tags
  pub.properties.tags.forEach((tag) => {
    let p = createEC('p', tag, 'popup-tag');
    content.appendChild(p);
  });
  //additional information
  Object.keys(pub.properties)
    .filter(function (key) {
      return allLocationInfoDisplay.includes(key); //filters information to display
    })
    .forEach((key) => {
      let p = createEC('p', `${key} : ${pub.properties[key]}`, 'popup-info');
      content.appendChild(p);
    });
  let toggle = createEC('button', 'edit');
  toggle.addEventListener('click', (e) => {
    e.target.nextElementSibling.classList.toggle('hidden');
  });
  content.appendChild(toggle);

  // ----------------------- EDIT FORM DEFAULT HIDDEN CONTENT
  let form = createEC('form', null, 'hidden');
  let id = createEC('input', null, null, null, 'hidden', 'id', pub._id);
  form.appendChild(id);
  // --------------------edit location tags
  let h4 = createEC('h4', 'edit tags');
  form.appendChild(h4);

  //add appropriate input for all tags
  allTags.forEach((cat) => {
    let h = createEC('h5', cat.category);
    form.appendChild(h);
    switch (cat.display) {
      case 'dropdown':
        addDropdown(pub, cat.category, cat.tags, form);
        break;
      case 'boolean':
        addBoolean(pub, cat.category, form);
        null;
        break;
      default:
      // addDropdown(cat.tags, form);
    }
  });
  // addDropdown(allTags, form);

  // ------------------------add location specific content
  h4 = createEC('h4', 'edit info');
  form.appendChild(h4);
  addPropertiesEdit(pub.properties, form, allLocationInfo);

  // ------------------------addition comments//

  let comment = createEC('p', 'Other tag suggestions or comments? :');
  form.appendChild(comment);
  let textarea = createEC('textarea', null, null, null, null, 'comments');
  form.appendChild(textarea);

  //-------------------------  submit
  let submit = createEC('input', 'submit', null, null, 'submit', 'submitb');
  form.appendChild(submit);

  form.addEventListener('submit', async (e) => {
    const url = `http://localhost:5000/api/location/tags`;
    e.preventDefault();
    e.target.submitb.disabled = true;
    const formdata = new FormData(e.target);
    // Testing: display the values
    console.log('data', ...formdata);
    try {
      let response = await fetch(url, {
        body: formdata,
        // headers: {
        //      "Content-Type": "multipart/form-data",
        // },
        method: 'post',
      });
      let json = await response.json();
      if (response.status === 200) {
        e.target.submitb.disabled = false;

        e.target.classList.toggle('hidden');
        let body = document.querySelector('body');
        let tm = createEC('div', null, 'temp-modal');
        let message = createEC('h3', 'Thank you for your help!');
        tm.appendChild(message);
        body.appendChild(tm);

        setTimeout(() => tm.classList.add('fadeOut'), 1000);
        setTimeout(() => body.removeChild(tm), 1500);
      }
    } catch (err) {
      e.target.submitb.disabled = false;

      //HANDLE ERROR!
      //TODP -display some text at bottom of form
      console.err(err);
    }
  });
  content.appendChild(form);
  return content;
}
//TAG EDITING HELPERS

function addDropdown(pub, category, tags = [], parent) {
  // .filter((tag) => tag.category == "real ale")
  let group = createEC('div', null, 'input-group');
  let dd = createEC('select', null, null, null, null, category);

  tags.forEach(function (tag) {
    let i = createEC('option', tag);
    pub.properties.tags.includes(tag) ? (i.selected = 'selected') : null;
    dd.appendChild(i);
    group.appendChild(dd);
    parent.appendChild(group);
  });
}

function addBoolean(pub, tag, parent) {
  let group = createEC('div', null, 'input-group');
  let i = createEC('input', tag, null, tag, 'checkbox', tag, 'true');
  pub.properties.tags.includes(tag) ? (i.checked = true) : null;
  let l = createEC('label', tag, null, null, null, null, tag, tag);
  group.appendChild(i);
  group.appendChild(l);
  parent.appendChild(group);
}

// INFO EDITING HELPERS

function addPropertiesEdit(properties = {}, parent, allLocationInfo) {
  allLocationInfo.forEach((info) => {
    //currently only allows for types of input ()
    //TODO: allow for dropdowns?
    let group = createEC('div', null, 'input-group');
    let i = createEC(
      'input',
      null,
      null,
      info.value,
      info.type,
      info.value,
      properties[info.value]
    );

    // pub.properties.tags.includes(tag) ? (i.checked = true) : null;
    let l = createEC(
      'label',
      info.value,
      null,
      null,
      null,
      null,
      info.value,
      info.value
    );
    group.appendChild(l);
    group.appendChild(i);
    parent.appendChild(group);
  });
}

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

export default markerContent;
