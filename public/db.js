let db;
let budgetdbVersion;

//open database
const request = window.indexedDB.open("budgetdb", budgetdbVersion || 1);

//error handler
request.onerror = function (event) {
    console.log(`Error. ${event.target.errorCode}`);
};

function updateDb() {
    //opens transaction & accesses data store
    let transaction = db.transaction(["BudgetStore"], "readwrite");
    const store = transaction.objectStore("BudgetStore");

    // get all the records
    store.getAll().onsuccess = function (event) {
        const allRecords = event.target.result;
        if (allRecords.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(allRecords),
                headers: {
                    Accept: "applications/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.length > 0) {
                    //opens the transaction & clears amount
                    transaction = db.transaction(["BudgetStore"], "readwrite");
                    const currentStore = transaction.objectStore("BudgetStore");
                    currentStore.clear();
                }
            })
            .catch(error => {
                console.error(error);
            })
        }
    };
}

//Success handler
request.onsuccess = function (event) {
    console.log(`Success!!!`);
    db = event.target.result;

    //checks if app is online and if is, updates db
    if (navigator.onLine) {
        console.log("Online");
        updateDb();
    }
};

request.onupgradeneeded = function (event) {
    console.log("Upgrade needed");

    //console log version update
    const oldVersion = event.oldVersion;
    const newVersion = event.newVersion;
    console.log(`DB updated from ${oldVersion} to ${newVersion}`);

    db = event.target.result;

    //create an object store
    db.createObjectStore("BudgetStore", { autoIncrement: true});
};

//Create new transaction, access the object store and add record
const saveRecord = (record) => {
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    const store = transaction.objectStore("BudgetStore");
    store.add(record);
};

//listens if app is online, if yes, updates db
window.addEventListener("online", updateDb);