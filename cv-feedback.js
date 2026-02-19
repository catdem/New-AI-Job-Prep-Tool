// CV Feedback functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cvForm');
    const cvTextArea = document.getElementById('cvText');
    const targetRoleInput = document.getElementById('targetRole');
    const cvResults = document.getElementById('cvResults');
    const overallScore = document.getElementById('overallScore');
    const strengthsList = document.getElementById('strengthsList');
    const improvementsList = document.getElementById('improvementsList');
    const recommendationsText = document.getElementById('recommendationsText');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cvText = cvTextArea.value.trim();
        const targetRole = targetRoleInput.value.trim();
        
        if (!cvText) {
            alert('Please paste your CV text before getting feedback.');
            return;
        }

        // Hide previous results
        cvResults.style.display = 'none';
        
        // Simulate AI processing (in production, this would call an actual AI API)
        setTimeout(() => {
            generateCVFeedback(cvText, targetRole);
        }, 1500);
    });

    function generateCVFeedback(cvText, targetRole) {
        // Generate mock feedback based on CV content
        const feedback = analyzeCVContent(cvText, targetRole);
        
        // Update the results
        overallScore.textContent = feedback.score;
        
        // Update strengths
        strengthsList.innerHTML = '';
        feedback.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
        
        // Update improvements
        improvementsList.innerHTML = '';
        feedback.improvements.forEach(improvement => {
            const li = document.createElement('li');
            li.textContent = improvement;
            improvementsList.appendChild(li);
        });
        
        // Update recommendations
        recommendationsText.innerHTML = `<p>${feedback.recommendations}</p>`;
        
        // Show results
        cvResults.style.display = 'block';
        cvResults.scrollIntoView({ behavior: 'smooth' });
    }

    function analyzeCVContent(cvText, targetRole) {
        // Mock AI analysis - in production, this would call an actual AI service
        const wordCount = cvText.split(' ').length;
        const hasQuantifiableResults = /\d+%|\d+\s*(years?|months?)|increased|improved|reduced|achieved/i.test(cvText);
        const hasSkillsSection = /skills?|technologies?|competencies/i.test(cvText);
        const hasEducation = /education|degree|university|college|certification/i.test(cvText);
        
        let score = 70; // Base score
        const strengths = [];
        const improvements = [];
        
        // Analyze strengths
        if (hasQuantifiableResults) {
            strengths.push('Includes quantifiable achievements and results');
            score += 10;
        }
        if (hasSkillsSection) {
            strengths.push('Clear technical skills section');
            score += 5;
        }
        if (hasEducation) {
            strengths.push('Relevant education background included');
            score += 5;
        }
        if (wordCount > 200) {
            strengths.push('Comprehensive work experience descriptions');
            score += 5;
        }
        
        // Analyze improvements
        if (!hasQuantifiableResults) {
            improvements.push('Add more quantifiable achievements (percentages, numbers, metrics)');
            score -= 10;
        }
        if (wordCount < 150) {
            improvements.push('Expand on work experience with more detailed descriptions');
            score -= 5;
        }
        if (!targetRole) {
            improvements.push('Consider tailoring CV content to specific target roles');
        } else {
            improvements.push(`Optimize keywords for ${targetRole} positions`);
        }
        
        // Ensure minimum strengths and improvements
        if (strengths.length === 0) {
            strengths.push('Professional formatting and structure');
        }
        if (improvements.length === 0) {
            improvements.push('Consider adding more industry-specific keywords');
        }
        
        const recommendations = targetRole 
            ? `For ${targetRole} positions, focus on highlighting relevant experience and skills that match job requirements. Consider researching common keywords used in ${targetRole} job postings and incorporating them naturally into your CV.`
            : 'Consider tailoring your CV for specific roles by researching job requirements and incorporating relevant keywords. This will help your CV pass through Applicant Tracking Systems (ATS) and catch recruiters\' attention.';
        
        return {
            score: Math.min(95, Math.max(60, score)),
            strengths,
            improvements,
            recommendations
        };
    }
});