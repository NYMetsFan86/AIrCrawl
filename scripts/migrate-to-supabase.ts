import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateUsers() {
  // Fetch users from Prisma
  const users = await prisma.user.findMany();

  // Insert users into Supabase
  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: user.email,
          name: user.name,
          // ...map other fields as necessary
        },
      ]);

    if (error) {
      console.error('Error inserting user:', user.id, error);
    } else {
      console.log('Successfully inserted user:', user.id);
    }
  }
}

async function migratePosts() {
  // Fetch posts from Prisma
  const posts = await prisma.post.findMany();

  // Insert posts into Supabase
  for (const post of posts) {
    const { error } = await supabase
      .from('posts')
      .insert([
        {
          id: post.id,
          title: post.title,
          content: post.content,
          user_id: post.userId,
          // ...map other fields as necessary
        },
      ]);

    if (error) {
      console.error('Error inserting post:', post.id, error);
    } else {
      console.log('Successfully inserted post:', post.id);
    }
  }
}

async function main() {
  try {
    await migrateUsers();
    await migratePosts();
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
