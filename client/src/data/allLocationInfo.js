//  Display boolean: whether or not to display value clientside in markerpopup
//  Display true: value displayed in popup marker clientside (unless value is empty)
//  Display false: value is still available to edit

const allLocationInfo = [
  { value: 'name', type: 'text', display: false }, //already displayed as title
  { value: 'phone', type: 'tel', display: true },
  { value: 'website', type: 'text', display: true },
  { value: 'opening-hours', type: 'text', display: true },
  { value: 'comments', display: false },
];

export default allLocationInfo;
