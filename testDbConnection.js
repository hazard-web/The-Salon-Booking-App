const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://shivambhardwaj403_db_user:hrsEeokrnk37gcqA@cluster0.sx2oflw.mongodb.net/?retryWrites=true&w=majority";

const testConnection = async () => {
    try {
        console.log('🔄 Testing MongoDB connection...');
        const client = await MongoClient.connect(MONGODB_URI, {
            tls: true,
            autoSelectFamily: false,
            family: 4,
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true,
            },
            rejectUnauthorized: true,
        });
        console.log('✅ MongoDB Connection Successful!');
        await client.close();
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        console.error('🔍 Full Error:', error);
    }
};

testConnection();