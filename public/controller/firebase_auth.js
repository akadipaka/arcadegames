import {
    getAuth, signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.9.4/firebase-auth.js";

import * as Elements from '../viewpage/elements.js';
import { DEV } from "../modal/constants.js";
import { info } from "../viewpage/util.js";
import { routing } from "./route.js";
import { welcome_page } from "../viewpage/welcome_page.js";

const auth = getAuth();

export let currentUser = null;

export function addEventListener() {
    Elements.formSignin.addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            Elements.modalSignin.hide();
        } catch (e) {
            if (DEV) console.log('Sign in error', e);
            const errorCode = e.code;
            const errorMessage = e.message;
            info('sign in error', errorMessage, Elements.modalSignin);
        }
    });

    Elements.menus.signOut.addEventListener('click', async () => {
        try{
            await signOut(auth);
        } catch (e) {
            if (DEV) console.log('sign in error', e);
            info('sign out error', JSON.stringify(e));
        }

    });



    onAuthStateChanged(auth, onAuthStateChangedObserver);
}

export async function onAuthStateChangedObserver(user) {
    currentUser = user;
    if (user) {
        //sign in
        for (let i = 0; i < Elements.modalpreauthElements.length; i++) {
            Elements.modalpreauthElements[i].style.display = 'none';
        }
        for (let i = 0; i < Elements.modalpostauthElements.length; i++) {
            Elements.modalpostauthElements[i].style.display = 'block';
        }
        const pathname =  window.location.pathname;
        const hash = window.location.hash;
        routing(pathname, hash);
    } else {
        //sign out
        for (let i = 0; i < Elements.modalpreauthElements.length; i++) {
            Elements.modalpreauthElements[i].style.display = 'block';
        }
        for (let i = 0; i < Elements.modalpostauthElements.length; i++) {
            Elements.modalpostauthElements[i].style.display = 'none';
        }
        Elements.root.innerHTML = await welcome_page();
    }
}