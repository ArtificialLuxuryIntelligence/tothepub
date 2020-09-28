// note: actually more accurately should be called popup content..

//call this something more generic (used in admin page too but with a different submit url)
// function locationEditForm(pub,allTags,allLocationInfo, submitURL=null) [if ===null then don't include submitbutton or comments box]
function locationEditForm(
  pub,
  allTags,
  allLocationInfo,
  submitURL = null,
  pubId = null,
  comments = false
) {
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
      if (pub.properties[key] !== '') {
        console.log(key);
        if (key == 'website') {
          let website = pub.properties[key].replace(/(^\w+:|^)\/\//, '');
          let a = createEC('a', `${website}`, 'popup-info');
          a.href = ` ${pub.properties[key]}`;
          content.appendChild(a);
        } else {
          let p = createEC(
            'p',
            `${key} : ${pub.properties[key]}`,
            'popup-info'
          );
          content.appendChild(p);
        }
      }
    });
  let toggle = createEC('button', 'x', 'editToggle');
  toggle.addEventListener('click', (e) => {
    e.target.nextElementSibling.classList.toggle('hidden');
  });
  content.appendChild(toggle);

  // ----------------------- EDIT FORM

  let form = createEC('form', null, 'hidden');
  // ----  doc id
  let id = createEC('input', null, null, 'docId', 'hidden', 'id', pubId);
  form.appendChild(id);
  // --------------------edit location tags
  let h4 = createEC('h4', 'edit tags');
  form.appendChild(h4);

  //add appropriate input for ALL tags
  allTags.forEach((cat) => {
    // let h = createEC('h5', cat.category);
    // form.appendChild(h);
    switch (cat.editDisplay) {
      case 'dropdown':
        addDropdown(pub, cat.category, cat.tags, form);
        break;
      case 'boolean':
        addBoolean(pub, cat.category, cat.tags[0], form);
        null;
        break;
      default:
      // addDropdown(cat.tags, form);
    }
  });

  // ------------------------add location specific content
  h4 = createEC('h4', 'edit info');
  form.appendChild(h4);
  addPropertiesEdit(pub.properties, form, allLocationInfo);

  // ------------------------addition comments//

  if (submitURL) {
    //-------------------------  submit
    let submit = createEC('input', 'submit', null, null, 'submit', 'submitb');
    form.appendChild(submit);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.target.submitb.disabled = true;
      const formdata = new FormData(e.target);
      // Testing: display the values
      console.log('FORM DATA CLIENTSIDE');
      console.log('data', ...formdata);
      try {
        let response = await fetch(submitURL, {
          method: 'post',
          body: formdata,
          // headers: {
          //      "Content-Type": "multipart/form-data",
          // },
        });
        let json = await response.json();
        console.log(json);

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
        if (json.updated) {
          location.reload();
        }
      } catch (err) {
        e.target.submitb.disabled = false;

        //HANDLE ERROR!
        //TODP -display some text at bottom of form
        console.error(err);
      }
    });
  }
  content.appendChild(form);
  return content;
}
//TAG EDITING HELPERS

function addDropdown(pub, category, tags = [], parent) {
  // .filter((tag) => tag.category == "real ale")
  let group = createEC('div', null, 'input-group');
  let dd = createEC('select', null, null, category, null, category);
  let l = createEC('label', category, null, null, null, null, null, category);
  let i = createEC('option', ''); //empty first option
  dd.appendChild(i);

  tags.forEach((tag) => {
    let i = createEC('option', tag);
    pub.properties.tags.includes(tag) ? (i.selected = 'selected') : null;
    dd.appendChild(i);
  });

  group.appendChild(l);
  group.appendChild(dd);

  parent.appendChild(group);
}

function addBoolean(pub, category, tag, parent = form) {
  let group = createEC('div', null, 'input-group');
  let i = createEC('input', tag, null, tag, 'checkbox', tag, 'true');
  let i_hidden = createEC('input', null, null, null, 'hidden', tag, 'false');
  parent.addEventListener('submit', (e) => {
    i.checked ? (i_hidden.disabled = true) : null;
  });
  if (pub.properties.tags.includes(tag)) {
    i.checked = true;
    i_hidden.checked = false;
  }
  let l = createEC('label', tag, null, null, null, null, tag, tag);
  group.appendChild(l);
  group.appendChild(i);
  group.appendChild(i_hidden);

  parent.appendChild(group);
}

// INFO EDITING HELPERS

function addPropertiesEdit(properties = {}, parent, allLocationInfo) {
  allLocationInfo.forEach((info) => {
    //currently only allows for types of input ()
    //TODO: allow for dropdowns?

    let group = createEC('div', null, 'input-group');

    if (info.value == 'comments') {
      // let comment = createEC('p', 'Other tag suggestions or comments? :');
      // group.appendChild(comment);
      // let textarea = createEC('textarea', null, null, null, null, 'comments');
      // group.appendChild(textarea);
      // parent.appendChild(group);
      // return;
    }
    let i;
    if (info.value == 'comments') {
      i = createEC(
        'textarea',
        null,
        null,
        info.value,
        info.type,
        info.value,
        properties[info.value]
      );
    } else {
      i = createEC(
        'input',
        null,
        null,
        info.value,
        info.type,
        info.value,
        properties[info.value]
      );
    }

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

export { addPropertiesEdit, locationEditForm };
