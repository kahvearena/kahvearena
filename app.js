function go(url){ window.location.href = url; }

function toggleMenu(){
  const nav = document.getElementById('nav');
  if(nav) nav.classList.toggle('open');
}

function alertBox(msg){
  alert(msg);
}

function login(){
  const user = document.getElementById('loginUser')?.value || 'Kursadben';
  localStorage.setItem('ka_logged', '1');
  localStorage.setItem('ka_user', user);
  window.location.href = 'dashboard.html';
}

function logout(){
  localStorage.removeItem('ka_logged');
  window.location.href = 'index.html';
}

function isLogged(){
  return localStorage.getItem('ka_logged') === '1';
}

function guard(){
  if(!isLogged()){
    alert('Önce giriş yapmalısın.');
    window.location.href = 'login.html';
  }
}

function requireLogin(target){
  if(isLogged()){
    window.location.href = target;
  } else {
    alert('Oyunlara katılmak için önce giriş yapmalısın.');
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const username = document.getElementById('username');
  if(username) username.textContent = localStorage.getItem('ka_user') || 'Kursadben';
});
