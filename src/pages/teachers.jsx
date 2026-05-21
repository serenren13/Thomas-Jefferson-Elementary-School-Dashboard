import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/firebase"
import AddTeacherForm from "../components/AddTeacherForm"

export default function Teachers() {
    const [teachers, setTeachers] = useState([])

        useEffect(() => {
            const unsubscribe = onSnapshot(collection(db, "teachers"), (snapshot) => {
             const teacherList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setTeachers(teacherList)
        })

    return unsubscribe
}, [])

    return (
        <div>
            <AddTeacherForm />
            {teachers.map((teacher) => (
                <div key={teacher.id}>
                    <p>{teacher.firstName}</p>
                    <p>{teacher.lastName}</p>
                    <p>{teacher.subject}</p>
                    <p>{teacher.classIds}</p>
                    <p>{teacher.email}</p>
                </div>
            ))}
        </div>
    )
}
