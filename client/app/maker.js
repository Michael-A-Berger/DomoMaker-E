// loadDomosFromServer()
const loadDomosFromServer = () => {
  sendAjax('GET', '/getDomos', null, (data) => {
    ReactDOM.render( <DomoList domos={data.domos} />,
                    document.querySelector('#domos'));
  });
};

// handleDomo()
const handleDomo = (e) => {
  // Preventing the default browser behavior + hiding the error Domo
  e.preventDefault();
  $('#domoMessage').animate({ width: 'hide' }, 350);
  
  // Hiding the Kitsu search results
  $('#weebSearch').hide();
  
  // Error checking
  if ($('#domoName').val() == ''
      || $('#domoAge').val() == ''
      || $('#domoWeeb').val() == '') {
    handleError('RAWR! All fields are required');
    return false;
  }
  
  // Submitting the Domo
  sendAjax('POST', $('#domoForm').attr('action'), $('#domoForm').serialize(), function() {
    loadDomosFromServer();
  });
  
  return false;
};

// selectWeebEntry()
const selectWeebEntry = (e) => {
  // Setting the anime entry form to the clicked example
  console.dir(e.target);
  $('#domoWeeb').val(e.target.innerText);
  
  // Hiding the weeb searches
  $('#weebSearch').hide();
};

// handleWeebEntries()
const handleWeebEntries = (entries) => {
  // Defining the HTML to render
  let toRender = entries.map((entry) => {
    return (
      <div className='weebEntry' onClick={selectWeebEntry}>
        <span>{entry}</span>
      </div>
    );
  });
  toRender = (
    <div>
      {toRender}
    </div>
  );
  
  // Rendering the search entries to the page
  ReactDOM.render(toRender, document.querySelector('#weebSearch'));
};

// kitsuResponse()
const kitsuResponse = (data) => {
  let results = data.data;
  let titles = {};
  let titleKeys = [];
  let entries = [];
  for (var num = 0; num < results.length; num++) {
    titles = results[num].attributes.titles;
    titleKeys = Object.keys(titles);
    for (var i = 0; i < titleKeys.length; i++) {
      let entryYear = 'TBD';
      if (results[num].attributes.startDate) {
        entryYear = results[num].attributes.startDate;
        entryYear = entryYear.substr(0, entryYear.indexOf('-'));
      }
      if (titles[titleKeys[i]] !== undefined) {
        entries.push(`${titles[titleKeys[i]]} (${entryYear})`);
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
const searchKitsu = (e) => {
	if (e.target.value !== '' && e.target.value.length > 2){
    console.log(`==========\nSearching for "${e.target.value}" on Kitsu... `);
		sendAjax('GET', 'https://kitsu.io/api/edge/anime?filter[text]=' + e.target.value, null, kitsuResponse);
	}
};


// DomoForm()
const DomoForm = (props) => {
  return (
    <form id='domoForm'
          onSubmit={handleDomo}
          name='domoForm'
          action="/maker"
          method='POST'
          className='domoForm'>
      <label htmlFor='name'>Name: </label>
      <input id='domoName' type='text' name='name' placeholder='Domo Name' />
      <label htmlFor='age'>Age: </label>
      <input id='domoAge' type='text' name='age' placeholder='Domo Age' />
      <label id='domoWeebLabel' htmlFor='weeb'>Anime: </label>
      <input id='domoWeeb' type='text' name='weeb' placeholder='Favorite Anime' onChange={searchKitsu} />
      <div id='weebSearch'></div>
      <input type='hidden' name='_csrf' value={props.csrf} />
      <input className='makeDomoSubmit' type='submit' value='Make Domo'/>
    </form>
  );
};

// DomoList()
const DomoList = (props) => {
  if (props.domos.length === 0) {
    return (
      <div className='domoList'>
        <h3 className='emptyDomo'>No Domos yet</h3>
      </div>
    );
  }
  
  const domoNodes = props.domos.map((domo) => {
    return (
      <div key={domo._id} className='domo'>
        <img src='/assets/img/domoface.jpeg' alt='domo face' className='domoFace' />
        <h3 className='domoName'> Name: {domo.name} </h3>
        <h3 className='domoAge'> Age: {domo.age} </h3>
        <h3 className='domoWeeb'> Fav. Weeb Trash: {domo.weebTrash} </h3>
      </div>
    );
  });
  
  return (
    <div className='domoList'>
      {domoNodes}
    </div>
  );
};

// setup()
const setup = (csrf) => {
  ReactDOM.render( <DomoForm csrf={csrf} />,
                  document.querySelector('#makeDomo'));
  
  ReactDOM.render( <DomoList domos={[]} />,
                  document.querySelector('#domos'));
  
  loadDomosFromServer();
};

// getToken()
const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

// Getting a CSRF token when the page has loaded
$(document).ready(() => {
  getToken();
});






























