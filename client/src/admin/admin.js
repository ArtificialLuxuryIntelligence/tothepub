import './styles.scss';
import regeneratorRuntime, { async } from 'regenerator-runtime'; // makes async await etc work
import { addPropertiesEdit, locationEditForm } from '../scripts/locationEditForm';
import allLocationInfo from './../data/allLocationInfo';
import { baseUrl } from './../config/url';

const root = document.getElementById('root');
(async () => {
  let edits = await getEditData(1);
  let allTags = await getTagData();
  // console.log(edits);

  //build display and update forms for all edit requests
  edits.forEach((pair) => {
    console.log(pair);
    let cont = document.createElement('div');
    cont.classList.add('compare-container');
    let original = locationEditForm(pair.original, allTags, allLocationInfo);
    original.classList.add('original-form');
    cont.appendChild(original);

    let edited = locationEditForm(
      pair.edit,
      allTags,
      allLocationInfo,

      `${baseUrl}/api/admin/edit`,

      pair.original._id
    );
    edited.classList.add('edited-form');

    //highlight changed parts of the doc
    const changedLabels = [...edited.getElementsByTagName('label')];
    const changedOptions = [...edited.getElementsByTagName('option')];
    let differences = getDifferences(pair.original, pair.edit); //warning :mutates!
    changedLabels.forEach((l) => {
      differences.includes(l.textContent) ? l.classList.add('diff') : null;
    });
    changedOptions.forEach((l) => {
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
        if (optionsO.filter((p) => p.name == o.name)[0].value !== o.value) {
          o.previousSibling.classList.add('diff');
        }
      });
    //input to add new tag in edit form for dropdowns
    optionsE.forEach((s) => addOption(s));

    // Button: Delete edit without updating db:
    let delForm = document.createElement('form');
    let hidden = document.createElement('input');
    hidden.name = 'id';
    hidden.value = pair.original._id;
    hidden.type = 'hidden';
    let submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'delete without accepting changes';
    delForm.classList.add('delete-form');
    delForm.appendChild(hidden);
    delForm.appendChild(submit);
    delForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        let url = `${baseUrl}/api/admin/deleteedit?id=${e.target.id.value}`;

        let res = await fetch(url, { method: 'post' });
        let json = await res.json();
        console.log(res.status, json);
        if (res.status == 200) {
          //refresh page
          location.reload();
        } else {
          throw new Error({ error: 'uh oh' });
        }
      } catch (err) {
        console.error(err);
        //show error
      }
    });
    cont.appendChild(edited);
    cont.appendChild(delForm);
    root.appendChild(cont);
  });
})();

// helper
async function getTagData() {
  let url = `${baseUrl}/api/location/tags`;
  let response = await fetch(url);
  let result = await response.json();
  return result.doc;
}

async function getEditData(page) {
  let url = `${baseUrl}/api/admin/edits?page=${page}`;
  let response = await fetch(url);
  let json = await response.json();
  return json.response;
}

//note: mutates objects
function getDifferences(original, edited) {
  const { tags: originalTags } = original.properties;
  const { tags: editedTags } = edited.properties;
  delete original.properties.tags;
  delete edited.properties.tags;
  const originalProperties = Object.keys(original.properties);
  const editedProperties = Object.keys(edited.properties);

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

  return [...changedProperties, ...changedTags];
}

function addOption(selectNODE) {
  let newOption = document.createElement('div');
  newOption.classList.add('adder');
  let t = document.createElement('p');
  t.innerText = 'add new option for dropdown below:';
  let input = document.createElement('input');
  input.type = 'text';
  let b = document.createElement('button');
  b.innerText = 'add option';
  b.addEventListener('click', (e) => {
    // e.stopImmediatePropagation();
    e.preventDefault();
    let option = document.createElement('option');
    option.innerText = input.value;
    option.selected = 'true';
    input.value = '';
    selectNODE.appendChild(option);
  });
  newOption.appendChild(t);
  newOption.appendChild(input);
  newOption.appendChild(b);
  // console.log(newOption)

  let i = selectNODE.parentNode.insertBefore(
    newOption,
    selectNODE.previousElementSibling
  );
}
