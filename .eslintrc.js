module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'indent': ['off', 4],
        'no-trailing-spaces': 0,
        'space-before-function-paren': 0,
        'object-curly-spacing': 0,
        'no-use-before-define': 1,
        'no-redeclare': 2,
        'semi': [1, 'always'],
        'no-multiple-empty-lines': [1, {'max': 2}],
        'no-prototype-builtins': 0,
        'eqeqeq': 1,
        'no-shadow-restricted-names': 1,
        'no-eq-null': 2,
        'quotes': 0,
        'no-mixed-operators': 0,
        'padded-blocks': 1,
        'camelcase': 1,
        'curly': 0,
        'space-unary-ops': 0,
        'no-undef': 2,
        'prefer-const': 1,
        'vue/valid-template-root': 0,
        'no-tabs': 0,
        'one-var': 0,
        'spaced-comment': 0,
        'no-useless-return': 0,
        'eol-last': 0,
        'standard/no-callback-literal': 0,
        'no-new-func': 0,
        'quote-props': 0,
        'vue/no-use-v-if-with-v-for': 0,
        'no-multi-spaces': 0,
        'no-unused-expressions': 0,
        'handle-callback-err': 0
    }
};
