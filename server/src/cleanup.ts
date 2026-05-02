import { AppDataSource } from "./data-source";

async function cleanup() {
  console.log('🧹 Cleaning up database...');
  try {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Check if Studylog table exists and drop it
    // Using a raw query to be safe
    console.log('🗑️ Dropping table "Studylog" if it exists...');
    await queryRunner.query('DROP TABLE IF EXISTS "Studylog" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "studylog" CASCADE');
    
    console.log('✨ Cleanup completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
