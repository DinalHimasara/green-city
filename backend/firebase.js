import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { readFileSync } from "fs"

const serviceAccount = JSON.parse(readFileSync(new URL("./serviceAccountKey.json", import.meta.url)))

initializeApp({
    credential : cert(serviceAccount)
})

export const db = getFirestore()
export const auth = getAuth()