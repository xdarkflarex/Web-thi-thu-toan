# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `web-thi-thu-toan` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (usually takes 1-2 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## 4. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste it into the SQL Editor
4. Click **Run** to execute the SQL

This will create:
- `questions` table
- `question_answers` table  
- `question_images` table
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

## 5. Set Up Storage (Optional)

If you want to store images in Supabase Storage:

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name: `question-images`
4. Make it **Public**
5. Set file size limit to 10MB
6. Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

## 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `/question/create` in your browser
3. Fill out the form and submit
4. Check your Supabase dashboard → **Table Editor** → **questions** to see the created question

## 7. Authentication Setup (Optional)

If you want to add user authentication:

1. Go to **Authentication** → **Settings** in Supabase
2. Configure your preferred auth providers
3. Update the RLS policies if needed
4. Add auth components to your app

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**: Check that your environment variables are correct
2. **"Table doesn't exist" error**: Make sure you ran the SQL schema
3. **CORS errors**: Ensure your domain is added to allowed origins in Supabase settings
4. **RLS policy errors**: Check that your policies are correctly set up

### Useful Commands:

```bash
# Check if environment variables are loaded
npm run dev
# Look for any error messages in the console

# Verify Supabase connection
# Add this to a component temporarily:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## Next Steps

Once everything is working:

1. **Add error handling**: Replace `alert()` with proper toast notifications
2. **Add image upload**: Integrate with Supabase Storage for image uploads
3. **Add authentication**: Implement user login/signup
4. **Add question listing**: Create a page to view all questions
5. **Add question editing**: Allow users to edit existing questions

## Database Schema Overview

### Questions Table
- Stores the main question data
- Supports 3 types: multiple-choice, multiple-select, short-answer
- Includes category, level, and solution guide

### Question Answers Table
- Stores answer options for multiple-choice and multiple-select questions
- Maintains order with `answer_order` field

### Question Images Table
- Stores image URLs and metadata for questions
- Supports multiple images per question

All tables include proper foreign key relationships and cascade deletes.
