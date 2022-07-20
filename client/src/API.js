/**
 * All the API calls
 */

const BASEURL = '/api';

function getJson(httpResponsePromise) {
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
         // always return {} from server, never null or non json, otherwise it will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))
        } else {
          // analyze the cause of error
          response.json()
            .then(obj => reject(obj)) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => reject({ error: "Cannot communicate"  })) // connection error
  });
}

async function getTemplates() {
  const response = await fetch(BASEURL+'/templates') ;
  const resp = await response.json() ;
  
  if (response.ok) {
      return resp;
  } else {
      throw resp;  // an object with the error coming from the server
    }
}

const getMemes = async (filter) => {
  return getJson(
    filter 
      ? fetch(BASEURL + '/memes?filter=' + filter)
      : fetch(BASEURL + '/memes')
  ).then( json => {
    return json.map((meme) => Object.assign({}, meme))
  })
}


function addMeme(meme) {
  return getJson(
    fetch(BASEURL + "/memes", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meme)
    })
  )
}

async function copyMeme(old_meme_id, new_meme) {
  let old_meme = await getJson(fetch(BASEURL + '/memes/meme/' + old_meme_id));
  new_meme['old_template_id'] = old_meme.template_id;
  new_meme['old_private'] = old_meme.private;
  new_meme['old_user_id'] = old_meme.user_id;
  return await getJson(
    fetch(BASEURL + "/copyMemes", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(new_meme)
    })
  );
}

function deleteMeme(meme_id) {
  return getJson(
    fetch(BASEURL + "/memes/" + meme_id, {
      method: 'DELETE'
    })
  )
}

async function logIn(credentials) {
  let response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch(err) {
      throw err;
    }
  }
}

async function logOut() {
  await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
  const response = await fetch(BASEURL + '/sessions/current');
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server, mostly unauthenticated user
  }
}

const API = { getTemplates,  getMemes,  addMeme, deleteMeme, copyMeme, logIn, logOut, getUserInfo }
export default API;

