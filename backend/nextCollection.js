import Schedule from "./model/Schedule.js"

const VEHICLE_KEY = "vehicleNo"

const APP_WASTE_TYPES = {
    "food waste" : "Food Waste",
    "plastic" : "Plastic Waste",
    "polythene" : "Polythene Waste",
    "paper" : "Paper Waste",
    "glass" : "Glass Waste"
}

function toAppWasteType(value){
    const key = String(value || "").trim().toLowerCase()

    if(APP_WASTE_TYPES[key]){
        return APP_WASTE_TYPES[key]
    }

    const name = key.replace(/\b\w/g, (c)=>c.toUpperCase())

    return name.endsWith("Waste") ? name : name + " Waste"
}

function toSriLankaMidnight(date){
    const day = new Date(date).toISOString().slice(0, 10)
    return new Date(day + "T00:00:00+05:30")
}

function todaySriLanka(){
    const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
    return now.toISOString().slice(0, 10)
}

async function syncNextCollection(){
    const firebase = await import("./firebase.js")

    const today = new Date(todaySriLanka() + "T00:00:00.000Z")

    const next = await Schedule.findOne({
        collectionDate : {$gte : today},
        dispathStatus : {$in : ["pending", "active"]}
    }).sort({collectionDate : 1, createdAt : -1}).populate("vechicle", "vechicleNumber")

    if(next == null){
        return
    }

    const data = {
        asignRoute : next.assignRoute,
        date : toSriLankaMidnight(next.collectionDate),
        wasteType : toAppWasteType(next.wasteCategory)
    }

    data[VEHICLE_KEY] = next.vechicle ? next.vechicle.vechicleNumber : ""

    await firebase.db.collection("setting").doc("nextCollection").set(data, { merge : true })
}

async function syncRouteDoc(scheduleNumber){
    const firebase = await import("./firebase.js")

    const schedule = await Schedule.findOne({scheduleNumber : scheduleNumber})
        .populate("vechicle", "vechicleNumber")
        .populate("driver", "firstName lastName firebaseUid")

    if(schedule == null){
        return
    }

    await firebase.db.collection("routes").doc(scheduleNumber).set({
        scheduleNumber : scheduleNumber,
        driverUid : schedule.driver ? schedule.driver.firebaseUid || null : null,
        driverName : schedule.driver ? schedule.driver.firstName + " " + schedule.driver.lastName : "",
        asignRoute : schedule.assignRoute,
        date : toSriLankaMidnight(schedule.collectionDate),
        vehicleNo : schedule.vechicle ? schedule.vechicle.vechicleNumber : "",
        wasteType : toAppWasteType(schedule.wasteCategory),
        distanceKm : schedule.distance,
        status : schedule.dispathStatus
    })
}

async function removeRouteDoc(scheduleNumber){
    const firebase = await import("./firebase.js")
    await firebase.db.collection("routes").doc(scheduleNumber).delete()
}

export async function syncToFirebase(scheduleNumber, removed){
    try{
        if(removed){
            await removeRouteDoc(scheduleNumber)
        }
        else{
            await syncRouteDoc(scheduleNumber)
        }

        await syncNextCollection()

        return ""
    }
    catch(err){
        console.error("[firebase:routes]", err.message)
        return "Saved in MongoDB, but the Firebase sync failed: " + err.message
    }
}