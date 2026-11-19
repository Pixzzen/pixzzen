(function () {
  'use strict';
  var modal = document.getElementById('profileModal');
  if (!modal) return;
  var dialog = modal.querySelector('.profile-dialog');
  var previousFocus = null;
  function fillProfile(card) {
    var get = function (key) { return card.getAttribute('data-' + key) || ''; };
    var image = card.querySelector('.member-photo img');
    document.getElementById('profileName').textContent = get('name');
    document.getElementById('profileNameValue').textContent = get('name');
    document.getElementById('profileRole').textContent = get('role');
    document.getElementById('profileRoleValue').textContent = get('role');
    document.getElementById('profileDegree').textContent = get('degree');
    var experience = get('experience');
    document.getElementById('profileExperience').textContent = experience;
    document.getElementById('profileExperienceRow').hidden = !experience;
    document.getElementById('profileDescription').textContent = get('description');
    var skills = document.getElementById('profileSkills');
    skills.replaceChildren();
    get('skills').split(',').forEach(function (skill) {
      var chip = document.createElement('span');
      chip.className = 'skill-chip';
      chip.textContent = skill.trim();
      skills.appendChild(chip);
    });
    var profileImage = document.getElementById('profileImage');
    profileImage.src = image ? image.src : '';
    profileImage.alt = get('name');
  }
  function open(card) {
    previousFocus = document.activeElement;
    fillProfile(card);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.profile-close').focus();
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (previousFocus) previousFocus.focus();
  }
  document.querySelectorAll('[data-open-profile]').forEach(function (button) {
    button.addEventListener('click', function () { open(button.closest('.member')); });
  });
  modal.querySelectorAll('[data-close-profile]').forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (event) {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      var focusable = dialog.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
