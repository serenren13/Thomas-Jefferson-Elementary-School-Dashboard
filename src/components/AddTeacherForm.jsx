import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebase/firebase"

export default function AddTeacherForm() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [classIds, setClassIds] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await addDoc(collection(db, "teachers"), {
            firstName,
            lastName,
            email,
            subject,
            classIds
        })
        setFirstName("")
        setLastName("")
        setEmail("")
        setSubject("")
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
            <label htmlFor="subject">subject:</label>
            <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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