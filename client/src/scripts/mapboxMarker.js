// note: actually more accurately should be called popup content..

//call this something more generic (used in admin page too but with a different submit url)
// function locationEditForm(pub,allTags,allLocationInfo, submitURL=null) [if ===null then don't include submitbutton or comments box]
import { showTempModal, createEC } from './helpers';

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
  // --- tags
  pub.properties.tags.forEach((tag) => {
    let p = createEC('p', tag, 'popup-tag');
    content.appendChild(p);
  });
  // -----additional location information

  //toggle locations info open
  let infoToggle = createEC('button', '', 'infoToggle');
  infoToggle.appendChild(createEC('span', '', ''));

  let infoContainer = createEC('div', null, 'hidden');
  infoContainer.classList.add('infoContainer');

  infoToggle.addEventListener('click', (e) => {
    infoContainer.classList.toggle('hidden');
  });

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
          a.target = '_blank';
          a.rel = `noopener noreferrer`;

          infoContainer.appendChild(a);
        } else {
          let p = createEC(
            'p',
            `${key} : ${pub.properties[key]}`,
            'popup-info'
          );
          infoContainer.appendChild(p);
        }
      }
    });
  // if no info available

  if (infoContainer.textContent === '') {
    let p = createEC('p', 'no information available');
    infoContainer.appendChild(p);
  }

  // ----------------------- EDIT FORM

  //toggle edit form open
  let editToggle = createEC('button', '', 'editToggle');
  editToggle.appendChild(createEC('span', '', ''));
  let form = createEC('form', null, 'hidden');
  editToggle.addEventListener('click', (e) => {
    form.classList.toggle('hidden');
  });

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
    let tags = cat.tags.map((t) => t.tag);
    switch (cat.editDisplay) {
      case 'dropdown':
        addDropdown(pub, cat.category, tags, form);
        break;
      case 'boolean':
        addBoolean(pub, cat.category, tags[0], form);
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

          showTempModal('Thank you for your help', 1500);
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

  // add content
  content.appendChild(editToggle);
  content.appendChild(infoToggle);
  content.appendChild(infoContainer);
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

    let i;
    if (info.value == 'comments') {
      let p = createEC(
        'p',
        'Missing operator? Tag idea? Please comment below:',
        'comment-prompt'
      );
      parent.appendChild(p);

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

export { addPropertiesEdit, locationEditForm, showTempModal };
