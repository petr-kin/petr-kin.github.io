// Dark/Light Mode Toggle const toggleMode = document.querySelector('.toggle-mode'); const body = document.body;

// Default is dark mode if (localStorage.getItem('lightMode') === 'enabled') { body.classList.add('light-mode'); toggleMode.innerHTML = '<i class="fas fa-moon"></i>'; }

// Toggle dark/light mode toggleMode.addEventListener('click', () => { body.classList.toggle('light-mode');

// Update icon and save preference
if (body.classList.contains('light-mode')) {
    toggleMode.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('lightMode', 'enabled');
} else {
    toggleMode.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('lightMode', 'disabled');
}
});

// Smooth scrolling for navigation links document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', function(e) { e.preventDefault();

    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
    }
});
});

// Animate skill bars on scroll const skillBars = document.querySelectorAll('.skill-progress'); const skillSection = document.querySelector('.skills');

// Function to animate skill bars function animateSkillBars() { const sectionTop = skillSection.getBoundingClientRect().top; const windowHeight = window.innerHeight;

if (sectionTop < windowHeight - 150) {
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 300);
    });
    
    // Remove the event listener after animation
    window.removeEventListener('scroll', animateSkillBars);
}
}

// Add scroll event listener window.addEventListener('scroll', animateSkillBars);

// Form submission (you'll need to set up backend handling) const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => { e.preventDefault();

// Get form data
const formData = new FormData(contactForm);
const formDataObj = Object.fromEntries(formData);

// Here you would normally send the data to a server
// For now, just log it to console and show a success alert
console.log('Form data:', formDataObj);
alert('Thanks for your message! I\'ll get back to you soon.');

// Clear form
contactForm.reset();
});

// Lazy load for projects const projectCards = document.querySelectorAll('.project-card');

// Intersection Observer for projects const projectObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = 1; entry.target.style.transform = 'translateY(0)'; projectObserver.unobserve(entry.target); } }); }, { threshold: 0.2 });

// Set initial style and observe projectCards.forEach(card => { card.style.opacity = 0; card.style.transform = 'translateY(20px)'; card.style.transition = 'opacity 0.8s ease, transform 0.8s ease'; projectObserver.observe(card); });

// Mobile menu for smaller screens // This would be implemented if you add a mobile hamburger menu button

