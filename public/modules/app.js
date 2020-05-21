'use strict';

const updateButton = document.getElementById('update');

const updateForm = document.getElementById('update-form');

updateForm.style = 'display : none' ;

updateButton.addEventListener('click', () => {
  updateForm.style = '';
});
