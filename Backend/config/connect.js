import mongoose from "mongoose";
const connectDb = async () => {
    await mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log('Database connected successfully')
    });
}

export default connectDb;