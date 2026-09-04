import dotenv from "dotenv" ;

dotenv.config({
    path: "../../.env"
})
const {default : app} = await import("./app.js") ;

const PORT = process.env.PORT || 4000 ;

app.listen(PORT, () => {
    console.log("PrimaryAPI server is Running") ;
})

