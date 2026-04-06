import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/myhousing_dev');
    const token = jwt.sign({ id: '600000000000000000000000', role: 'customer' }, '123456');
    
    const res = await fetch('http://localhost:3000/api/viewings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            room_id: '600000000000000000000000',
            full_name: 'Test User',
            phone: '0987654321',
            scheduled_at: new Date().toISOString()
        })
    });
    const data = await res.json();
    console.log("POST Result:", data);
    process.exit(0);
})();
