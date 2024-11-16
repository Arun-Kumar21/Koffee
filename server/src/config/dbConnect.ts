const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL, {}).then(()=>{
        console.log("Database connected")
    }).catch((error:Error)=>{
        console.log("databse connection failed....",error)
    })

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
        console.log(`Database connected `);
    });
}


export default dbConnect;