// backup-simple.js
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.cnxyofqchoejrdrxdmwd',
  password: 'j!JDQmr7S2PuF5d',
  ssl: { rejectUnauthorized: false }
});

async function backup() {
  try {
    console.log('🔄 Підключаюсь до Supabase...');
    await client.connect();
    console.log('✅ Підключено!');
    
    // Отримуємо список таблиць
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📊 Знайдено таблиць: ${tablesRes.rows.length}`);
    
    let backupSQL = '-- Supabase Backup\n-- Generated: ' + new Date().toISOString() + '\n\n';
    
    // Для кожної таблиці отримуємо структуру
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      console.log(`📦 Обробляю таблицю: ${tableName}`);
      
      // 1. Отримуємо структуру (CREATE TABLE)
      const columnsRes = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      if (columnsRes.rows.length === 0) continue;
      
      // Будуємо CREATE TABLE
      let createTableSQL = `CREATE TABLE "${tableName}" (\n`;
      const columns = [];
      
      for (const col of columnsRes.rows) {
        let columnDef = `  "${col.column_name}" ${col.data_type.toUpperCase()}`;
        
        if (col.data_type.includes('char') || col.data_type.includes('text')) {
          // Для текстових типів
          const charMaxRes = await client.query(`
            SELECT character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public' 
              AND table_name = $1 
              AND column_name = $2
          `, [tableName, col.column_name]);
          
          if (charMaxRes.rows[0]?.character_maximum_length) {
            columnDef += `(${charMaxRes.rows[0].character_maximum_length})`;
          }
        }
        
        if (col.is_nullable === 'NO') {
          columnDef += ' NOT NULL';
        }
        
        if (col.column_default) {
          columnDef += ` DEFAULT ${col.column_default}`;
        }
        
        columns.push(columnDef);
      }
      
      createTableSQL += columns.join(',\n');
      createTableSQL += '\n);\n';
      
      backupSQL += `-- ====================================\n`;
      backupSQL += `-- Table: ${tableName}\n`;
      backupSQL += `-- ====================================\n\n`;
      backupSQL += createTableSQL + '\n';
      
      // 2. Отримуємо індекси
      try {
        const indexesRes = await client.query(`
          SELECT 
            indexname,
            indexdef
          FROM pg_indexes
          WHERE schemaname = 'public' 
            AND tablename = $1
        `, [tableName]);
        
        for (const idx of indexesRes.rows) {
          if (!idx.indexdef.includes('CREATE UNIQUE INDEX') && 
              !idx.indexdef.includes('CREATE INDEX')) {
            backupSQL += `${idx.indexdef};\n`;
          }
        }
        if (indexesRes.rows.length > 0) {
          backupSQL += '\n';
        }
      } catch (e) {
        // Ігноруємо помилки з індексами
      }
      
      // 3. Отримуємо дані (обмежуємо 1000 рядків)
      try {
        const dataRes = await client.query(`SELECT * FROM "${tableName}" LIMIT 1000`);
        
        if (dataRes.rows.length > 0) {
          backupSQL += `-- Дані для ${tableName} (${dataRes.rows.length} рядків)\n`;
          
          for (const row of dataRes.rows) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              return val;
            });
            
            backupSQL += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          backupSQL += '\n';
        }
      } catch (e) {
        console.log(`  ⚠️  Не вдалося отримати дані з ${tableName}: ${e.message}`);
      }
    }
    
    // Зберігаємо
    const fileName = `backup-${Date.now()}.sql`;
    fs.writeFileSync(fileName, backupSQL);
    
    const stats = fs.statSync(fileName);
    console.log(`\n✅ Бекап збережено: ${fileName}`);
    console.log(`📦 Розмір: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Також експортуємо список таблиць
    console.log('\n📋 Список таблиць:');
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`   • ${row.table_name} (${countRes.rows[0].count} рядків)`);
    }
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Зʼєднання закрито');
  }
}

// Запускаємо
backup();