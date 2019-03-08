/*
 * @Author: TB 
 * @Date: 2019-03-08 13:23:55 
 * @Last Modified by: TB
 * @Last Modified time: 2019-03-08 13:51:30
 * 懒加载组件(需要webpack)
 */
import React from 'react';

export default function(dyanamicImport) {
	return class Lazyload extends React.Component {
		constructor(props) {
			super(props)
			this.state = {
				// replace module
				mod: null
			}
		}

		componentDidMount() {
			this.setState({
				mod: null
			})
			dyanamicImport().then((mod) => {
				this.setState({
					mod: mod.default ? mod.default : mod
				})
			})
		}

		// renderProps
		render() {
			const Module = this.state.mod
			return Module ? <Module {...this.props} /> : ''
		}
	}
}
