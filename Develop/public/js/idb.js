let db;


const request = indexedDB.open("budget_tracker", 1);



request.onupgradeneeded = function(e) {

    //save reference to db
    const db = e.target.result;

    //creates obejct store called `new_transaction`, sets to have autoIncrement primary key
    db.createObjectStore('new_transaction', { autoIncrement: true});

};
//on success
request.onsuccess = function(e) {

    //when db is successful , creates object store or created a connection
    db = e.target.result;
    if (navigator.online) {
        uploadTransaction();
    }
};

request.onerror = function(e) {
    console.log(e.target.errorCode);
};


function saveRecord(record) {

    // opens a new trasaction with db (read and write permissions) 
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore('new_transaction');
  
    // add record to your store
    transactionObjectStore.add(record);
  }

  function uploadTransaction() {

  // open a transaction on your db
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access your object store
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // get all records from store and set to a variable
  const getAll = transactionObjectStore.getAll();

// upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {

    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          // open 1 more transaction
          const transaction = db.transaction(['new_transaction'], 'readwrite');

          // access the new_transaction object store
          const transactionObjectStore = transaction.objectStore('new_transaction');

          // clear all items in  store
          transactionObjectStore.clear();

          alert('All transaction has been completed!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadTransaction);