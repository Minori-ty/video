import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'next/no-html-link-for-pages': 'off', // 禁用这个规则，因为我们使用的是 App Router
      '@typescript-eslint/no-empty-interface': 'off', // 允许空接口
      '@typescript-eslint/no-empty-object-type': 'off', // 允许空对象类型
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ], // 忽略以_开头的变量
    },
    settings: {
      next: {
        rootDir: ['apps/client/admin/', 'apps/client/website/'],
      },
    },
  },
];

export default eslintConfig;
