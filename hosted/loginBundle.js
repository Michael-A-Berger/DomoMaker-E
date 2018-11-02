'use strict';

// handleLogin()
var handleLogin = function handleLogin(e) {
  // Preventing default redirect behavior + hiding the Domo error
  e.preventDefault();
  $('#domoMessage').animate({ width: 'hide' }, 350);

  // IF not all the fields are filled in...
  if ($('#user').val() == '' || $('#pass').val() == '') {
    handleError("RAWR! Username or password is empty");
    return false;
  }

  console.log($('input[name=_csrf]').val());

  sendAjax('POST', $('#loginForm').attr('action'), $('#loginForm').serialize(), redirect);

  return false;
};

// handleSignup()
var handleSignup = function handleSignup(e) {
  // Preventing default redirect behavior + hiding the Domo error
  e.preventDefault();
  $('#domoMessage').animate({ width: 'hide' }, 350);

  // IF not all of the fields are filled in...
  if ($('#user').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  // IF both password fields are not the same...
  if ($('#pass').val() !== $('#pass2').val()) {
    handleError("RAWR! Passwords do not match");
    return false;
  }

  // 
  sendAjax('POST', $('#signupForm').attr('action'), $('#signupForm').serialize(), redirect);

  return false;
};

// LoginWindow()
var LoginWindow = function LoginWindow(props) {
  return React.createElement(
    'form',
    { id: 'loginForm',
      name: 'loginForm',
      onSubmit: handleLogin,
      action: '/login',
      method: 'POST',
      className: 'mainForm' },
    React.createElement(
      'label',
      { htmlFor: 'username' },
      'Username: '
    ),
    React.createElement('input', { id: 'user', type: 'text', name: 'username', placeholder: 'username' }),
    React.createElement(
      'label',
      { htmlFor: 'pass' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'formSubmit', type: 'submit', value: 'Sign In' })
  );
};

// SignupWindow()
var SignupWindow = function SignupWindow(props) {
  return React.createElement(
    'form',
    { id: 'signupForm',
      name: 'signupForm',
      onSubmit: handleSignup,
      action: '/signup',
      method: 'POST',
      className: 'mainForm' },
    React.createElement(
      'label',
      { htmlFor: 'username' },
      'Username: '
    ),
    React.createElement('input', { id: 'user', type: 'text', name: 'username', placeholder: 'username' }),
    React.createElement(
      'label',
      { htmlFor: 'pass' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'password' }),
    React.createElement(
      'label',
      { htmlFor: 'pass2' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass2', type: 'password', name: 'pass2', placeholder: 'retype password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'formSubmit', type: 'submit', value: 'Sign Up' })
  );
};

// createLoginWindow()
var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector('#content'));
};

// createSignupWindow()
var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector('#content'));
};

// setup()
var setup = function setup(csrf) {
  var loginButton = document.querySelector('#loginButton');
  var signupButton = document.querySelector('#signupButton');

  signupButton.addEventListener('click', function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });

  loginButton.addEventListener('click', function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });

  // Setting up the default view
  createLoginWindow(csrf);
};

// getToken()
var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

// When the page has loaded...
$(document).ready(function () {
  getToken();
});
'use strict';

// handleError()
var handleError = function handleError(msg) {
  $('#errorMessage').text(msg);
  $('#domoMessage').animate({ width: 'toggle' }, 350);
};

// redirect()
var redirect = function redirect(response) {
  $('#domoMessage').animate({ width: 'hide' }, 350);
  window.location = response.redirect;
};

// sendAjax()
var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'json',
    success: success,
    error: function error(xhr, status, _error) {
      var msgObj = JSON.parse(xhr.responseText);
      handleError(msgObj.error);
    }
  });
};
