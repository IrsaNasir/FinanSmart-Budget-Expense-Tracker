 // ===== Cookie Consent Banner =====
if (!localStorage.getItem('cookieConsent')) {
  document.getElementById('cookieBanner').style.display = 'flex';
}

document.getElementById('acceptCookies').addEventListener('click', () => {
  localStorage.setItem('cookieConsent', 'accepted');
  document.getElementById('cookieBanner').style.display = 'none';
});

document.getElementById('rejectCookies').addEventListener('click', () => {
  localStorage.setItem('cookieConsent', 'rejected');
  document.getElementById('cookieBanner').style.display = 'none';
  alert('Note: FinanSmart needs local storage to save your transactions. Some features may not work without it.');
});

// ===== Contact Form =====
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you for reaching out! We\'ll get back to you soon. 🎉');
  contactForm.reset();
});