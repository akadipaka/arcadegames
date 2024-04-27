import * as Elements from '../viewpage/elements.js';


export function addEventListeners() {
    Elements.formSignin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
    });
}
