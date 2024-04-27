export const root = document.getElementById('root');

export const modalInfobox = {
    modal : new bootstrap.Modal(document.getElementById('modal-infobox'),{backdrop: 'static'}),
    title : document.getElementById('modal-info-title'),
    body : document.getElementById('modal-info-body')
}

export const modalSignin =new bootstrap.Modal(document.getElementById('modal-signin-form'),{backdrop: 'static'});
export const formSignin = document.getElementById('formsign-in');


export const modalpreauthElements =  document.getElementsByClassName('modal-preauth');
export const modalpostauthElements = document.getElementsByClassName('modal-postauth');

export const menus = {
    signIn: document.getElementById('menu-signin'),
    tictactoe: document.getElementById('menu-tictactoe'),
    about: document.getElementById('menu-about'),
    communityfeedpage: document.getElementById('menu-communityfeedpage'),
    signOut: document.getElementById('menu-signout'),
}