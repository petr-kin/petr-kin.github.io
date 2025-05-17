// Main JavaScript for Petr Kindlmann's Portfolio

document.addEventListener("DOMContentLoaded", function() {
    // ========== Hero Background Image Enhancement ==========
    const hero = document.querySelector('.hero');
    
    // Add subtle parallax effect to the background image
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        if (hero && scrollPosition < window.innerHeight) {
            // Move the background at a slower rate than the scroll for parallax effect
            const translateY = scrollPosition * 0.4;
            hero.style.backgroundPositionY = `calc(50% + ${translateY}px)`;
        }
    });
    
    // ========== Dark/Light Mode Toggle ==========
    const toggleMode = document.querySelector('.toggle-mode');
    const body = document.body;
    
    // Default is dark mode
    if (localStorage.getItem('lightMode') === 'enabled') {
        body.classList.add('light-mode');
        toggleMode.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Toggle dark/light mode
    toggleMode.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        
        // Update icon and save preference
        if (body.classList.contains('light-mode')) {
            toggleMode.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('lightMode', 'enabled');
        } else {
            toggleMode.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('lightMode', 'disabled');
        }
    });

    // ========== Typing Animation Effect for Hero Tagline ==========
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const taglineText = tagline.textContent;
        tagline.textContent = '';
        
        let i = 0;
        const typeEffect = setInterval(() => {
            if (i < taglineText.length) {
                tagline.textContent += taglineText.charAt(i);
                i++;
            } else {
                clearInterval(typeEffect);
            }
        }, 50);
    }
// Make tool items show more info when clicked
const toolItems = document.querySelectorAll('.tool-item');
    
