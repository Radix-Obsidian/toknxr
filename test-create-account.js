require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAccount() {
  try {
    console.log('Creating test account...');

    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@test.com',
      password: 'testpassword123'
    });

    if (error) {
      console.error('Error creating account:', error.message);
    } else {
      console.log('Test account created successfully!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No (check email)');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

createTestAccount();