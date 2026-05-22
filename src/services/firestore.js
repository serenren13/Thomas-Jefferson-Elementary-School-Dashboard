import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const studentsCollection = collection(db, "students");
export const teachersCollection = collection(db, "teachers");
export const classesCollection = collection(db, "classes");
export const eventsCollection = collection(db, "events");

export const CATEGORY_WEIGHTS = {
  Quizzes: 0.2,
  Tests: 0.3,
  Participation: 0.25,
  Projects: 0.25,
};

export async function addGrade(studentId, classId, assignmentName, score, category) {
  if (!studentId || !classId || !assignmentName || score === "" || !category) {
    throw new Error("Missing required grade information");
  }

  if (!CATEGORY_WEIGHTS[category]) {
    throw new Error("Invalid category");
  }

  const gradesRef = collection(db, "students", studentId, "grades");

  return await addDoc(gradesRef, {
    classId,
    assignmentName,
    score: Number(score),
    category,
    createdAt: serverTimestamp(),
  });
}

export async function getStudentGrades(studentId) {
  const gradesRef = collection(db, "students", studentId, "grades");
  const snapshot = await getDocs(gradesRef);

  return snapshot.docs.map((gradeDoc) => ({
    id: gradeDoc.id,
    ...gradeDoc.data(),
  }));
}

export async function updateGrade(studentId, gradeId, updatedGrade) {
  const gradeRef = doc(db, "students", studentId, "grades", gradeId);

  return await updateDoc(gradeRef, {
    ...updatedGrade,
    score: Number(updatedGrade.score),
  });
}

export async function deleteGrade(studentId, gradeId) {
  const gradeRef = doc(db, "students", studentId, "grades", gradeId);
  return await deleteDoc(gradeRef);
}

export function calculateWeightedGrade(grades) {
  const breakdown = {};

  Object.keys(CATEGORY_WEIGHTS).forEach((category) => {
    breakdown[category] = {
      total: 0,
      count: 0,
      average: 0,
      weight: CATEGORY_WEIGHTS[category],
      weightedScore: 0,
    };
  });

  grades.forEach((grade) => {
    if (breakdown[grade.category]) {
      breakdown[grade.category].total += Number(grade.score);
      breakdown[grade.category].count += 1;
    }
  });

  let finalGrade = 0;

  Object.keys(breakdown).forEach((category) => {
    const item = breakdown[category];

    if (item.count > 0) {
      item.average = item.total / item.count;
      item.weightedScore = item.average * item.weight;
      finalGrade += item.weightedScore;
    }
  });

  return {
    finalGrade: Number(finalGrade.toFixed(2)),
    breakdown,
  };
}

export function calculateClassAverage(rosterWithGrades) {
  const studentsWithGrades = rosterWithGrades.filter(
    (student) => student.grades && student.grades.length > 0
  );

  if (studentsWithGrades.length === 0) return 0;

  const total = studentsWithGrades.reduce(
    (sum, student) => sum + student.finalGrade,
    0
  );

  return Number((total / studentsWithGrades.length).toFixed(2));
}