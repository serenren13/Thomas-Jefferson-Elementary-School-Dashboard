import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { db } from "../firebase/firebase";
import {
  addGrade,
  updateGrade,
  deleteGrade,
  getStudentGrades,
  calculateWeightedGrade,
  calculateClassAverage,
  CATEGORY_WEIGHTS,
} from "../services/firestore";

export default function ClassHome() {
  const { classId } = useParams();

  const [classInfo, setClassInfo] = useState(null);
  const [studentEdits, setStudentEdits] = useState({});
  const [gradeEdits, setGradeEdits] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [roster, setRoster] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    gradeLevel: "",
  });

  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [gradeForm, setGradeForm] = useState({
    studentId: "",
    assignmentName: "",
    score: "",
    category: "Quizzes",
  });

  async function loadClassPage() {
    if (!classId) return;

    setLoading(true);

    const classDoc = await getDoc(doc(db, "classes", classId));

    if (!classDoc.exists()) {
      setClassInfo(null);
      setLoading(false);
      return;
    }

    const classData = { id: classDoc.id, ...classDoc.data() };
    setClassInfo(classData);

    let studentIds = classData.studentIds || [];
    if (typeof studentIds === "string") {
      studentIds = studentIds ? [studentIds] : [];
    }
    if (!Array.isArray(studentIds)) {
      studentIds = [];
    }

    let teacherIds = [];
    if (classData.teacherIds) {
      teacherIds = Array.isArray(classData.teacherIds)
        ? classData.teacherIds
        : [classData.teacherIds];
    } else if (classData.teacherId) {
      teacherIds = [classData.teacherId];
    }

    const teachersSnapshot = await getDocs(collection(db, "teachers"));
    const teachersList = teachersSnapshot.docs.map((teacherDoc) => ({
      id: teacherDoc.id,
      ...teacherDoc.data(),
    }));

    setTeachers(teachersList.filter((teacher) => teacherIds.includes(teacher.id)));

    const studentsSnapshot = await getDocs(collection(db, "students"));
    const studentsList = studentsSnapshot.docs.map((studentDoc) => ({
      id: studentDoc.id,
      ...studentDoc.data(),
    }));

    setAllStudents(studentsList);

    const studentsOnRoster = studentsList.filter((student) =>
      studentIds.includes(student.id)
    );

    const rosterWithGrades = await Promise.all(
      studentsOnRoster.map(async (student) => {
        const grades = await getStudentGrades(student.id);
        const classGrades = grades.filter((grade) => grade.classId === classId);
        const { finalGrade, breakdown } = calculateWeightedGrade(classGrades);

        return {
          ...student,
          grades: classGrades,
          finalGrade,
          breakdown,
        };
      })
    );

    const calculatedClassAverage = calculateClassAverage(rosterWithGrades);

    setRoster(rosterWithGrades);
    const edits = {};

    rosterWithGrades.forEach((student) => {
      student.grades.forEach((grade) => {
        edits[grade.id] = {
          assignmentName: grade.assignmentName || "",
          score: grade.score || "",
          category: grade.category || "Quizzes",
        };
      });
    });

    setGradeEdits(edits);
    setStudentEdits(
      rosterWithGrades.reduce((edits, student) => {
        edits[student.id] = {
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          gradeLevel: student.gradeLevel || "",
        };
        return edits;
      }, {})
    );
    setClassAverage(calculatedClassAverage);

    await updateDoc(doc(db, "classes", classId), {
      averageGrade: calculatedClassAverage,
    });

    setLoading(false);
  }

  useEffect(() => {
    loadClassPage();
  }, [classId]);

  async function handleSaveGrade(studentId, gradeId) {
  const edits = gradeEdits[gradeId];

  await updateGrade(studentId, gradeId, {
    assignmentName: edits.assignmentName,
    score: edits.score,
    category: edits.category,
  });

  await loadClassPage();
}

  async function handleSaveStudent(studentId) {
  const edits = studentEdits[studentId];

  await updateDoc(doc(db, "students", studentId), {
    firstName: edits.firstName,
    lastName: edits.lastName,
    gradeLevel: edits.gradeLevel,
  });

  await loadClassPage();
}

  async function handleAddExistingStudent() {
  if (!selectedStudentId) return;

  const classRef = doc(db, "classes", classId);
  const studentRef = doc(db, "students", selectedStudentId);

  await updateDoc(classRef, {
    studentIds: arrayUnion(selectedStudentId),
  });

  await updateDoc(studentRef, {
    classIds: arrayUnion(classId),
  });

  setSelectedStudentId("");
  await loadClassPage();
}

  async function handleCreateStudent() {
    if (!newStudent.firstName || !newStudent.lastName) return;

    const studentRef = await addDoc(collection(db, "students"), {
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      gradeLevel: newStudent.gradeLevel,
      classIds: [classId],
    });

    await updateDoc(doc(db, "classes", classId), {
      studentIds: arrayUnion(studentRef.id),
    });

    setNewStudent({
      firstName: "",
      lastName: "",
      gradeLevel: "",
    });

    await loadClassPage();
  }

  async function handleUpdateStudent(studentId, field, value) {
    await updateDoc(doc(db, "students", studentId), {
      [field]: value,
    });

    await loadClassPage();
  }

  async function handleRemoveStudent(studentId) {
    await updateDoc(doc(db, "classes", classId), {
      studentIds: arrayRemove(studentId),
    });

    await updateDoc(doc(db, "students", studentId), {
      classIds: arrayRemove(classId),
    });

    await loadClassPage();
  }

  async function handleAddGrade() {
    await addGrade(
      gradeForm.studentId,
      classId,
      gradeForm.assignmentName,
      gradeForm.score,
      gradeForm.category
    );

    setGradeForm({
      studentId: "",
      assignmentName: "",
      score: "",
      category: "Quizzes",
    });

    await loadClassPage();
  }

  async function handleUpdateGrade(studentId, gradeId, field, value) {
    await updateGrade(studentId, gradeId, {
      [field]: value,
    });

    await loadClassPage();
  }

  async function handleDeleteGrade(studentId, gradeId) {
    await deleteGrade(studentId, gradeId);
    await loadClassPage();
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading class...</Typography>
      </Box>
    );
  }

  if (!classInfo) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Class not found.</Typography>
        <Button component={Link} to="/classes-dashboard" sx={{ mt: 2 }}>
          Back to classes
        </Button>
      </Box>
    );
  }

  const studentsNotInClass = allStudents.filter(
    (student) => !roster.some((rosterStudent) => rosterStudent.id === student.id)
  );

  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Button
        component={Link}
        to="/classes-dashboard"
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          px: 2,
        }}
      >
        ← Back to Classes
      </Button>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {classInfo.name}
        </Typography>

        <Stack direction="row" spacing={4} flexWrap="wrap">
          <Box>
            <Typography color="text.secondary" variant="body2">
              Grade Level
            </Typography>
            <Typography fontWeight="bold">
              {classInfo.gradeLevel ?? "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary" variant="body2">
              Class Average
            </Typography>
            <Typography fontWeight="bold">
              {classAverage ? `${classAverage}%` : "No grades yet"}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary" variant="body2">
              Number of Students
            </Typography>
            <Typography fontWeight="bold">
              {roster.length}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary" variant="body2">
              Teacher
            </Typography>
            <Typography fontWeight="bold">
              {teachers.length > 0
                ? teachers
                    .map((teacher) => `${teacher.firstName} ${teacher.lastName}`)
                    .join(", ")
                : "No teacher assigned"}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Add existing student to roster
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Select
          value={selectedStudentId}
          displayEmpty
          onChange={(event) => setSelectedStudentId(event.target.value)}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">Select student</MenuItem>
          {studentsNotInClass.map((student) => (
            <MenuItem key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
            </MenuItem>
          ))}
        </Select>

        <Button variant="contained" onClick={handleAddExistingStudent}>
          Add to roster
        </Button>
      </Stack>

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Create new student
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="First name"
          value={newStudent.firstName}
          onChange={(event) =>
            setNewStudent({ ...newStudent, firstName: event.target.value })
          }
        />
        <TextField
          label="Last name"
          value={newStudent.lastName}
          onChange={(event) =>
            setNewStudent({ ...newStudent, lastName: event.target.value })
          }
        />
        <TextField
          label="Grade level"
          value={newStudent.gradeLevel}
          onChange={(event) =>
            setNewStudent({ ...newStudent, gradeLevel: event.target.value })
          }
        />
        <Button variant="contained" onClick={handleCreateStudent}>
          Create
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Add grade
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Select
          value={gradeForm.studentId}
          displayEmpty
          onChange={(event) =>
            setGradeForm({ ...gradeForm, studentId: event.target.value })
          }
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Select student</MenuItem>
          {roster.map((student) => (
            <MenuItem key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Assignment"
          value={gradeForm.assignmentName}
          onChange={(event) =>
            setGradeForm({ ...gradeForm, assignmentName: event.target.value })
          }
        />

        <TextField
          label="Score"
          type="number"
          value={gradeForm.score}
          onChange={(event) =>
            setGradeForm({ ...gradeForm, score: event.target.value })
          }
        />

        <Select
          value={gradeForm.category}
          onChange={(event) =>
            setGradeForm({ ...gradeForm, category: event.target.value })
          }
          sx={{ minWidth: 180 }}
        >
          {Object.keys(CATEGORY_WEIGHTS).map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>

        <Button variant="contained" onClick={handleAddGrade}>
          Add grade
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Roster
      </Typography>

      {roster.length === 0 ? (
        <Typography color="text.secondary">No students on this roster.</Typography>
      ) : (
        roster.map((student) => (
          <Card key={student.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="First name"
                  value={student.firstName || ""}
                  onChange={(event) =>
                    handleUpdateStudent(student.id, "firstName", event.target.value)
                  }
                />

                <TextField
                  label="Last name"
                  value={student.lastName || ""}
                  onChange={(event) =>
                    handleUpdateStudent(student.id, "lastName", event.target.value)
                  }
                />

                <TextField
                  label="Grade level"
                  value={student.gradeLevel || ""}
                  onChange={(event) =>
                    handleUpdateStudent(student.id, "gradeLevel", event.target.value)
                  }
                />

                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => handleRemoveStudent(student.id)}
                >
                  Remove
                </Button>
              </Stack>

              <Typography fontWeight="bold">
                Current grade:{" "}
                {student.grades.length > 0 ? `${student.finalGrade}%` : "No grades yet"}
              </Typography>

              {student.grades.length === 0 ? (
                <Typography color="text.secondary">No grades added.</Typography>
              ) : (
                student.grades.map((grade) => (
                  <Stack
                    key={grade.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <TextField
                      label="Assignment"
                      value={gradeEdits[grade.id]?.assignmentName || ""}
                      onChange={(event) =>
                        setGradeEdits({
                          ...gradeEdits,
                          [grade.id]: {
                            ...gradeEdits[grade.id],
                            assignmentName: event.target.value,
                          },
                        })
                      }
                    />

                    <TextField
                      label="Score"
                      type="number"
                      value={gradeEdits[grade.id]?.score || ""}
                      onChange={(event) =>
                        setGradeEdits({
                          ...gradeEdits,
                          [grade.id]: {
                            ...gradeEdits[grade.id],
                            score: event.target.value,
                          },
                        })
                      }
                    />

                    <Select
                      value={gradeEdits[grade.id]?.category || "Quizzes"}
                      onChange={(event) =>
                        setGradeEdits({
                          ...gradeEdits,
                          [grade.id]: {
                            ...gradeEdits[grade.id],
                            category: event.target.value,
                          },
                        })
                      }
                      sx={{ minWidth: 170 }}
                    >
                      {Object.keys(CATEGORY_WEIGHTS).map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>

                    <Button
                      variant="contained"
                      onClick={() => handleSaveGrade(student.id, grade.id)}
                    >
                      Save
                    </Button>

                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => handleDeleteGrade(student.id, grade.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                ))
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}