
find . -path ./node_modules -prune -o -path './packages/*/node_modules' -prune -o -name 'tsconfig*.json' -exec echo '{}' ';'
