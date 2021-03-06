import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import {
	terser
} from 'rollup-plugin-terser'

export default [{

	input: 'client/index.js',
	output: [{
		file: 'lib/client.umd.js',
		// file: 'C:/OPENTEXT/support/kweliasync/client.umd.js',
		format: 'umd',
		name: 'sse-client',
		exports: 'named',
		sourcemap: true
	}],
	plugins: [
		resolve({
			browser: true
		}),
		commonjs(),
		babel({
			babelHelpers: 'bundled'
		}),
		terser(),
	]

}]