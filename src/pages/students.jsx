import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/firebase"
import AddStudentForm from "../components/AddStudentForm"

export default function Students() {
    const [students, setStudents] = useState([])    //stores data; variable that causes the UI to re-render when it changes

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
            const studentList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setStudents(studentList)
        })
        return unsubscribe
    }, []) 

    return (
        <div>
            <AddStudentForm />
            {students.map((student) => (
                <div key={student.id}>
                    <p>{student.firstName}</p>
                    <p>{student.lastName}</p>
                    <p>{student.gradeLevel}</p>
                    <p>{student.parentEmailContact}</p>
                </div>
            ))}
        </div>
    )
}