import * as Elements from './elements.js';
import { routePath } from '../controller/route.js'; 
import { unauthorizedAccess } from './unauthorized_access.js';
import { currentUser } from '../controller/firebase_auth.js';

export function addEventListener(){

    Elements.menus.about.addEventListener('click', () =>
    {   
        history.pushState(null, null, routePath.ABOUT);
        about_page();
    })
}

export function about_page(){
    if(!currentUser){
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }
    let html = 'About page';

    Elements.root.innerHTML = html;
}