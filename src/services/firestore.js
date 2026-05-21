import { collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const studentsCollection = collection(db, "students");
export const teachersCollection = collection(db, "teachers");
export const classesCollection = collection(db, "classes");
export const eventsCollection = collection(db, "events");