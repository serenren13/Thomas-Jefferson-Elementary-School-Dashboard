import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
  } from "firebase/firestore";
  import { db } from "../firebase";

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
  
  export async function addGrade(studentId, assignmentName, score, category) {
    if (!studentId || !assignmentName || score === "" || !category) {
      throw new Error("Missing required grade information");
    }
  
    if (!CATEGORY_WEIGHTS[category]) {
      throw new Error("Invalid category");
    }
  
    const gradesRef = collection(db, "students", studentId, "grades");
  
    return await addDoc(gradesRef, {
      assignmentName,
      score: Number(score),
      category,
      createdAt: serverTimestamp(),
    });
  }
  
  export async function getStudentGrades(studentId) {
    const gradesRef = collection(db, "students", studentId, "grades");
    const snapshot = await getDocs(gradesRef);
  
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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