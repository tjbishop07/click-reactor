import * as firebase from 'firebase'
import { FirebaseConfig } from '../config/keys';
firebase.initializeApp(FirebaseConfig)
export const databaseRef = firebase.database().ref();
