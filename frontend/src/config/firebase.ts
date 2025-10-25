import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyBPVTjw8iqiZccDXyUPSEealVd-tUbSVFI',
    authDomain: 'the-robbie-projectt.firebaseapp.com',
    projectId: 'the-robbie-projectt',
    storageBucket: 'the-robbie-projectt.firebasestorage.app',
    messagingSenderId: '832983427787',
    appId: '1:832983427787:web:a0025fd2f3531c6127094e',
    measurementId: 'G-2S41PRDBBG',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
