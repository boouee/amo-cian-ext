const url = 'https://nextjs-fastapi-starter-pearl-one.vercel.app/api';

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == 'send') {
            console.log(request.title, ":", request.content, ":", request.price);
            sendToAmo(url, request.title, sender.tab.url, request.address, request.author, request.phone, request.price);
        } else if (request.type == 'login'){
            getUserFromAmo(request.email, sender.tab.id).then(function() {
                
            })
        } else if (request.type == 'getUser'){
            chrome.storage.session.get('user', function(items) {
                console.log(items, items.user);
                sendResponse(items);
            });
        } else if (request.type == 'checkLead') {
            console.log('received');
            checkLeadExistsInAmo(url, request.title).then(function(response) {
              sendResponse(response);
            })
            return true;
            console.log('leadExists: ', response);
        }
        return true;
      }   
);

async function sendToAmo(url, title, link, address, author, phone, price) {
  console.log('sendToAmo: ', title, link, address, author, phone, price);
  chrome.storage.local.get(null, function(user) {
    fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"     
          },
      body: JSON.stringify({ user_id: user.user, name: title, price: price, link: link, seller: author, address: address})    
    }).then(response => console.log(response));
  })
}
async function checkLeadExistsInAmo(url, title) {
  const user = await chrome.storage.local.get(null);
  console.log(user);
  const date = Math.trunc(Date.now()/1000 + 365 * 24 * 60* 60);
  console.log(date);
  const response = await fetchLead(url, title, user.user);
  console.log('check response: ', response);
  return response;
}

async function fetchLead(url, title, user) {
  const response = await fetch(url + "?lead=" + encodeURI(title)/**, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json"         
        }
  }*/).then(function(response) {
        console.log(response.status);
        if (response.status == "200") {
            return response.json();
        } else {
          return
        }
    })
    .then(function(data) {
        console.log(data);
        if (data[0] == '204') {
            return "OK"
        } else if (data[0]._embedded.leads[0].responsible_user_id == user) {
            return "reserved by current user"
        } else {
          return "reserved"
      }
    });
    console.log(response);
    //document.body.innerText = response;
    return response;
}

async function getUserFromAmo(email, tab) {
	const response = await fetch(url, {
		method: "GET",
		headers: { 
			"Content-Type": "application/json"       
        }
	});
    console.log(response);
    const data = await response.json();
    //console.log(data._embedded.users);
    data[0]._embedded.users.forEach(function(user) {
            console.log(user.email)
            if(user.email == email) {
                chrome.storage.local.set({ user: user.id, name: user.name, email: user.email }).then(() => {
                    console.log("Value is set");
                    chrome.tabs.reload(tab)
                });
            }
        
    })		
}