toolItems.forEach(item => {
    const skillName = item.querySelector('span').textContent;
    
    item.addEventListener('click', () => {
        // Create a small popup with skill info
        const infoPopup = document.createElement('div');
        infoPopup.className = 'skill-info-popup';
        
        // Customize content based on the skill
        let skillInfo = '';
        switch(skillName.toLowerCase()) {
            case 'python':
                skillInfo = 'Used for test automation with Robot Framework and custom test scripts';
                break;
            case 'javascript':
                skillInfo = 'Frontend testing and automation with Jest, Cypress, and Puppeteer';
                break;
            case 'git':
                skillInfo = 'Version control for test scripts and collaboration with development teams';
                break;
            case 'docker':
                skillInfo = 'Creating isolated test environments and containerized test infrastructure';
                break;
            case 'jira':
                skillInfo = 'Test case management, defect tracking, and agile workflow integration';
                break;
            case 'react':
                skillInfo = 'Component testing and frontend test automation for React applications';
                break;
            case 'sql':
                skillInfo = 'Database testing, data validation, and test data management';
                break;
            case 'security':
                skillInfo = 'OWASP testing methodology, vulnerability assessment, and penetration testing';
                break;
            default:
                skillInfo = 'Click to see more information about this skill';
        }
        
        infoPopup.innerHTML = `
            <div class="popup-content">
                <h4>${skillName}</h4>
                <p>${skillInfo}</p>
            </div>
        `;
        
        // Position the popup
        document.body.appendChild(infoPopup);
        const rect = item.getBoundingClientRect();
        infoPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
        infoPopup.style.left = `${rect.left + window.scrollX - 50}px`;
        
        // Show the popup
        setTimeout(() => {
            infoPopup.classList.add('show-popup');
        }, 10);
        
        // Close popup when clicking elsewhere
        document.addEventListener('click', function closePopup(e) {
            if (!infoPopup.contains(e.target) && e.target !== item) {
                infoPopup.classList.remove('show-popup');
                setTimeout(() => {
                    document.body.removeChild(infoPopup);
                }, 300);
                document.removeEventListener('click', closePopup);
            }
        });
    });
});
    

    // ========== Interactive Experience Timeline ==========
    const experienceItems = document.querySelectorAll('.experience-item');
    
    experienceItems.forEach(item => {
        // Add hover effect class
        item.addEventListener('mouseenter', () => {
            item.classList.add('highlight-experience');
        });
        
        item.addEventListener('mouseleave', () => {
            item.classList.remove('highlight-experience');
        });
        
        // Make achievements expandable on mobile
        const header = item.querySelector('.experience-header');
        const body = item.querySelector('.experience-body');
        
        if (window.innerWidth < 768) {
            body.style.display = 'none';
            header.classList.add('expandable');
            
            header.addEventListener('click', () => {
                if (body.style.display === 'none') {
                    body.style.display = 'block';
                    header.classList.add('expanded');
                } else {
                    body.style.display = 'none';
                    header.classList.remove('expanded');
                }
            });
        }
    });

    // ========== Scroll Animations ==========
    // Function to determine if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }

    // Elements to animate on scroll
    const animatedSections = document.querySelectorAll('.about, .experience, .skills, .projects, .contact');
    const experienceSections = document.querySelectorAll('.experience-item');
    const projectCards = document.querySelectorAll('.project-card');
    
    // Set initial state for animated elements
    animatedSections.forEach(section => {
        section.classList.add('hidden-section');
    });
    
    experienceSections.forEach(item => {
        item.classList.add('slide-hidden');
    });
    
    projectCards.forEach(card => {
        card.classList.add('fade-hidden');
    });
    
    // Animate elements when scrolled into view
    function animateOnScroll() {
        animatedSections.forEach(section => {
            if (isInViewport(section) && section.classList.contains('hidden-section')) {
                section.classList.remove('hidden-section');
                section.classList.add('animate-section');
            }
        });
        
        experienceSections.forEach(item => {
            if (isInViewport(item) && item.classList.contains('slide-hidden')) {
                item.classList.remove('slide-hidden');
                item.classList.add('slide-visible');
            }
        });
        
        projectCards.forEach(card => {
            if (isInViewport(card) && card.classList.contains('fade-hidden')) {
                card.classList.remove('fade-hidden');
                card.classList.add('fade-visible');
            }
        });
    }
    
    // Initial check and add scroll listener
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // ========== Interactive Skills Section ==========
    // Create skill progress bars dynamically
    const skillItems = document.querySelectorAll('.skill-category ul li');
    
    skillItems.forEach(item => {
        // Create wrapper for the skill item
        const skillWrapper = document.createElement('div');
        skillWrapper.className = 'skill-wrapper';
        
        // Get the original text
        const skillText = item.textContent;
        
        // Create random proficiency between 75-95% for skills
        const proficiency = Math.floor(Math.random() * (95 - 75 + 1)) + 75;
        
        // Create skill bar HTML
        skillWrapper.innerHTML = `
            <div class="skill-info">
                <span>${skillText}</span>
                <span class="proficiency">${proficiency}%</span>
            </div>
            <div class="skill-bar">
                <div class="skill-progress" style="width: 0%"></div>
            </div>
        `;
        
        // Replace the li content
        item.textContent = '';
        item.appendChild(skillWrapper);
    });
    
    // Animate skill bars when in viewport
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillSection = document.querySelector('.skills');
    
    function animateSkillBars() {
        if (isInViewport(skillSection)) {
            skillBars.forEach(bar => {
                const parentElement = bar.parentElement.previousElementSibling;
                const proficiency = parentElement.querySelector('.proficiency').textContent;
                const width = proficiency;
                
                setTimeout(() => {
                    bar.style.width = width;
                }, 300);
            });
            
            // Remove event listener after animation
            window.removeEventListener('scroll', animateSkillBars);
        }
    }
    
    // Add scroll event listener for skill bars
    window.addEventListener('scroll', animateSkillBars);

    // ========== Interactive Project Cards ==========
    const projectImages = document.querySelectorAll('.project-placeholder');
    
    // Add different gradient colors to projects
    const gradientColors = [
        ['#4a72ff', '#6f8fff'],
        ['#ff4a8d', '#ff6f9e'],
        ['#4aff8d', '#6fff9e'],
        ['#ff8d4a', '#ff9e6f']
    ];
    
    projectImages.forEach((img, index) => {
        const colorIndex = index % gradientColors.length;
        img.style.background = `linear-gradient(135deg, ${gradientColors[colorIndex][0]}, ${gradientColors[colorIndex][1]})`;
        
        // Add project icons
        const icons = ['<i class="fas fa-robot"></i>', '<i class="fas fa-shield-alt"></i>'];
        img.innerHTML = icons[index % icons.length];
    });
    
    // Add click event to project cards to show more details
    const projectInfos = document.querySelectorAll('.project-info');
    
    projectInfos.forEach(info => {
        const title = info.querySelector('h3').textContent;
        const description = info.querySelector('p').textContent;
        const tags = Array.from(info.querySelectorAll('.project-tags span')).map(tag => tag.textContent);
        
        // Create "Read More" button
        const button = info.querySelector('.project-btn');
        button.textContent = 'View Details';
        
        // Add click event to show modal with project details
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'project-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>${title}</h2>
                    <div class="modal-description">
                        <p>${description}</p>
                        <p>This project utilizes ${tags.join(', ')} to deliver a robust solution for quality assurance testing needs.</p>
                        <h3>Key Features:</h3>
                        <ul>
                            <li>Advanced test automation architecture</li>
                            <li>Comprehensive reporting dashboard</li>
                            <li>Seamless CI/CD integration</li>
                            <li>Flexible test case management</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button class="btn primary">GitHub Repo</button>
                        <button class="btn secondary">Live Demo</button>
                    </div>
                </div>
            `;
            
            // Add modal to body
            document.body.appendChild(modal);
            
            // Show modal with animation
            setTimeout(() => {
                modal.classList.add('show-modal');
            }, 10);
            
            // Close modal when clicking on X or outside the modal
            const closeButton = modal.querySelector('.close-modal');
            closeButton.addEventListener('click', () => {
                modal.classList.remove('show-modal');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show-modal');
                    setTimeout(() => {
                        document.body.removeChild(modal);
                    }, 300);
                }
            });
        });
    });

    // ========== Smooth scrolling for navigation links ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
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

    // ========== Active Navigation Highlight ==========
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    function highlightNavigation() {
        let scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavigation);

    // ========== Form Validation and Submission ==========
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageInput = contactForm.querySelector('textarea');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        
        // Add event listeners for real-time validation
        nameInput.addEventListener('input', validateName);
        emailInput.addEventListener('input', validateEmail);
        messageInput.addEventListener('input', validateMessage);
        
        function validateName() {
            if (nameInput.value.trim().length < 2) {
                nameInput.classList.add('invalid');
                return false;
            } else {
                nameInput.classList.remove('invalid');
                nameInput.classList.add('valid');
                return true;
            }
        }
        
        function validateEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                emailInput.classList.add('invalid');
                return false;
            } else {
                emailInput.classList.remove('invalid');
                emailInput.classList.add('valid');
                return true;
            }
        }
        
        function validateMessage() {
            if (messageInput.value.trim().length < 10) {
                messageInput.classList.add('invalid');
                return false;
            } else {
                messageInput.classList.remove('invalid');
                messageInput.classList.add('valid');
                return true;
            }
        }
        
        // Form submission
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate all fields before submission
            const isNameValid = validateName();
            const isEmailValid = validateEmail();
            const isMessageValid = validateMessage();
            
            if (isNameValid && isEmailValid && isMessageValid) {
                // Get form data
                const formData = new FormData(contactForm);
                const formDataObj = Object.fromEntries(formData);
                
                // Show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Simulate form submission (replace with actual submission)
                setTimeout(() => {
                    // Here you would normally send the data to a server
                    console.log('Form data:', formDataObj);
                    
                    // Show success message
                    contactForm.innerHTML = `
                        <div class="success-message">
                            <i class="fas fa-check-circle"></i>
                            <h3>Message Sent Successfully!</h3>
                            <p>Thanks for reaching out, ${formDataObj.name}! I'll get back to you soon.</p>
                        </div>
                    `;
                }, 1500);
            } else {
                // Show error message for invalid form
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.textContent = 'Please fill out all fields correctly.';
                
                const existingError = contactForm.querySelector('.form-error');
                if (existingError) {
                    contactForm.removeChild(existingError);
                }
                
                contactForm.insertBefore(errorMessage, submitButton);
                
                // Shake effect for error
                errorMessage.classList.add('shake');
                setTimeout(() => {
                    errorMessage.classList.remove('shake');
                }, 500);
            }
        });
    }

    // ========== Mobile Menu Toggle ==========
    // Create mobile menu button if not exists
    const nav = document.querySelector('nav');
    let mobileMenuBtn = nav.querySelector('.mobile-menu-btn');
    
    if (!mobileMenuBtn && window.innerWidth < 768) {
        mobileMenuBtn = document.createElement('div');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        nav.appendChild(mobileMenuBtn);
        
        mobileMenuBtn.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('show-mobile-menu');
            
            // Change icon based on menu state
            if (navLinks.classList.contains('show-mobile-menu')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // ========== Skills Tracker Integration ==========
    // Create a button to show skills progress
    const skillsHeader = document.querySelector('.skills .section-header');
    const skillsTracker = document.createElement('button');
    skillsTracker.className = 'btn primary skills-tracker-btn';
    skillsTracker.innerHTML = '<i class="fas fa-chart-line"></i> View Skills Progress';
    skillsHeader.appendChild(skillsTracker);
    
    // Create skills tracker modal
    skillsTracker.addEventListener('click', () => {
        const trackerModal = document.createElement('div');
        trackerModal.className = 'skills-tracker-modal';
        trackerModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Skills Progress Tracker</h2>
                <div class="skills-chart">
                    <canvas id="skillsChart"></canvas>
                </div>
                <div class="skills-timeline">
                    <h3>Learning Journey</h3>
                    <div class="timeline-progress">
                        <div class="progress-item">
                            <div class="progress-marker completed">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="progress-content">
                                <h4>Manual Testing Mastery</h4>
                                <p>Completed in 2022</p>
                            </div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-marker completed">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="progress-content">
                                <h4>Test Automation Foundations</h4>
                                <p>Completed in 2023</p>
                            </div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-marker in-progress">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="progress-content">
                                <h4>Advanced Automation Frameworks</h4>
                                <p>In progress - 75% complete</p>
                            </div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-marker future">
                                <i class="fas fa-hourglass"></i>
                            </div>
                            <div class="progress-content">
                                <h4>Security Testing Expertise</h4>
                                <p>Starting Q3 2025</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(trackerModal);
        
        // Show modal with animation
        setTimeout(() => {
            trackerModal.classList.add('show-modal');
        }, 10);
        
        // Close modal functionality
        const closeButton = trackerModal.querySelector('.close-modal');
        closeButton.addEventListener('click', () => {
            trackerModal.classList.remove('show-modal');
            setTimeout(() => {
                document.body.removeChild(trackerModal);
            }, 300);
        });
        
        trackerModal.addEventListener('click', (e) => {
            if (e.target === trackerModal) {
                trackerModal.classList.remove('show-modal');
                setTimeout(() => {
                    document.body.removeChild(trackerModal);
                }, 300);
            }
        });
        
        // Create chart (would require Chart.js in production)
        // This is a placeholder for the chart functionality
        console.log('Skills chart would be rendered here');
    });

    // ========== Back to Top Button ==========
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopBtn);
    
    // Show/hide back to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show-back-to-top');
        } else {
            backToTopBtn.classList.remove('show-back-to-top');
        }
    });
    
    // Scroll to top when button is clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
