import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/firebase"
import AddStudentForm from "../components/AddStudentForm"
import { Box, Card, CardContent, Typography, Chip } from "@mui/material"

export default function Students() {
    const [students, setStudents] = useState([])    //stores data; variable that causes the UI to re-render when it changes
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState("all")


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

    // fetch classes for filter tabs
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "classes"), (snapshot) => {
            const classList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setClasses(classList)
        })
        return unsubscribe
    }, [])

    // filter students based on selected class
    const filteredStudents = selectedClass === "all"
        ? students
        : students.filter((student) =>
            student.classIds?.includes(selectedClass)
    )


    return (

        <Box sx={{ p: 3}}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Student Directory
            </Typography>
        
        
        {/* Filter tabs */}

        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
            <Chip
                label="All Students"
                onClick={() => setSelectedClass("all")}
                variant={selectedClass === "all" ? "filled" : "outlined"}
                color={selectedClass === "all" ? "primary" : "default"}
            />
            {classes.map((cls) => (
                <Chip
                    key={cls.id}
                    label={cls.name}
                    onClick={() => setSelectedClass(cls.id)}
                    variant={selectedClass === cls.id ? "filled" : "outlined"}
                    color={selectedClass === cls.id ? "primary" : "default"}
                />
            ))}
        </Box>

        {/* Student cards grid */}

        <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 2
        }}>
            {filteredStudents.map((student) => (
                <Card key={student.id} variant="outlined">
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold">
                            {student.firstName} {student.lastName}
                        </Typography>
                        <Typography color="text.secondary">
                            Grade level: {student.gradeLevel ?? "-"}
                        </Typography>
                        <Typography color="text.secondary">
                            {student.parentEmailContact ?? "-"}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>

        <AddStudentForm />
    </Box>
    )
}