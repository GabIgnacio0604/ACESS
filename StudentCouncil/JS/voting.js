document.addEventListener('DOMContentLoaded', async () => {
    const votingForm = document.getElementById('voting-form');
    
    // Check voting status and user eligibility
    async function checkVotingStatus() {
        try {
            const response = await fetch('../User/Php/check_voting_status.php');
            const data = await response.json();
            
            if (data.success) {
                if (!data.voting_active) {
                    votingForm.innerHTML = `
                        <div style="text-align:center;padding:40px;color:#fff;">
                            <h2 style="color:#ffd54f;">Voting is Currently Closed</h2>
                            <p>Please wait for the administration to activate voting.</p>
                        </div>
                    `;
                    return false;
                }
                
                if (data.already_voted) {
                    votingForm.innerHTML = `
                        <div style="text-align:center;padding:40px;color:#fff;">
                            <h2 style="color:#4CAF50;">Thank You for Voting!</h2>
                            <p>You have already submitted your vote.</p>
                            <p>Results will be announced after voting closes.</p>
                        </div>
                    `;
                    return false;
                }
                
                return true;
            } else {
                alert('Error checking voting status: ' + data.message);
                return false;
            }
        } catch (err) {
            console.error('Error checking voting status:', err);
            alert('Failed to check voting status');
            return false;
        }
    }
    
    // Load candidates for voting with photos
    async function loadCandidates() {
        const canVote = await checkVotingStatus();
        if (!canVote) return;
        
        try {
            const response = await fetch('../API/get_voting_candidate.php');
            const data = await response.json();

            if (data.success) {
                votingForm.innerHTML = '';
                
                // Define position order
                const positionOrder = [
                    'President', 
                    'Vice President', 
                    'Secretary', 
                    'Treasurer', 
                    'Auditor', 
                    'P.I.O', 
                    'P.O',
                    'Grade 12',
                    'Grade 11',
                    'Grade 10',
                    'Grade 9',
                    'Grade 8',
                    'Grade 7'
                ];
                
                // Create sections for each position in order
                positionOrder.forEach(position => {
                    if (data.candidates[position] && data.candidates[position].length > 0) {
                        const section = document.createElement('div');
                        section.className = 'position-section';
                        
                        const candidatesList = data.candidates[position].map(candidate => {
                            const photoHtml = candidate.photo_url 
                                ? `<img src="${candidate.photo_url}" alt="${candidate.name}">`
                                : `<div class="placeholder-photo">👤</div>`;
                            
                            return `
                                <label class="candidate-bar">
                                    <input type="radio" name="${position}" value="${candidate.id}" required>
                                    ${photoHtml}
                                    <span>${candidate.name}</span>
                                </label>
                            `;
                        }).join('');
                        
                        section.innerHTML = `
                            <h3>${position}</h3>
                            <div class="candidates-list">
                                ${candidatesList}
                            </div>
                        `;
                        
                        votingForm.appendChild(section);
                    }
                });
                
                // Add submit button
                const submitSection = document.createElement('div');
                submitSection.className = 'submit-section';
                submitSection.innerHTML = '<button type="submit" class="submit-button">Submit Your Vote</button>';
                votingForm.appendChild(submitSection);
                
            } else {
                votingForm.innerHTML = `
                    <div style="text-align:center;padding:40px;color:#fff;">
                        <p style="color:#f44;">Error loading candidates: ${data.message}</p>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Error loading candidates:', err);
            votingForm.innerHTML = `
                <div style="text-align:center;padding:40px;color:#fff;">
                    <p style="color:#f44;">Failed to load candidates. Please try again.</p>
                </div>
            `;
        }
    }

    // Handle form submission
    votingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!confirm('Are you sure you want to submit your vote? This action cannot be undone.')) {
            return;
        }
        
        const formData = new FormData(votingForm);
        const votes = {};

        // Convert FormData to object
        for (const [position, candidateId] of formData.entries()) {
            votes[position] = parseInt(candidateId);
        }
        
        // Disable submit button
        const submitBtn = votingForm.querySelector('.submit-button');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }

        try {
            const response = await fetch('../User/Php/submit_vote.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(votes)
            });

            const result = await response.json();

            if (result.success) {
                alert('Vote submitted successfully! Thank you for participating.');
                // Redirect to dashboard
                window.location.href = 'ACESS_Student_Council.html';
            } else {
                alert('Failed to submit vote: ' + result.message);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Your Vote';
                }
            }
        } catch (err) {
            console.error('Error submitting vote:', err);
            alert('Error submitting vote. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Your Vote';
            }
        }
    });

    // Load candidates on page load
    await loadCandidates();
});