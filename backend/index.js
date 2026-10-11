import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import jwt from "jsonwebtoken"
import compression from "compression"
import userRouter from "./routes/userRouter.js"
import vechicleRouter from "./routes/vechicleRouter.js"
import dailyWasteCollectionRouter from "./routes/dailyWasteCollectionRouter.js"
import scheduleRouter from "./routes/scheduleRouter.js"
import requestRouter from "./routes/requestRouter.js"
import settingRouter from  "./routes/settingRouter.js"



const mongoURI = "mongodb+srv://admin:1234@cluster0.az5seek.mongodb.net/?appName=Cluster0"
const app = express()
app.use(cors())
app.use(compression())
app.use(express.json({ limit : "2mb" }))
app.use((req,res,next)=>{
    const start = Date.now()
    res.on("finish", ()=>{
        console.log(req.method + " " + req.originalUrl + " " + res.statusCode + " " + (Date.now() - start) + "ms")
    })
    next()
})
app.use((req,res,next)=>{
    const start = Date.now()
    res.on("finish", ()=>{
        console.log(req.method + " " + req.originalUrl + " " + res.statusCode + " " + (Date.now() - start) + "ms")
    })
    next()
})


app.use(
    (req,res,next)=>{
        const authorizationHeader = req.header("Authorization")

        if(authorizationHeader != null){
            const token = authorizationHeader.replace("Bearer ","")

            jwt.verify(token, "green&45",
                (error, content)=>{
                    if(content == null){
                        console.log(content)
                        res.status(401).json({
                            message : "Invalid Token"
                        })
                    }
                    else{
                        req.user = content
                        next()
                    }
                }
            )
        }
        else{
            next()
        }
    }
)






app.use("/users",userRouter)
app.use("/vechicle", vechicleRouter)
app.use("/dailyWasteCollection", dailyWasteCollectionRouter)
app.use("/schedule", scheduleRouter)
app.use("/request", requestRouter)
app.use("/setting", settingRouter)

mongoose.connect(mongoURI).then(
    ()=>{
        console.log("MongoDB Conected Sucessfully")
        import("./sync.js").then(
            (sync)=>{
                sync.default()
            }
        ).catch(
            (err)=>{
                console.error("Firebase sync failed to start:", err.message)
            }
        )
    }
)



app.listen(5000, 
    ()=>{
        console.log("server is runing")
    }
)