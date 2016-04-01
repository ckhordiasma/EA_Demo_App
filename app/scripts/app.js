(function() {
    var apiKey = "4qnex5t3hg2800dv"
    var el = new Everlive(apiKey);

    window.Users = el.Users;

    var horseDataSource = new kendo.data.DataSource({
        type: "everlive",
        transport: {
            typeName: "Horses"
        }
    });

    function initialize() {
        var app = new kendo.mobile.Application(document.body, {
            skin: "nova",
            transition: "slide"
        });
        $("#horse-list").kendoMobileListView({
            dataSource: horseDataSource,
            template: "#: Name #"
        });
    }

    window.loginView = kendo.observable({
        submit: function() {
            if (!this.username) {
                navigator.notification.alert("Username is required.");
                return;
            }
            if (!this.password) {
                navigator.notification.alert("Password is required.");
                return;
            }
            el.Users.login(this.username, this.password,
                function(data) {
                    window.location.href = "#list";
                    horseDataSource.read();
                }, function() {
                    navigator.notification.alert("Unfortunately we could not find your account.");
                });
        }
    });

    window.registerView = kendo.observable({
        submit: function() {
            if (!this.username) {
                navigator.notification.alert("Username is required.");
                return;
            }
            if (!this.password) {
                navigator.notification.alert("Password is required.");
                return;
            }
            el.Users.register(this.username, this.password, { Email: this.email },
                function() {
                    navigator.notification.alert("Your account was successfully created.");
                    window.location.href = "#login";
                },
                function() {
                    alert("Unfortunately we were unable to create your account.");
                });
        }
    });

    window.passwordView = kendo.observable({
        submit: function() {
            if (!this.email) {
                navigator.notification.alert("Email address is required.");
                return;
            }
            $.ajax({
                type: "POST",
                url: "https://api.everlive.com/v1/" + apiKey + "/Users/resetpassword",
                contentType: "application/json",
                data: JSON.stringify({ Email: this.email }),
                success: function() {
                    navigator.notification.alert("Your password was successfully reset. Please check your email for instructions on choosing a new password.");
                    window.location.href = "#login";
                },
                error: function() {
                    navigator.notification.alert("Unfortunately, an error occurred resetting your password.")
                }
            });
            this.set("email",'');
        }
    });

    window.listView = kendo.observable({
        logout: function(event) {
            // Prevent going to the login page until the login call processes.
            event.preventDefault();
            el.Users.logout(function() {
                this.loginView.set("username", "");
                this.loginView.set("password", "");
                window.location.href = "#login";
            }, function() {
                navigator.notification.alert("Unfortunately an error occurred logging out of your account.");
            });
        }
    });

    window.addView = kendo.observable({
        add: function() {
            if (this.horse_name.trim() === "" || this.breed.trim() === "" || this.height.trim() === "") {
                navigator.notification.alert("Please provide all fields.");
                return;
            }

            horseDataSource.add({ Name: this.horse_name, 
                                Breed: this.breed, 
                                Height: this.height});
            horseDataSource.one("sync", this.close);
            horseDataSource.sync();
            this.set("horse_name", "");
            this.set("breed", "");
            this.set("height", "");
            $("#add").data("kendoMobileModalView").close();
        },
        close: function() {
            $("#add").data("kendoMobileModalView").close();
        }
    });

    document.addEventListener("deviceready", initialize);
}());