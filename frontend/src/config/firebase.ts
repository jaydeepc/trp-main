import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyBFKF96WnP3OaFsqdOgtduWRIcROsZABrg',
    authDomain: 'the-robbie-projectt-prod.firebaseapp.com',
    projectId: 'the-robbie-projectt-prod',
    storageBucket: 'the-robbie-projectt-prod.firebasestorage.app',
    messagingSenderId: '851415561625',
    appId: '1:851415561625:web:48539abc6983fb41088f08',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
