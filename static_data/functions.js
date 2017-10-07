var server_prefix = "http://localhost:5000";

// register the grid component
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
            var sortKey = this.sortKey
            var filterKey = this.filterKey && this.filterKey.toLowerCase()
            var order = this.sortOrders[sortKey] || 1
            var data = this.data
            if (filterKey) {
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
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
        }
    },
    filters: {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
        }
    }
})

// bootstrap the demo
var demo = new Vue({
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
            sendContactToServer(this.contact_name,this.contact_number, this);
            this.contact_name = '';
            this.contact_number = '';
        }
    }
})

function sendContactToServer(name,number, object) {
    var path = "/addContact";
    var request = new XMLHttpRequest();
    var userObj = {
        name: name,
        number: number
    };
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 500) {
            alert("name or phone number already exist.");
        } else if (this.readyState == 4 && this.status == 200) {
            object.gridData.push({name : name , number: number})
        }
    };
    request.open("POST", server_prefix + path, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(userObj));
}

function getAllContactsFromServer() {
    var path = "/allContacts";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            presentContacts(this.responseText);
        }
        if (this.readyState == 4 && this.status === 500) {
            alert("Connection error to server.");
        }
    };
    request.open("GET", server_prefix + path, true);
    request.send();
}


function presentContacts(contactArray) {
    contactArray = JSON.parse(contactArray);
    contactArray.forEach(function (contact) {
        demo.gridData.push({name : contact['name'], number : contact['number']})
    })
    document.getElementById("preload").style.display = "none";
    document.getElementById("main").style.display = "block";
}

getAllContactsFromServer();