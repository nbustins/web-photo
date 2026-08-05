import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Eix I2 (analysis.md §3.9). warn fins que F4 acabi la migració; puja a error a T4.10.
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Property[key.name='fontFamily']",
          message: 'Usa var(--lt-font-*) en un .module.css, no fontFamily inline.',
        },
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}){1,2}$/]",
          message: 'Color literal prohibit. Usa un token semàntic --lt-color-*.',
        },
        {
          selector: "CallExpression[callee.object.name='window'][callee.property.name='matchMedia']",
          message: 'Usa useIsMobile() de @ui/hooks.',
        },
      ],
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            { group: ['**/pages/*/**'], message: "Un mòdul no importa d'un altre mòdul. Puja-ho a src/ui." },
            { group: ['antd/es/**'], message: 'Importa des de "antd", no de rutes internes.' },
          ],
        },
      ],
    },
  },
  {
    // Font única dels valors del sistema: aquí SÍ hi ha d'haver literals de color.
    files: ['src/styles/tokens.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Única implementació permesa de matchMedia (tota la resta hi passa per aquí).
    files: ['src/ui/hooks/useIsMobile.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
)
