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
      // Eix I2 (analysis.md §3.9).
      'no-restricted-syntax': [
        'error',
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
        'error',
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
    // Font única dels valors del sistema i pont cap a antd: aquí SÍ hi ha
    // d'haver literals de color i fontFamily.
    files: ['src/styles/tokens.ts', 'src/styles/antd-theme.ts'],
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
  {
    // El router és qui coneix totes les pàgines: és la seva feina importar-les.
    files: ['src/router/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
)
