const button = document.createElement('button');
//dragElement(button);
button.id = "extension_button";
//button.innerText = "Добавить";
const observer = new MutationObserver((mutationList, observer) => {
  console.log(mutationList);
  if($('div[data-testid="phones-opened-value"]').length > 0) {
	observer.disconnect();
	console.log($('div[data-testid="phones-opened-value"]').text());
	return;
  }
  mutationList.forEach( mutation => { console.log(mutation)});
  console.log("callback that runs when observer is triggered");
});

$( document ).ready(function() {
   //if($('div[data-testid="phones-opened-value"]').leng 0)  
  //chrome.runtime.sendMessage({type: 'getUser'}).then(function(response {})
  chrome.storage.local.get(null, function(items){
      console.log(JSON.stringify(items), items.user);
      if(items.user) {
          //checkLead();
          if ($('div[data-name="MainNewTitle"]').length == 0) {
          	button.innerText = "Откройте объявление " ;
              return;
           }
          chrome.runtime.sendMessage({type: 'checkLead', title: $('div[data-name="MainNewTitle"]').text(), content: ''}).then(function(response) {
            console.log(response);  
            if (response == "OK") {
                button.innerText = "Добавить к сделкам " + items.name;
                button.addEventListener('click', message);
              } else if (response == "reserved"){
                button.innerText = "Сделка уже добавлена в Amo";
              } else if (response == "reserved by current user") {
                button.innerText = "Сделка уже добавлена";
              } else {
                 button.innerText = "Ошибка";
              }	
          })
      } else {
        button.innerText = "Авторизоваться"
        $.get(chrome.runtime.getURL('/modal.html'), function(data) {
          $(data).appendTo('body');
        });
        button.addEventListener('click', function(event) {
            console.log(event.target);
            const modal = document.getElementById('id01');
            modal.style.display='block';
            modal.querySelector('form').addEventListener('submit', function(event){
                event.preventDefault();
                console.log(event.target['email'].value);
                authMessage(event.target['email'].value)              
            })
        });
      }
  });
  $('div[data-name="AsideMainInfo"]').prepend(button);
  //button
	main().then(function() {
		const targetNode = $('div[data-name="PhonesContainer"]');
		console.log(targetNode[targetNode.length - 1]);
		observer.observe(targetNode[targetNode.length - 1], {
			subtree: true,
			childList: true,
		  });
	});
});

async function checkLead() {
  const response = await chrome.runtime.sendMessage({type: 'checkLead', title: $('div[data-name="MainNewTitle"]').text(), content: ''});
  console.log('checkLead: ', response);
}
async function main() {
	await $('button[data-testid="contacts-button"]').trigger('click');
}

async function message() {
    const user = await chrome.storage.local.get( 'user');
    const title = $('div[data-name="MainNewTitle"]').text();
    const price = parseInt([...$('div[data-testid="price-amount"]').text().matchAll(/\d/g)].join(''));
    
    const phone = $('div[data-testid="phones-opened-value"]').text();
    const address = $('div[data-name="AddressContainer"]').text();
    const author = $('div[data-name="AuthorAside"]').text();
    console.log("message: ", user.user, title, price, phone, address, author);
    const response = await chrome.runtime.sendMessage({type: 'send', user: user, title: title, price: price, phone: phone, address: address, author: author});
	// do something with response here, not outside the function
	console.log(response);
};

async function authMessage(email) {
     //const user = await chrome.storage.local.get(/* String or Array */ 'user').user;
	const response = await chrome.runtime.sendMessage({type: 'login', email: email});
	// do something with response here, not outside the function
	console.log(response);
};