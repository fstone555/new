const bcrypt = require('bcryptjs');

const plainPassword = '12345';
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('👉 hashed password:', hash);
});
