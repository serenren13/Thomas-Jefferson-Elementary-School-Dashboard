import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const teachers = [
  { firstName: "Emily", lastName: "Carter", email: "ecarter@tjelementary.edu", subject: "Math" },
  { firstName: "James", lastName: "Miller", email: "jmiller@tjelementary.edu", subject: "English" },
  { firstName: "Sarah", lastName: "Lee", email: "slee@tjelementary.edu", subject: "Science" },
];

const classes = [
  { name: "Grade 1 Math", subject: "Math", gradeLevel: 1 },
  { name: "Grade 2 English", subject: "English", gradeLevel: 2 },
  { name: "Grade 3 Science", subject: "Science", gradeLevel: 3 },
];

const events = [
  { title: "Parent Teacher Night", date: "2026-06-05", location: "Main Auditorium" },
  { title: "Science Fair", date: "2026-06-12", location: "Gymnasium" },
  { title: "Field Trip", date: "2026-06-20", location: "City Museum" },
];

const students = [
  {
    firstName: "Ava",
    lastName: "Johnson",
    gradeLevel: 1,
    parentEmailContact: "parent.ava@email.com",
    grades: [
      { assignmentName: "Quiz 1", score: 80, category: "Quizzes" },
      { assignmentName: "Quiz 2", score: 85, category: "Quizzes" },
      { assignmentName: "Unit Test", score: 90, category: "Tests" },
      { assignmentName: "Participation Week 1", score: 100, category: "Participation" },
      { assignmentName: "Final Project", score: 95, category: "Projects" },
    ],
  },
  {
    firstName: "Noah",
    lastName: "Smith",
    gradeLevel: 1,
    parentEmailContact: "parent.noah@email.com",
    grades: [
      { assignmentName: "Quiz 1", score: 88, category: "Quizzes" },
      { assignmentName: "Quiz 2", score: 91, category: "Quizzes" },
      { assignmentName: "Unit Test", score: 84, category: "Tests" },
      { assignmentName: "Participation Week 1", score: 92, category: "Participation" },
      { assignmentName: "Final Project", score: 90, category: "Projects" },
    ],
  },
  {
    firstName: "Mia",
    lastName: "Garcia",
    gradeLevel: 2,
    parentEmailContact: "parent.mia@email.com",
    grades: [
      { assignmentName: "Quiz 1", score: 95, category: "Quizzes" },
      { assignmentName: "Unit Test", score: 97, category: "Tests" },
      { assignmentName: "Participation Week 1", score: 100, category: "Participation" },
      { assignmentName: "Science Project", score: 98, category: "Projects" },
    ],
  },
];

export async function seedDatabase() {
  const classRefs = [];

  for (const classItem of classes) {
    const classRef = await addDoc(collection(db, "classes"), {
      ...classItem,
      createdAt: serverTimestamp(),
    });
    classRefs.push(classRef);
  }

  for (const teacher of teachers) {
    await addDoc(collection(db, "teachers"), {
      ...teacher,
      classIds: classRefs.map((classRef) => classRef.id),
      createdAt: serverTimestamp(),
    });
  }

  for (const event of events) {
    await addDoc(collection(db, "events"), {
      ...event,
      createdAt: serverTimestamp(),
    });
  }

  for (const student of students) {
    const studentRef = await addDoc(collection(db, "students"), {
      firstName: student.firstName,
      lastName: student.lastName,
      gradeLevel: student.gradeLevel,
      parentEmailContact: student.parentEmailContact,
      classIds: [classRefs[0].id],
      createdAt: serverTimestamp(),
    });

    for (const grade of student.grades) {
      await addDoc(collection(db, "students", studentRef.id, "grades"), {
        ...grade,
        createdAt: serverTimestamp(),
      });
    }
  }

  console.log("Database seeded successfully");
}