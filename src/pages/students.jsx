import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase" // will work once SE creates this

export default function Students() {
    const [students, setStudents] = useState([])    //stores data; variable that causes the UI to re-render when it changes

    useEffect(() => {
        getDocs(collection(db, "students"))     // fetch from Firebase
        .then((allDocs) => {
            const studentList = allDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setStudents(studentList)
        })
    }, []) 

    return <h1>Students</h1>

}