var user = {};
Object.observe(user, function(changes){
    changes.forEach(function(change) {
        user.fullName = user.firstName+" "+user.lastName;
    });
});

user.firstName = 'lingkang';
user.lastName = 'zhang';