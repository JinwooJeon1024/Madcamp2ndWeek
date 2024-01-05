const mongoose = require('mongoose');

app.get('/mongodb', async (req, res) => {
    await mongoose.connect('mongodb://localhost/voyage', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

		res.send('ok');
})