export default {
  '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix'],
  'package.json': ['prettier --write'],
  '*.vue': ['prettier --write', 'eslint --fix', 'stylelint --fix'],
  '*.{scss,less,styl,html}': ['prettier --write', 'stylelint --fix'],
  '*.md': ['prettier --write'],
};
