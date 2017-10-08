var server_prefix = "http://mycontacts101.azurewebsites.net";
server_prefix = "http://localhost:1337";


Vue.component('grid', {
    template: '#grid-template',
    props: {
        data: Array,
        columns: Array,
        filterKey: String
    },
    data: function () {
        var sortOrders = {}
        this.columns.forEach(function (key) {
            sortOrders[key] = 1
        })
        return {
            sortKey: 'name',
            sortOrders: sortOrders
        }
    },
    computed: {
        filteredData: function () {
            try {
                var sortKey = this.sortKey
                var filterKey = this.filterKey
                var order = this.sortOrders[sortKey] || 1
                var data = this.data
                if (filterKey) {
                    data = data.filter(function (row) {
                        return Object.keys(row).some(function (key) {
                            return String(row[key]).toLowerCase().indexOf(String(filterKey).toLowerCase()) > -1
                        })
                    })
                }
                if (sortKey) {
                    data = data.slice().sort(function (a, b) {
                        a = a[sortKey].toLowerCase()
                        b = b[sortKey].toLowerCase()
                        return (a === b ? 0 : a > b ? 1 : -1) * order
                    })
                }
                return data
            } catch (err) { alert(err)}
        }
    },
    filters: {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }
    }
});

var gridVue = new Vue({
    el: '#main',
    data: {
        searchQuery: '',
        contact_name: '',
        contact_number: '',
        gridColumns: ['name', 'number'],
        gridData: [
            { name: 'Chuck Norris', number: "0545555555" }
        ]
    },
    methods: {
        push : function() {
            try {
                if (this.contact_name === '' || this.contact_number === '') {
                    alert("Input data please.")
                } else {
                    sendContactToServer(this.contact_name, this.contact_number, this);
                    this.contact_name = '';
                    this.contact_number = '';
                }
            } catch (err) {
                alert(err);
            }
        }
    }
});

function sendContactToServer(name,number, grid) {
        var path = "/contacts";
        var request = new XMLHttpRequest();
        var userObj = {
            name: name,
            number: number
        };
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                switch (this.status) {
                    case 200:
                        grid.gridData.push({name: name, number: number});
                        break;
                    case 400:
                        alert("Oops.. error in databse.");
                        break;
                    case 500:
                        alert("name or phone number already exist.");
                        break;
                    default:
                        alert("Unkonwn error code..");
                        break;
                }
            }
        };
        request.open("POST", server_prefix + path, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(userObj));
}

function getAllContactsFromServer() {
    var path = "/contacts";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            presentContacts(this.responseText);
        }
        if (this.readyState === 4 && this.status === 500) {
            alert("Connection error to server.");
        }
    };
    request.open("GET", server_prefix + path, true);
    request.send();
}


function presentContacts(contactArray) {
    contactArray = JSON.parse(contactArray);
    contactArray.forEach(function (contact) {
        gridVue.gridData.push({name : contact['name'], number : contact['number']})
    });
    document.getElementById("preload").style.display = "none";
    document.getElementById("main").style.display = "block";
}

getAllContactsFromServer();