// IMPORTANT: Replace with your actual Supabase project URL and anon public key
const SUPABASE_URL = 'https://olcyxuzkvrrggvbrmwii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY3l4dXprdnJyZ2d2YnJtd2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDcwMzEsImV4cCI6MjA5MTcyMzAzMX0.wP3CvqZNgKlMMo2A_yrzp7cxz3UEfynnpz6K5NuntTI';

// Initialize Supabase Client
console.log('Initializing Supabase with:', SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client created:', supabaseClient);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlist-form');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submit-btn');
    const messageEl = document.getElementById('form-message');

    // Basic email validation regex
    const isValidEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            resetMessage();

            const email = emailInput.value.trim();
            
            if (!email) {
                showMessage('PLEASE ENTER AN EMAIL ADDRESS.', 'error');
                return;
            }
            
            // Validate the email format
            if (!isValidEmail(email)) {
                showMessage('INVALID EMAIL FORMAT.', 'error');
                return;
            }

            setLoading(true);

            try {
                // Table: waitlist (assuming default columns: id (uuid/autoincrement), email (text, unique), created_at (timestamp)) 
                console.log('Attempting to insert email:', email);
                const { data, error } = await supabaseClient
                    .from('waitlist')
                    .insert([{ email: email }]);

                console.log('Supabase response:', { data, error });

                if (error) {
                    // Check for Supabase / Postgres unique constraint violation (code 23505)
                    if (error.code === '23505') {
                        showMessage('EMAIL ALREADY EXISTS ON THE LIST.', 'error');
                    } else {
                        console.error('Supabase error specifics:', error);
                        throw error;
                    }
                } else {
                    showMessage("YOU'RE ON THE LIST.", 'success');
                    emailInput.value = ''; // Clear input on success
                }
            } catch (err) {
                console.error('Submission error:', err);
                if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
                    showMessage('SYSTEM ERROR: SUPABASE CREDENTIALS NOT SET.', 'error');
                } else {
                    showMessage('AN ERROR OCCURRED. PLEASE TRY AGAIN LATER.', 'error');
                }
            } finally {
                setLoading(false);
            }
        });
    }

    function showMessage(text, type) {
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
    }

    function resetMessage() {
        messageEl.textContent = '';
        messageEl.className = 'message hidden';
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'PROCESSING...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'JOIN THE WAITLIST';
        }
    }
});
