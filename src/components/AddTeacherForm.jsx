import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebase/firebase"

export default function AddTeacherForm() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [gradeLevel, setGradeLevel] = useState("")
    const [classIds, setClassIds] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await addDoc(collection(db, "teachers"), {
            firstName,
            lastName,
            email,
            gradeLevel,
            classIds
        })
        setFirstName("")
        setLastName("")
        setEmail("")
        setGradeLevel("")
        setClassIds("")
    }

    return (
    <div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="firstName">firstName:</label>
            <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <label htmlFor="lastName">lastName:</label>
            <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            <label htmlFor="email">email:</label>
            <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="gradeLevel">gradeLevel:</label>
            <input
                type="number"
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
            />
            <label htmlFor="classIds">classIds:</label>
            <input
                type="text"
                id="classIds"
                value={classIds}
                onChange={(e) => setClassIds(e.target.value.split(","))}
            />
            <button type="submit">Add Teacher</button>
        </form>
    </div>
)
}