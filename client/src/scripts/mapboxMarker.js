function markerContent(pub, allTags, allLocationInfo) {
  const allLocationInfoDisplay = allLocationInfo.map(
    (o) => o.display && o.value
  );

  let content = document.createElement('div');

  // DISPLAYED CONTENT
  //title
  let h3 = createEC('h3', pub.properties.name);
  content.appendChild(h3);
  //tags
  pub.properties.tags.forEach((tag) => {
    let p = createEC('p', tag, 'marker-tag');
    content.appendChild(p);
  });
  //additional information
  Object.keys(pub.properties)
    .filter(function (key) {
      return allLocationInfoDisplay.includes(key); //include this info
    })
    .forEach((key) => {
      let p = createEC('p', pub.properties[key], 'marker-info');
      content.appendChild(p);
    });

  //EDIT LOCATION FORM
  let form = document.createElement('form');

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

  let comment = createEC('p', 'Other tag suggestion or comments? :');
  form.appendChild(comment);
  let textarea = createEC('textarea', null, null, null, null, 'comments');
  form.appendChild(textarea);

  //-------------------------  submit
  let submit = createEC('input', 'submit', null, null, 'submit');
  form.appendChild(submit);

  form.addEventListener('submit', async (e) => {
    const url = `http://localhost:5000/api/location/tags`;
    e.preventDefault();
    const formdata = new FormData(e.target);
    // Testing: display the values
    console.log('data', ...formdata);
    try {
      await fetch(url, {
        body: formdata,
        // headers: {
        //      "Content-Type": "multipart/form-data",
        // },
        method: 'post',
      });
    } catch (err) {
      //HANDLE ERROR!
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
    group.appendChild(i);
    group.appendChild(l);
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