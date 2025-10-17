import config from '@antfu/eslint-config';

export default config({
	typescript: true,
	vue: false,
	html: true,
	css: true,
	regexp: false,
	stylistic: {
		indent: 'tab',
		quotes: 'single',
		semi: 'last',
	},
	ignores: [
		'**/data/*.json',
		'*.config.js',
		'*.config.ts',
		'*.d.ts',
		'*.min.js',
		'*.min.css',
		'*.config.mjs',
	],
}, {
	rules: {
		'antfu/if-newline': 0,
		'antfu/consistent-chaining': 0,
		'antfu/top-level-function': 0,
		'antfu/no-top-level-await': 0,
		'perfectionist/sort-imports': 0,
	},
},

// ------------ STANDARD RULES ------------
{
	files: [
		'packages/**/*',
	],
	rules: {
		'no-console': 0,
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-use-before-define': 0,
		'no-useless-constructor': 0,
		'scss/vendorPrefix': 0,
		'func-call-spacing': 0,
		'no-new': 0,
		'no-cond-assign': 0,
		'array-bracket-spacing': 0,
		'prefer-promise-reject-errors': 0,
		'n/no-callback-literal': 0,
		'no-tabs': 0,
		'no-useless-return': 0,
		'operator-linebreak': ['error', 'before'],
		'keyword-spacing': ['error', {
				overrides: {
					catch: {
						before: true,
						after: true,
					},
				},
			},
		],
		'no-trailing-spaces': ['error', {
			ignoreComments: true,
			skipBlankLines: false,
		}],
		'space-before-function-paren': ['error', {
			anonymous: 'never',
			named: 'never',
			asyncArrow: 'always',
		}],
		'comma-dangle': ['error', {
			arrays: 'always-multiline',
			objects: 'always-multiline',
			imports: 'always-multiline',
			exports: 'always-multiline',
			functions: 'always-multiline',
		}],
	},
},

// ------------ STYLISTIC RULES ------------
{
	files: [
		'packages/**/*.ts',
	],
	rules: {
		'import/no-self-import': 0,
		'style/space-before-function-paren': 0,
		'style/padded-blocks': 0,
		'style/space-infix-ops': 0,
		'style/quote-props': ['error', 'consistent-as-needed'],
		'style/arrow-parens': ['error', 'as-needed'],
		'style/array-bracket-spacing': ['error', 'never', {
			singleValue: false,
			objectsInArrays: false,
			arraysInArrays: false,
		}],
		'style/member-delimiter-style': ['error', {
			multilineDetection: 'brackets',
			singleline: {
				delimiter: 'comma',
				requireLast: false,
			},
			multiline: {
				delimiter: 'comma',
				requireLast: true,
			},
		}],
		'style/keyword-spacing': ['error', {
			before: true,
			after: true,
			overrides: {
				catch: { before: true, after: true },
			},
		}],
		'style/brace-style': ['error', '1tbs', {
			allowSingleLine: true,
		}],
		'unicorn/consistent-function-scoping': 0,
		'regexp/optimal-quantifier-concatenation': 0,
		'import/consistent-type-specifier-style': 0,
	},
},

// ------------ TYPESCRIPT RULES ------------
{
	files: [
		'packages/**/*.ts',
		'packages/**/*.tsx',
		'packages/**/*.d.ts',
	],
	rules: {
		'ts/method-signature-style': 0,
		'ts/no-use-before-define': 0,
		'ts/no-unused-expressions': 0,
		'ts/consistent-type-definitions': 0,
		'ts/no-explicit-any': 0,
		'ts/explicit-member-accessibility': ['error'],
		'ts/interface-name-prefix': 0,
		'ts/camelcase': 0,
		'ts/no-useless-constructor': ['error'],
		'ts/explicit-module-boundary-types': 0,
		'ts/consistent-type-imports': 0,
		'ts/no-unused-vars': ['error', {
			varsIgnorePattern: 'ignore',
			argsIgnorePattern: 'ignore',
		}],
		'ts/ban-ts-comment': ['error', {
			'ts-expect-error': 'allow-with-description',
			'ts-ignore': 'allow-with-description',
			'ts-nocheck': 'allow-with-description',
			'ts-check': 'allow-with-description',
			minimumDescriptionLength: 25,
		}],
		'ts/naming-convention': ['error',
			{
				selector: 'default',
				format: ['PascalCase', 'camelCase', 'snake_case', 'UPPER_CASE'],
				leadingUnderscore: 'allow',
			},
			{
				selector: 'function',
				format: ['PascalCase', 'camelCase'],
				leadingUnderscore: 'forbid',
			},
			{
				selector: 'variable',
				format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
				leadingUnderscore: 'allow',
			},
			{
				selector: 'memberLike',
				format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
				leadingUnderscore: 'allow',
			},
			{
				selector: 'interface',
				format: ['PascalCase'],
				custom: {
					regex: '^I[A-Z]',
					match: true,
				},
			},
			{
				selector: 'property',
				format: null,
				filter: {
					regex: '[-]',
					match: true,
				},
			},
		],
	},
},

// ------------ JSON RULES ------------
{
	files: [
		'**/*.json',
	],
	rules: {
		'jsonc/sort-keys': 0,
	},
},

// ------------ TEST RULES ------------
{
	files: [
		'packages/**/*.spec.ts',
	],
	rules: {
		'test/prefer-lowercase-title': 0,
	},
},

// ------------ EDGE CASE RULES ------------
{
	files: [
		'packages/main.ts',
	],
	rules: {
		'import/order': 0,
	},
});
