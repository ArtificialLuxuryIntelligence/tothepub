import './styles.scss';
import regeneratorRuntime, { async } from 'regenerator-runtime'; // makes async await etc work
import { addPropertiesEdit, locationEditForm } from './../scripts/mapboxMarker';

const root = document.getElementById('root');
(async () => {
  let edits = await getEditData(1);
  let allTags = await getTagData();
  // console.log(edits);

  edits.forEach((pair) => {
    // console.log(pair.original);
    let cont = document.createElement('div');
    cont.classList.add('compare-container');

    let original = locationEditForm(pair.original, allTags, allLocationInfo);
    original.classList.add('original-form');
    cont.appendChild(original);
    let edited = locationEditForm(
      pair.edit,
      allTags,
      allLocationInfo,
      'http://localhost:5000/api/admin/edit',
      pair.original._id
    );
    edited.classList.add('edited-form');
    const changedLabels = [...edited.getElementsByTagName('label')];
    const changedSelects = [...edited.getElementsByTagName('option')];
    let differences = getDifferences(pair.original, pair.edit); //mutates!
    changedLabels.forEach((l) => {
      differences.includes(l.textContent) ? l.classList.add('diff') : null;
    });
    changedSelects.forEach((l) => {
      differences.includes(l.textContent) && l.selected == true
        ? l.parentNode.previousSibling.classList.add('diff')
        : null;
    });
    //case: changed from selected to no selected option
    let optionsE = [...edited.getElementsByTagName('select')];
    let optionsO = [...original.getElementsByTagName('select')];
    optionsE
      .filter((o) => o.value == '')
      .forEach((o) => {
        console.log(o);
        if (optionsO.filter((p) => p.name == o.name)[0].value !== o.value) {
          o.previousSibling.classList.add('diff');
        }
      });

    cont.appendChild(edited);
    root.appendChild(cont);
  });
})();

// helper
async function getTagData() {
  let url = `http://localhost:5000/api/location/tags`;
  let response = await fetch(url);
  let result = await response.json();
  return result.doc;
}

async function getEditData(page) {
  const url = `http://localhost:5000/api/admin/edits?page=${page}`;
  let response = await fetch(url);
  let json = await response.json();
  // console.log(json.response);
  return json.response;
}

const allLocationInfo = [
  { value: 'name', type: 'text', display: false }, //already displayed as title
  { value: 'phone', type: 'tel', display: true },
  { value: 'website', type: 'text', display: true },
  { value: 'opening-hours', type: 'text', display: true },
];

//note: mutates objects
function getDifferences(original, edited) {
  // console.log(original, edited);
  const { tags: originalTags } = original.properties;
  const { tags: editedTags } = edited.properties;
  delete original.properties.tags;
  delete edited.properties.tags;
  const originalProperties = Object.keys(original.properties);
  const editedProperties = Object.keys(edited.properties);

  // console.log(originalTags);
  function compareArrays(a1, a2) {
    return a1.map((t) => (a2.includes(t) ? null : t)).filter((t) => t !== null);
  }
  let changed = compareArrays(originalTags, editedTags); //added
  let rev_changed = compareArrays(editedTags, originalTags); //removed
  let changedTags = [...changed, ...rev_changed];

  let changedProperties = [];
  editedProperties.forEach((k) => {
    if (original.properties[k] != edited.properties[k]) {
      changedProperties.push(k);
    }
  });

  // return [changedProperties, changedTags];
  return [...changedProperties, ...changedTags];
}
