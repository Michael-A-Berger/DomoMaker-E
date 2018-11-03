'use strict';

// loadDomosFromServer()
var loadDomosFromServer = function loadDomosFromServer() {
  sendAjax('GET', '/getDomos', null, function (data) {
    ReactDOM.render(React.createElement(DomoList, { domos: data.domos }), document.querySelector('#domos'));
  });
};

// handleDomo()
var handleDomo = function handleDomo(e) {
  // Preventing the default browser behavior + hiding the error Domo
  e.preventDefault();
  $('#domoMessage').animate({ width: 'hide' }, 350);

  // Hiding the Kitsu search results
  $('#weebSearch').hide();

  // Error checking
  if ($('#domoName').val() == '' || $('#domoAge').val() == '' || $('#domoWeeb').val() == '') {
    handleError('RAWR! All fields are required');
    return false;
  }

  // Submitting the Domo
  sendAjax('POST', $('#domoForm').attr('action'), $('#domoForm').serialize(), function () {
    loadDomosFromServer();
  });

  return false;
};

// selectWeebEntry()
var selectWeebEntry = function selectWeebEntry(e) {
  // Setting the anime entry form to the clicked example
  console.dir(e.target);
  $('#domoWeeb').val(e.target.innerText);

  // Hiding the weeb searches
  $('#weebSearch').hide();
};

// handleWeebEntries()
var handleWeebEntries = function handleWeebEntries(entries) {
  // Defining the HTML to render
  var toRender = entries.map(function (entry) {
    return React.createElement(
      'div',
      { className: 'weebEntry', onClick: selectWeebEntry },
      React.createElement(
        'span',
        null,
        entry
      )
    );
  });
  toRender = React.createElement(
    'div',
    null,
    toRender
  );

  // Rendering the search entries to the page
  ReactDOM.render(toRender, document.querySelector('#weebSearch'));
};

// kitsuResponse()
var kitsuResponse = function kitsuResponse(data) {
  var results = data.data;
  var titles = {};
  var titleKeys = [];
  var entries = [];
  for (var num = 0; num < results.length; num++) {
    titles = results[num].attributes.titles;
    titleKeys = Object.keys(titles);
    for (var i = 0; i < titleKeys.length; i++) {
      var entryYear = 'TBD';
      if (results[num].attributes.startDate) {
        entryYear = results[num].attributes.startDate;
        entryYear = entryYear.substr(0, entryYear.indexOf('-'));
      }
      if (titles[titleKeys[i]] !== undefined) {
        entries.push(titles[titleKeys[i]] + ' (' + entryYear + ')');
        i = titleKeys.length;
      }
    }
  }

  // Rendering the search results
  handleWeebEntries(entries);

  // Showing the search results to the user
  $('#weebSearch').show();
};

// searchKitsu()
var searchKitsu = function searchKitsu(e) {
  if (e.target.value !== '' && e.target.value.length > 2) {
    console.log('==========\nSearching for "' + e.target.value + '" on Kitsu... ');
    sendAjax('GET', 'https://kitsu.io/api/edge/anime?filter[text]=' + e.target.value, null, kitsuResponse);
  }
};

// DomoForm()
var DomoForm = function DomoForm(props) {
  return React.createElement(
    'form',
    { id: 'domoForm',
      onSubmit: handleDomo,
      name: 'domoForm',
      action: '/maker',
      method: 'POST',
      className: 'domoForm' },
    React.createElement(
      'label',
      { htmlFor: 'name' },
      'Name: '
    ),
    React.createElement('input', { id: 'domoName', type: 'text', name: 'name', placeholder: 'Domo Name' }),
    React.createElement(
      'label',
      { htmlFor: 'age' },
      'Age: '
    ),
    React.createElement('input', { id: 'domoAge', type: 'text', name: 'age', placeholder: 'Domo Age' }),
    React.createElement(
      'label',
      { id: 'domoWeebLabel', htmlFor: 'weeb' },
      'Anime: '
    ),
    React.createElement('input', { id: 'domoWeeb', type: 'text', name: 'weeb', placeholder: 'Favorite Anime', onChange: searchKitsu }),
    React.createElement('div', { id: 'weebSearch' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'makeDomoSubmit', type: 'submit', value: 'Make Domo' })
  );
};

// DomoList()
var DomoList = function DomoList(props) {
  if (props.domos.length === 0) {
    return React.createElement(
      'div',
      { className: 'domoList' },
      React.createElement(
        'h3',
        { className: 'emptyDomo' },
        'No Domos yet'
      )
    );
  }

  var domoNodes = props.domos.map(function (domo) {
    return React.createElement(
      'div',
      { key: domo._id, className: 'domo' },
      React.createElement('img', { src: '/assets/img/domoface.jpeg', alt: 'domo face', className: 'domoFace' }),
      React.createElement(
        'h3',
        { className: 'domoName' },
        ' Name: ',
        domo.name,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'domoAge' },
        ' Age: ',
        domo.age,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'domoWeeb' },
        ' Fav. Weeb Trash: ',
        domo.weebTrash,
        ' '
      )
    );
  });

  return React.createElement(
    'div',
    { className: 'domoList' },
    domoNodes
  );
};

// setup()
var setup = function setup(csrf) {
  ReactDOM.render(React.createElement(DomoForm, { csrf: csrf }), document.querySelector('#makeDomo'));

  ReactDOM.render(React.createElement(DomoList, { domos: [] }), document.querySelector('#domos'));

  loadDomosFromServer();
};

// getToken()
var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

// Getting a CSRF token when the page has loaded
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

// kitsuSearch()
var kitsuSearch = function kitsuSearch(name, callback) {
  if (name.length > 2) {
    $.ajax({
      type: 'GET',
      url: 'https://kitsu.io/api/edge/anime?filter[text]=' + name,
      dataType: 'json',
      success: callback,
      error: function error(xhr, status, _error2) {
        var msgObj = JSON.parse(xhr.responseText);
        handleError(msgObj.errorMessage);
      }
    });
  }
};
