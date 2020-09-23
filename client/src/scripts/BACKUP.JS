import './styles.css';

console.clear();

const pub = {
  properties: {
    name: 'The Montagu Pyke',
    tags: ["Samuel Smith's", 'real-ale'],
    amenity: 'pub',
    phone: '435430945',
  },
  geometry: {
    type: 'Point',
    coordinates: [-0.13015774499999996, 51.51397422000001],
  },
  _id: '5f6b39625ce5617626ca49f0',
  type: 'Feature',
  __v: 0,
  duration: 459.407,
};

//need route for these (not the same as the homepage dropdown or are they...?)
//pass into draw maps fn from index.js initial request (for dropdown)

const allTags = [
  {
    category: 'operator',
    display: 'dropdown',
    tags: [`Samuel Smith's`, `Weatherspoons`],
  },
  { category: 'real-ale', display: 'boolean', tags: ['real-ale'] },
  { category: 'parking', display: 'boolean', tags: ['parking'] },

  //if boolean then just use the value for the tag hardcoded for convenience
];

// information about the location [non-tag data - not filterable]
//for this data to be searchable it could be possible add extra tags for the existence of this info]

//NOTE: this data coincides with the OSM properties
const locationInfo = [
  { value: 'name', type: 'text', display: false }, //already displayed as title
  { value: 'amenity', type: 'text', display: true },
  { value: 'phone', type: 'tel', display: true },
  { value: 'website', type: 'text', display: true },
];
const locationInfoDisplay = locationInfo.map((o) => o.display && o.value);

let app = document.getElementById('app');

function markerContent(pub, allTags) {
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
      return locationInfoDisplay.includes(key); //include this info
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
        addDropdown(cat.tags, form);
        break;
      case 'boolean':
        addBoolean(cat.category, form);
        null;
        break;
      default:
      // addDropdown(cat.tags, form);
    }
  });
  // addDropdown(allTags, form);

  // ------------------------addition comments//

  let comment = createEC('p', 'Other tag suggestion or comments? :');
  form.appendChild(comment);
  let textarea = createEC('textarea', null, null, null, null, 'comments');
  form.appendChild(textarea);

  // ------------------------add location specific content
  h4 = createEC('h4', 'edit info');
  form.appendChild(h4);
  addPropertiesEdit(pub.properties, form);
  //---
  let submit = createEC('input', 'submit', null, null, 'submit');
  form.appendChild(submit);

  // -------------------------submit to send data
  form.addEventListener('submit', async (e) => {
    const url = `http://localhost:5000/api/location/tags`;
    e.preventDefault();
    const formdata = new FormData(e.target);
    // Testing: display the values
    console.log('data', ...formdata);

    await fetch(url, {
      body: formdata,
      // headers: {
      //      "Content-Type": "multipart/form-data",
      // },
      method: 'post',
    });
  });
  content.appendChild(form);
  return content;
}
//TAG EDITING HELPERS

function addDropdown(tags = [], parent) {
  // .filter((tag) => tag.category == "real ale")
  let group = createEC('div', null, 'input-group');
  let dd = createEC('select');
  tags.forEach(function (tag) {
    let i = createEC('option', tag);
    pub.properties.tags.includes(tag) ? (i.selected = 'selected') : null;
    dd.appendChild(i);
    group.appendChild(dd);
    parent.appendChild(group);
  });
}

function addBoolean(tag, parent) {
  let group = createEC('div', null, 'input-group');
  let i = createEC('input', tag, null, tag, 'checkbox', tag, 'true');
  pub.properties.tags.includes(tag) ? (i.checked = true) : null;
  let l = createEC('label', tag, null, null, null, null, tag, tag);
  group.appendChild(i);
  group.appendChild(l);
  parent.appendChild(group);
}

// INFO EDITING HELPERS

function addPropertiesEdit(properties = {}, parent) {
  locationInfo.forEach((info) => {
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



//DOM helper : add Element with Content to Parent node
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

app.appendChild(markerContent(pub, allTags));
