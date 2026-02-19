// Pitch Trainer functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pitchForm');
    const backgroundInput = document.getElementById('achievements');
    const pitchResults = document.getElementById('pitchResults');
    const pitchOutput = document.getElementById('generatedPitch');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect all form data to create a comprehensive background
        const currentRole = document.getElementById('currentRole').value.trim();
        const experience = document.getElementById('experience').value;
        const keySkills = document.getElementById('keySkills').value.trim();
        const targetRole = document.getElementById('targetRole').value.trim();
        const achievements = backgroundInput.value.trim();
        
        if (!currentRole || !experience || !keySkills || !targetRole) {
            alert('Please fill in all required fields');
            return;
        }

        const background = {
            currentRole,
            experience,
            keySkills,
            targetRole,
            achievements
        };

        generatePitch(background);
    });

    function generatePitch(background) {
        // Hide previous results
        pitchResults.style.display = 'none';
        
        // Simulate processing time
        setTimeout(() => {
            const pitch = createPersonalizedPitch(background);
            displayPitch(pitch);
        }, 1500);
    }

    function createPersonalizedPitch(background) {
        // Create a personalized pitch based on form data
        const { currentRole, experience, keySkills, targetRole, achievements } = background;
        
        let pitch = `Hi, I'm a ${currentRole} with ${experience} of experience. `;
        
        // Add skills
        pitch += `I specialize in ${keySkills}, `;
        
        // Add achievements if provided
        if (achievements) {
            pitch += `and I'm particularly proud of ${achievements.toLowerCase()}. `;
        }
        
        // Add target role
        pitch += `I'm currently looking to transition into a ${targetRole} role where I can continue to grow and contribute my expertise.`;
        
        return pitch;
    }

    function displayPitch(pitch) {
        let html = `
            <div class="pitch-section">
                <h3>Your Personalized Pitch</h3>
                <div class="pitch-content">
                    <p class="generated-pitch">"${pitch}"</p>
                </div>
            </div>
            
            <div class="pitch-tips">
                <h4>💡 Delivery Tips</h4>
                <ul class="tips-list">
                    <li>Keep it concise: Aim for 30-60 seconds</li>
                    <li>Practice regularly: Rehearse until it feels natural</li>
                    <li>Customize for context: Adapt based on your audience</li>
                    <li>Show enthusiasm: Let your passion come through</li>
                    <li>End with a question: Engage the listener</li>
                </ul>
            </div>
            
            <div class="practice-section">
                <h4>🎯 Practice Suggestions</h4>
                <ul class="practice-list">
                    <li>Record yourself delivering the pitch and review it</li>
                    <li>Practice in front of a mirror to work on body language</li>
                    <li>Time yourself to ensure it's the right length</li>
                    <li>Get feedback from friends or colleagues</li>
                    <li>Adapt the pitch for different situations (networking, interviews, etc.)</li>
                </ul>
            </div>
        `;

        pitchOutput.innerHTML = html;
        pitchResults.style.display = 'block';
        pitchResults.scrollIntoView({ behavior: 'smooth' });
    }

    // Character counter for textarea
    const maxChars = 1000;
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.textContent = `0 / ${maxChars} characters`;
    
    // Check if backgroundInput exists before accessing parentNode
    if (backgroundInput && backgroundInput.parentNode) {
        backgroundInput.parentNode.appendChild(charCounter);

        backgroundInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCounter.textContent = `${currentLength} / ${maxChars} characters`;
            
            if (currentLength > maxChars) {
                charCounter.style.color = '#e74c3c';
                this.value = this.value.substring(0, maxChars);
            } else if (currentLength > maxChars * 0.9) {
                charCounter.style.color = '#f39c12';
            } else {
                charCounter.style.color = '#6B7280';
            }
        });
    } else {
        console.error('Background input element not found or has no parent node');
    }
});