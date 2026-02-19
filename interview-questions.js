// Interview Questions functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionForm');
    const jobTitleInput = document.getElementById('jobRole');
    const resultsSection = document.getElementById('questionResults');
    const questionsOutput = document.getElementById('questionsOutput');

    // Demo interview questions for different job roles
    const demoQuestions = {
        'software engineer': {
            common: [
                "Tell me about yourself and your experience in software development.",
                "What programming languages are you most comfortable with?",
                "How do you approach debugging a complex issue?",
                "Describe your experience with version control systems like Git.",
                "How do you stay updated with new technologies and programming trends?",
                "Tell me about a challenging project you worked on and how you overcame obstacles.",
                "How do you ensure code quality and maintainability?"
            ],
            unexpected: [
                "If you could redesign the internet from scratch, what would you do differently?",
                "How would you explain recursion to a 5-year-old?"
            ]
        },
        'marketing manager': {
            common: [
                "Tell me about your marketing experience and background.",
                "How do you measure the success of a marketing campaign?",
                "Describe your experience with digital marketing channels.",
                "How do you identify and target your ideal customer?",
                "Tell me about a time you had to pivot a marketing strategy.",
                "How do you stay current with marketing trends and technologies?",
                "Describe your experience with budget management and ROI analysis."
            ],
            unexpected: [
                "If you had to market ice to Eskimos, how would you do it?",
                "What would you do if our biggest competitor hired you tomorrow?"
            ]
        },
        'data scientist': {
            common: [
                "Walk me through your data science workflow.",
                "How do you handle missing or dirty data?",
                "Explain a machine learning project you've worked on.",
                "How do you validate your models and ensure they're not overfitting?",
                "What's your experience with different programming languages for data science?",
                "How do you communicate complex findings to non-technical stakeholders?",
                "Describe your experience with big data technologies."
            ],
            unexpected: [
                "How would you use data science to improve pizza delivery?",
                "If you were a data point, what would you want to be and why?"
            ]
        },
        'product manager': {
            common: [
                "How do you prioritize features in a product roadmap?",
                "Tell me about a time you had to make a difficult product decision.",
                "How do you gather and incorporate user feedback?",
                "Describe your experience working with engineering and design teams.",
                "How do you measure product success?",
                "Tell me about a product launch you managed.",
                "How do you handle competing stakeholder requirements?"
            ],
            unexpected: [
                "Design a product for blind users.",
                "How would you improve the experience of waiting in line?"
            ]
        },
        'sales representative': {
            common: [
                "Tell me about your sales experience and achievements.",
                "How do you handle rejection and maintain motivation?",
                "Describe your sales process from lead to close.",
                "How do you build relationships with potential clients?",
                "Tell me about a time you exceeded your sales targets.",
                "How do you stay organized and manage your pipeline?",
                "Describe a challenging sale and how you closed it."
            ],
            unexpected: [
                "Sell me this pen.",
                "How would you sell sand in a desert?"
            ]
        },
        'default': {
            common: [
                "Tell me about yourself and your professional background.",
                "Why are you interested in this position?",
                "What are your greatest strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Why are you leaving your current job?",
                "Tell me about a challenge you faced and how you overcame it.",
                "What questions do you have for me?"
            ],
            unexpected: [
                "If you were an animal, what would you be and why?",
                "What's the most interesting thing you've learned recently?"
            ]
        }
    };

    // Check if all required elements exist
    if (!form || !jobTitleInput || !resultsSection || !questionsOutput) {
        console.error('Required form elements not found:', {
            form: !!form,
            jobTitleInput: !!jobTitleInput,
            resultsSection: !!resultsSection,
            questionsOutput: !!questionsOutput
        });
        return;
    }

    // Add form submit event listener
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const jobTitle = jobTitleInput.value.trim();
        if (!jobTitle) {
            alert('Please enter a job title');
            return;
        }

        generateQuestions(jobTitle);
    });

    function generateQuestions(jobTitle) {
        // Hide previous results
        resultsSection.style.display = 'none';
        
        // Get questions for the role
        const questions = getQuestionsForRole(jobTitle);
        
        // Display the questions
        displayQuestions(questions, jobTitle);
    }

    function getQuestionsForRole(jobTitle) {
        const normalizedTitle = jobTitle.toLowerCase();
        
        // Check for exact matches first
        if (demoQuestions[normalizedTitle]) {
            return demoQuestions[normalizedTitle];
        }
        
        // Check for partial matches
        for (const role in demoQuestions) {
            if (role !== 'default' && (normalizedTitle.includes(role) || role.includes(normalizedTitle))) {
                return demoQuestions[role];
            }
        }
        
        // Return default questions if no match found
        return demoQuestions['default'];
    }

    function displayQuestions(questions, jobTitle) {
        // Update role display
        const roleDisplay = document.getElementById('roleDisplay');
        if (roleDisplay) {
            roleDisplay.textContent = jobTitle;
        }
        
        // Generate HTML for questions
        let html = `
            <div class="questions-section">
                <div class="questions-group">
                    <h4>📋 Common Questions</h4>
                    <ul class="questions-list">
        `;
        
        questions.common.forEach(question => {
            html += `<li>${question}</li>`;
        });
        
        html += `
                    </ul>
                </div>
                
                <div class="questions-group">
                    <h4>🎯 Unexpected Questions</h4>
                    <ul class="questions-list">
        `;
        
        questions.unexpected.forEach(question => {
            html += `<li>${question}</li>`;
        });
        
        html += `
                    </ul>
                </div>
                
                <div class="tips-section">
                    <h4>💡 Preparation Tips</h4>
                    <ul class="tips-list">
                        <li>Practice your answers out loud, but don't memorize them word-for-word</li>
                        <li>Prepare specific examples using the STAR method (Situation, Task, Action, Result)</li>
                        <li>Research the company and role thoroughly</li>
                        <li>Prepare thoughtful questions to ask the interviewer</li>
                        <li>Practice good body language and maintain eye contact</li>
                    </ul>
                </div>
            </div>
        `;
        
        questionsOutput.innerHTML = html;
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});