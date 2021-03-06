const firebase = require('firebase');

var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID
};

firebase.initializeApp(config);

module.exports.SignUpWithEmailAndPassword = (email, password) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {
        return JSON.stringify(user)
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
            return {err: 'The password is too weak.'}
        } else {
          return {err: errorMessage }
        }
        return {err: error}
    });
}

module.exports.SignInWithEmailAndPassword = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode === 'auth/wrong-password') {
      console.log('Wrong Pass')
      return {err: 'Senha errada. Por favor, tente novamente.'}
    } else {
      return {err: errorMessage}
    }
    return {err: error}
  });
}

module.exports.signOut = () => {
  return firebase.auth().signOut().then(function() {
    console.log('logged off succeeded');
  }).catch(function(error) {
    console.log('Logof failed');
  })
}

firebase.auth().signOut().then(function() {
  // Sign-out successful.
}).catch(function(error) {
  // An error happened.
});

module.exports.InputData = (name) => {
  return firebase.database().ref('users').push({
    name
  })
  .then(function() {
    console.log('Synchronization succeeded');
  })
  .catch(function(error) {
    console.log('Synchronization failed');
  });
}

module.exports.GetSchedules = (pathToGlory) => {
  let data = []
  let ref = firebase.database().ref('' + pathToGlory);
  ref.once("value")
  .then(function(snapshot) {
    let key = snapshot.key;
    console.log('foi')

    return key;
  })
  .catch(function(error) {
    console.log('deu merda again')
  })
}

return module.exports