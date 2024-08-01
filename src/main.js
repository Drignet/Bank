import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc, deleteDoc } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDD75zyj-GpcwhfaTldQn_wlB6wSAHcvKM",
    authDomain: "chulo-2c5e6.firebaseapp.com",
    projectId: "chulo-2c5e6",
    storageBucket: "chulo-2c5e6.appspot.com",
    messagingSenderId: "44093262266",
    appId: "1:44093262266:web:98b22196f17e088b7bf583"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signupForm = document.getElementById('signup');
const loginForm = document.getElementById('login');
const dashboard = document.getElementById('dashboard');

const authLinks = document.getElementById('auth-links');
const userInfo = document.getElementById('user-info');
const userGreeting = document.getElementById('user-greeting');

document.getElementById('signup-button').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const displayName = document.getElementById('signup-display-name').value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        showDashboard(userCredential.user);
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('login-button').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showDashboard(userCredential.user);
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('header-logout-button').addEventListener('click', async () => {
    await signOut(auth);
    showAuthForms();
});

document.getElementById('add-transaction-button').addEventListener('click', async () => {
    const name = document.getElementById('transaction-name').value;
    const amount = document.getElementById('transaction-amount').value;
    try {
        await addDoc(collection(db, "transactions"), {
            name,
            amount,
            userId: auth.currentUser.uid
        });
    } catch (error) {
        console.error(error);
    }
});

onAuthStateChanged(auth, user => {
    if (user) {
        showDashboard(user);
    } else {
        showAuthForms();
    }
});

function showAuthForms() {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    dashboard.classList.add('hidden');
    authLinks.classList.remove('hidden');
    userInfo.classList.add('hidden');
}

function showDashboard(user) {
    signupForm.classList.add('hidden');
    loginForm.classList.add('hidden');
    dashboard.classList.remove('hidden');
    authLinks.classList.add('hidden');
    userInfo.classList.remove('hidden');
    userGreeting.textContent = `Hello, ${user.displayName}`;

    const transactionsList = document.getElementById('transactions');
    const userTransactionsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid));
    onSnapshot(userTransactionsQuery, snapshot => {
        transactionsList.innerHTML = '';
        snapshot.docs.forEach(doc => {
            const transaction = doc.data();
            const li = document.createElement('li');
            li.className = 'transaction-item';
            li.innerHTML = `
                <span>${transaction.name}: $${transaction.amount}</span>
                <span class="delete-button" data-id="${doc.id}">&times;</span>
            `;
            transactionsList.appendChild(li);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                await deleteDoc(doc(db, "transactions", id));
            });
        });
    });
}

document.getElementById('header-login-button').addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

document.getElementById('header-signup-button').addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});
