const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/myhousing_dev').then(async () => {
    const db = mongoose.connection.db;
    const views = await db.collection('viewingrequests').find().sort({createdAt: -1}).toArray();
    const mapped = views.map(v => ({ id: v._id, user: v.user_id, status: v.status, name: v.full_name }));
    fs.writeFileSync('views_output.json', JSON.stringify(mapped, null, 2));
    process.exit(0);
});
