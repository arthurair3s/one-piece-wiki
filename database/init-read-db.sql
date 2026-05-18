-- Script para criar o banco de dados de leitura automaticamente no primeiro boot do Docker
SELECT 'CREATE DATABASE grand_line_db_read'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'grand_line_db_read')\gexec
